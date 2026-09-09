/**
 * A small DC circuit solver, and the faulted circuit the fault-isolation
 * trainer runs on.
 *
 * The solver is modified nodal analysis: build the conductance matrix,
 * add a row and column per voltage source, solve by Gaussian elimination
 * with partial pivoting. Nothing about the diagnosis is hardcoded —
 * probe readings fall out of the same solve, which is why every reading a
 * learner takes is consistent with every other one.
 *
 * That property is the whole point. A lookup table of "if fault X, meter
 * reads Y" survives exactly as long as the learner probes where the
 * author expected them to.
 */

export type Element =
  | { kind: 'resistor'; id: string; a: string; b: string; ohms: number }
  | { kind: 'vsource'; id: string; pos: string; neg: string; volts: number }

export type Netlist = {
  ground: string
  elements: Element[]
}

/** Resistance standing in for a broken conductor. */
export const OPEN_OHMS = 1e9

export type Solution = {
  /** Node name to volts, ground being exactly zero. */
  voltages: Record<string, number>
  /** Element id to amps, positive flowing a -> b. */
  currents: Record<string, number>
}

function nodeNames(net: Netlist): string[] {
  const seen = new Set<string>()
  for (const e of net.elements) {
    if (e.kind === 'resistor') {
      seen.add(e.a)
      seen.add(e.b)
    } else {
      seen.add(e.pos)
      seen.add(e.neg)
    }
  }
  seen.delete(net.ground)
  return [...seen].sort()
}

/**
 * Solve A x = b by Gaussian elimination with partial pivoting.
 * Returns null when the system is singular.
 */
export function gauss(A: number[][], b: number[]): number[] | null {
  const n = b.length
  if (n === 0) return []
  const m = A.map((row, i) => [...row, b[i]])

  for (let col = 0; col < n; col++) {
    let pivot = col
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(m[r][col]) > Math.abs(m[pivot][col])) pivot = r
    }
    if (Math.abs(m[pivot][col]) < 1e-18) return null
    const swap = m[col]
    m[col] = m[pivot]
    m[pivot] = swap

    for (let r = 0; r < n; r++) {
      if (r === col) continue
      const factor = m[r][col] / m[col][col]
      if (factor === 0) continue
      for (let c = col; c <= n; c++) m[r][c] -= factor * m[col][c]
    }
  }

  return m.map((row, i) => row[n] / m[i][i])
}

/** Stamp resistor conductances into a nodal matrix. */
function stampResistors(
  net: Netlist,
  index: Map<string, number>,
  A: number[][],
): void {
  for (const e of net.elements) {
    if (e.kind !== 'resistor') continue
    const g = 1 / Math.max(e.ohms, 1e-12)
    const ia = index.get(e.a) ?? -1
    const ib = index.get(e.b) ?? -1
    if (ia >= 0) A[ia][ia] += g
    if (ib >= 0) A[ib][ib] += g
    if (ia >= 0 && ib >= 0) {
      A[ia][ib] -= g
      A[ib][ia] -= g
    }
  }
}

/** Solve the network for node voltages and element currents. */
export function solve(net: Netlist): Solution | null {
  const nodes = nodeNames(net)
  const index = new Map(nodes.map((name, i) => [name, i]))
  const sources = net.elements.filter(
    (e): e is Extract<Element, { kind: 'vsource' }> => e.kind === 'vsource',
  )
  const n = nodes.length
  const m = sources.length
  const size = n + m

  const A: number[][] = Array.from({ length: size }, () => new Array<number>(size).fill(0))
  const z: number[] = new Array<number>(size).fill(0)

  stampResistors(net, index, A)

  // Each voltage source adds its own current as an unknown.
  sources.forEach((s, k) => {
    const row = n + k
    const ip = index.get(s.pos) ?? -1
    const ineg = index.get(s.neg) ?? -1
    if (ip >= 0) {
      A[row][ip] += 1
      A[ip][row] += 1
    }
    if (ineg >= 0) {
      A[row][ineg] -= 1
      A[ineg][row] -= 1
    }
    z[row] = s.volts
  })

  const x = gauss(A, z)
  if (!x) return null

  const voltages: Record<string, number> = { [net.ground]: 0 }
  nodes.forEach((name, i) => {
    voltages[name] = x[i]
  })

  const currents: Record<string, number> = {}
  for (const e of net.elements) {
    if (e.kind === 'resistor') {
      currents[e.id] = (voltages[e.a] - voltages[e.b]) / Math.max(e.ohms, 1e-12)
    }
  }
  sources.forEach((s, k) => {
    // MNA's unknown is current flowing pos -> neg inside the source,
    // the negative of what it delivers to the circuit.
    currents[s.id] = -x[n + k]
  })

  return { voltages, currents }
}

/**
 * Resistance between two nodes as an ohmmeter would read it on a
 * de-energised circuit. Injects a 1 A test current and reads the
 * resulting potential difference.
 *
 * Sources are REMOVED rather than shorted. Shorting them is the correct
 * small-signal model, but a technician de-energises by disconnecting the
 * supply, which leaves that branch open. Shorting it instead invents a
 * return path and makes every in-circuit reading come back far too low.
 */
export function resistanceBetween(net: Netlist, a: string, b: string): number {
  if (a === b) return 0

  const dead: Netlist = {
    ground: b,
    elements: net.elements.filter((e) => e.kind === 'resistor'),
  }

  const nodes = nodeNames(dead)
  const index = new Map(nodes.map((name, i) => [name, i]))
  const n = nodes.length
  const A: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0))
  const z: number[] = new Array<number>(n).fill(0)

  stampResistors(dead, index, A)

  const ia = index.get(a)
  if (ia === undefined) return Infinity
  z[ia] = 1

  const x = gauss(A, z)
  if (!x) return Infinity
  const r = x[ia]
  return r > OPEN_OHMS / 100 ? Infinity : r
}
