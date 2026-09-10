/**
 * The circuit under test in the fault-isolation trainer: a 28 V DC gear
 * indicator lamp branch, the simplest thing that still has a breaker, a
 * switch, two wire runs and a load — enough for every classic failure to
 * present differently on a meter.
 *
 * 28 V DC is the standard aircraft bus voltage, so the readings a learner
 * sees here are the readings they would see on the airplane.
 */

import { type Element, type Netlist, OPEN_OHMS, resistanceBetween, solve } from './circuit'

export const BUS_VOLTS = 28

/** Circuit nodes, in order from the bus to the return. */
export const NODES = ['BUS', 'TP1', 'TP2', 'TP3', 'TP4', 'GND'] as const
export type NodeName = (typeof NODES)[number]

export type ComponentId = 'CB1' | 'S1' | 'W1' | 'LAMP' | 'W2'

export type FaultId =
  | 'none'
  | 'cb1-open'
  | 's1-open'
  | 'w1-open'
  | 'lamp-open'
  | 'w2-open'
  | 'w1-corroded'
  | 'lamp-shorted'

export type Fault = {
  id: FaultId
  /** The component a technician would replace. */
  culprit: ComponentId
  label: string
  /** Shown only after the learner commits to an answer. */
  explanation: string
}

export const FAULTS: Fault[] = [
  {
    id: 'cb1-open',
    culprit: 'CB1',
    label: 'Circuit breaker open',
    explanation: `CB1 has tripped. With no current anywhere, every point downstream sits at
      ground potential through the lamp, so the full 28 V appears across the breaker itself.`,
  },
  {
    id: 's1-open',
    culprit: 'S1',
    label: 'Switch failed open',
    explanation: `S1 is not making contact. TP1 sits at bus voltage, TP2 at ground, and the
      full 28 V drops across the switch.`,
  },
  {
    id: 'w1-open',
    culprit: 'W1',
    label: 'Wire run W1 broken',
    explanation: `The conductor between TP2 and TP3 is open. Bus voltage reaches TP2 and stops
      there, so the whole supply drops across that wire run.`,
  },
  {
    id: 'lamp-open',
    culprit: 'LAMP',
    label: 'Lamp filament open',
    explanation: `The filament has burned through. No current flows, so TP3 sits at bus voltage
      and TP4 at ground — the full 28 V across the lamp, with the lamp dark.`,
  },
  {
    id: 'w2-open',
    culprit: 'W2',
    label: 'Ground return broken',
    explanation: `The return path from TP4 to ground is open. Every point upstream, including
      TP4, floats up to bus voltage, and the 28 V drops across the return run.`,
  },
  {
    id: 'w1-corroded',
    culprit: 'W1',
    label: 'High resistance in W1',
    explanation: `A corroded splice has put roughly 220 Ω in series with the lamp. Current still
      flows and nothing reads as fully open, but the lamp is dim and W1 drops most of the supply —
      the failure a continuity check alone would miss.`,
  },
  {
    id: 'lamp-shorted',
    culprit: 'LAMP',
    label: 'Lamp shorted',
    explanation: `The lamp is shorted across its terminals. Current is high and TP3 and TP4 sit at
      nearly the same potential, so almost nothing drops across the lamp and it stays dark.`,
  },
]

/** Nominal, healthy component resistances in ohms. */
const NOMINAL: Record<ComponentId, number> = {
  CB1: 0.05,
  S1: 0.05,
  W1: 0.02,
  LAMP: 100,
  W2: 0.02,
}

