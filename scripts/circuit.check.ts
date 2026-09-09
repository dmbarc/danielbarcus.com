/**
 * Verification for the DC solver and the fault trainer's circuit.
 * Run with: npm run check:circuit
 *
 * Every expectation here is hand-calculable from Ohm's and Kirchhoff's
 * laws. If the solver disagrees with the physics, the trainer teaches
 * something false — which is the one failure a diagnostics trainer
 * cannot have.
 */

import { type Netlist, gauss, resistanceBetween, solve } from '../src/lib/circuit'
import {
  BUS_VOLTS,
  FAULTS,
  buildCircuit,
  lampState,
  readMeter,
  totalCurrent,
} from '../src/lib/faultTrainer'

let failures = 0

function check(name: string, ok: boolean, detail = '') {
  if (ok) {
    console.log(`  ok   ${name}`)
  } else {
    failures++
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

const near = (a: number, b: number, tol = 1e-6) => Math.abs(a - b) <= tol

console.log('\nlinear algebra')
{
  // 2x + y = 5 ; x - y = 1  ->  x = 2, y = 1
  const x = gauss(
    [
      [2, 1],
      [1, -1],
    ],
    [5, 1],
  )!
  check('solves a 2x2 system', near(x[0], 2, 1e-9) && near(x[1], 1, 1e-9))
  check('detects a singular system', gauss([[1, 1], [2, 2]], [1, 2]) === null)
  // Needs a pivot swap: first pivot is zero.
  const y = gauss(
    [
      [0, 1],
      [1, 0],
    ],
    [3, 4],
  )!
  check('pivots when the leading entry is zero', near(y[0], 4, 1e-9) && near(y[1], 3, 1e-9))
}

console.log('\ndivider, by hand')
{
  // 10 V across 100 + 300 ohms: the mid node must sit at 7.5 V.
  const net: Netlist = {
    ground: 'g',
    elements: [
      { kind: 'vsource', id: 'V', pos: 'a', neg: 'g', volts: 10 },
      { kind: 'resistor', id: 'R1', a: 'a', b: 'm', ohms: 100 },
      { kind: 'resistor', id: 'R2', a: 'm', b: 'g', ohms: 300 },
    ],
  }
  const s = solve(net)!
  check('mid node is 7.5 V', near(s.voltages.m, 7.5, 1e-9), `got ${s.voltages.m}`)
  check('loop current is 25 mA', near(s.currents.R1, 0.025, 1e-9), `got ${s.currents.R1}`)
  check('source delivers the same current', near(Math.abs(s.currents.V), 0.025, 1e-9))
  check('series resistance reads 400 ohms', near(resistanceBetween(net, 'a', 'g'), 400, 1e-6))
}

console.log('\nparallel resistance')
{
  // 100 || 100 = 50, measured with the source dead.
  const net: Netlist = {
    ground: 'g',
    elements: [
      { kind: 'resistor', id: 'R1', a: 'a', b: 'g', ohms: 100 },
      { kind: 'resistor', id: 'R2', a: 'a', b: 'g', ohms: 100 },
    ],
  }
  check('two 100 ohm in parallel read 50', near(resistanceBetween(net, 'a', 'g'), 50, 1e-6))
}

console.log('\nhealthy gear-lamp circuit')
{
  const s = solve(buildCircuit('none', true))!
  // Total loop: 0.05 + 0.05 + 0.02 + 100 + 0.02 = 100.14 ohms
  const expected = BUS_VOLTS / 100.14
  check('loop current matches Ohm law', near(s.currents.LAMP, expected, 1e-9),
    `got ${s.currents.LAMP}, expected ${expected}`)
  check('bus sits at 28 V', near(s.voltages.BUS, 28, 1e-9))
  check('ground is exactly zero', s.voltages.GND === 0)
  const drop = s.voltages.TP3 - s.voltages.TP4
  check('nearly all of the supply is across the lamp', drop > 27.9 && drop < 28)
  check('lamp is lit', lampState('none', true).lit)
  check('open switch puts the lamp out', !lampState('none', false).lit)
}

console.log('\nKirchhoff holds under every fault')
{
  let voltageLawOk = true
  let currentLawOk = true
  for (const f of [...FAULTS.map((x) => x.id), 'none' as const]) {
    const net = buildCircuit(f, true)
    const s = solve(net)
    if (!s) { voltageLawOk = false; break }
    // The drops around the single loop must sum to the source voltage.
    const sum =
      (s.voltages.BUS - s.voltages.TP1) +
      (s.voltages.TP1 - s.voltages.TP2) +
      (s.voltages.TP2 - s.voltages.TP3) +
      (s.voltages.TP3 - s.voltages.TP4) +
      (s.voltages.TP4 - s.voltages.GND)
    if (!near(sum, BUS_VOLTS, 1e-6)) voltageLawOk = false
    // One loop, so every element carries the same current — except when
    // the lamp is shorted, which genuinely creates a second branch.
    if (f !== 'lamp-shorted') {
      const ids = ['CB1', 'S1', 'W1', 'LAMP', 'W2']
      const first = s.currents[ids[0]]
      if (!ids.every((id) => near(s.currents[id], first, 1e-6))) currentLawOk = false
    } else {
      // KCL at the lamp node instead: in from W1, out through the
      // filament and the short.
      const into = s.currents.W1
      const out = s.currents.LAMP + s.currents.SHORT
      if (!near(into, out, 1e-6)) currentLawOk = false
    }
  }
  check('drops sum to the source voltage in every case', voltageLawOk)
  check('one loop carries one current in every case', currentLawOk)
}

console.log('\neach fault is distinguishable on a meter')
{
  // The classic rule: an open drops the entire supply across itself.
  const openAcross: [string, string, string][] = [
    ['cb1-open', 'BUS', 'TP1'],
    ['s1-open', 'TP1', 'TP2'],
    ['w1-open', 'TP2', 'TP3'],
    ['lamp-open', 'TP3', 'TP4'],
    ['w2-open', 'TP4', 'GND'],
  ]
  let allFullDrop = true
  const detail: string[] = []
  for (const [fault, a, b] of openAcross) {
    const r = readMeter(fault as never, true, 'volts', a, b)
    if (!(r.value > 27.9)) {
      allFullDrop = false
      detail.push(`${fault}: ${a}-${b} = ${r.display}`)
    }
  }
  check('an open drops the full supply across itself', allFullDrop, detail.join('; '))

  // And a healthy circuit does not — across the conductors. The lamp is
  // excluded because it is the load: dropping nearly the whole supply is
  // exactly what it is supposed to do, which is precisely why "full
  // supply across it" identifies an open conductor but never the load.
  let healthyNoDrop = true
  for (const [fault, a, b] of openAcross) {
    if (fault === 'lamp-open') continue
    if (readMeter('none', true, 'volts', a, b).value > 1) healthyNoDrop = false
  }
  check('a healthy circuit shows no such drop across its conductors', healthyNoDrop)
  check('but the healthy lamp does drop the supply, being the load',
    readMeter('none', true, 'volts', 'TP3', 'TP4').value > 27.9)

  // High resistance is the case continuity alone would miss.
  const corroded = lampState('w1-corroded', true)
  check('corroded splice leaves the lamp dim, not dark', corroded.dim && !corroded.lit)
  const w1Drop = readMeter('w1-corroded', true, 'volts', 'TP2', 'TP3').value
  check('and most of the supply drops across W1', w1Drop > 17, `got ${w1Drop.toFixed(2)} V`)

  // A short is not an open: little voltage, lots of current.
  const shorted = readMeter('lamp-shorted', true, 'volts', 'TP3', 'TP4')
  check('a shorted lamp drops almost nothing', shorted.value < 0.5, `got ${shorted.display}`)
  check('and the bus current climbs far above nominal',
    totalCurrent('lamp-shorted', true) > (BUS_VOLTS / 100) * 10,
    `got ${totalCurrent('lamp-shorted', true).toFixed(1)} A`)
  check('while the filament itself carries almost none',
    lampState('lamp-shorted', true).amps < BUS_VOLTS / 100)
  check('so the lamp is dark', !lampState('lamp-shorted', true).lit)
}

console.log('\nohmmeter behaviour')
{
  const open = readMeter('lamp-open', true, 'ohms', 'TP3', 'TP4')
  check('an open filament reads over-limit', open.display === 'O.L.')
  const good = readMeter('none', true, 'ohms', 'TP3', 'TP4')
  check('a good filament reads a real resistance',
    isFinite(good.value) && good.value > 1, `got ${good.display}`)
  check('probing a node against itself reads zero',
    readMeter('none', true, 'ohms', 'TP2', 'TP2').value === 0)
}

console.log(failures === 0 ? '\nAll checks passed.\n' : `\n${failures} FAILED\n`)
process.exit(failures === 0 ? 0 : 1)