/** Build the netlist for a given fault, with the switch open or closed. */
export function buildCircuit(fault: FaultId, switchClosed: boolean): Netlist {
  const r = { ...NOMINAL }

  if (fault === 'cb1-open') r.CB1 = OPEN_OHMS
  if (fault === 's1-open') r.S1 = OPEN_OHMS
  if (fault === 'w1-open') r.W1 = OPEN_OHMS
  if (fault === 'lamp-open') r.LAMP = OPEN_OHMS
  if (fault === 'w2-open') r.W2 = OPEN_OHMS
  if (fault === 'w1-corroded') r.W1 = 220

  // An open switch is not a fault; it is the control.
  if (!switchClosed) r.S1 = OPEN_OHMS

  const elements: Element[] = [
    { kind: 'vsource', id: 'V1', pos: 'BUS', neg: 'GND', volts: BUS_VOLTS },
    { kind: 'resistor', id: 'CB1', a: 'BUS', b: 'TP1', ohms: r.CB1 },
    { kind: 'resistor', id: 'S1', a: 'TP1', b: 'TP2', ohms: r.S1 },
    { kind: 'resistor', id: 'W1', a: 'TP2', b: 'TP3', ohms: r.W1 },
    { kind: 'resistor', id: 'LAMP', a: 'TP3', b: 'TP4', ohms: r.LAMP },
    { kind: 'resistor', id: 'W2', a: 'TP4', b: 'GND', ohms: r.W2 },
  ]

  // A shorted lamp is a filament that has been BYPASSED, not one that
  // turned into a wire. Modeling it as a parallel short keeps the
  // filament at its own resistance carrying almost nothing, which is
  // why the lamp goes dark while the branch current climbs.
  if (fault === 'lamp-shorted') {
    elements.push({ kind: 'resistor', id: 'SHORT', a: 'TP3', b: 'TP4', ohms: 0.002 })
  }

  return { ground: 'GND', elements }
}

export type MeterMode = 'volts' | 'ohms'

export type Reading = {
  mode: MeterMode
  value: number
  display: string
}

/** What the meter shows between two probe points. */
export function readMeter(
  fault: FaultId,
  switchClosed: boolean,
  mode: MeterMode,
  a: string,
  b: string,
): Reading {
  // Resistance is measured with the circuit de-energized, so the trainer
  // opens the breaker for an ohms reading the way a technician would
  // pull it before putting a meter across a component.
  const net = buildCircuit(fault, switchClosed)

  if (mode === 'ohms') {
    const r = resistanceBetween(net, a, b)
    return { mode, value: r, display: formatOhms(r) }
  }

  const s = solve(net)
  if (!s) return { mode, value: 0, display: 'ERR' }
  const v = (s.voltages[a] ?? 0) - (s.voltages[b] ?? 0)
  return { mode, value: v, display: formatVolts(v) }
}

/**
 * What the lamp is doing. Brightness follows the power dissipated in the
 * FILAMENT, not the current in the branch — a bypassed filament sits in a
 * branch carrying hundreds of amps and still glows not at all.
 */
export function lampState(fault: FaultId, switchClosed: boolean) {
  const net = buildCircuit(fault, switchClosed)
  const s = solve(net)
  if (!s) return { amps: 0, watts: 0, lit: false, dim: false }
  const amps = Math.abs(s.currents.LAMP ?? 0)
  const watts = amps * amps * NOMINAL.LAMP
  const nominalWatts = (BUS_VOLTS * BUS_VOLTS) / NOMINAL.LAMP
  return {
    amps,
    watts,
    // A filament needs most of its rated power before it glows usefully.
    lit: watts > nominalWatts * 0.5,
    dim: watts > nominalWatts * 0.002 && watts <= nominalWatts * 0.5,
  }
}

/** Total current drawn from the bus — what an ammeter in the feed sees. */
export function totalCurrent(fault: FaultId, switchClosed: boolean): number {
  const s = solve(buildCircuit(fault, switchClosed))
  return s ? Math.abs(s.currents.V1 ?? 0) : 0
}

export function formatVolts(v: number): string {
  // Floating point leaves a signed zero behind, and a meter reading
  // "-0 mV" looks broken. Collapse anything below the display's own
  // resolution to a true zero.
  const n = Math.abs(v) < 1e-4 ? 0 : v
  const a = Math.abs(n)
  if (a < 0.01) return `${(n * 1000).toFixed(0)} mV`
  return `${n.toFixed(2)} V`
}

export function formatOhms(r: number): string {
  if (!isFinite(r)) return 'O.L.'
  if (r >= 1000) return `${(r / 1000).toFixed(2)} kΩ`
  if (r < 1) return `${r.toFixed(3)} Ω`
  return `${r.toFixed(1)} Ω`
}

/** Pick a fault at random, excluding the healthy case. */
export function randomFault(exclude?: FaultId): Fault {
  const pool = FAULTS.filter((f) => f.id !== exclude)
  return pool[Math.floor(Math.random() * pool.length)]
}
