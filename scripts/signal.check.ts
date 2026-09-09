/**
 * Verification for the oscilloscope's signal maths. Run with:
 *   npx tsx scripts/signal.check.ts
 *
 * These assertions are the reason to trust the instrument: a scope that
 * draws a pretty trace but triggers on the wrong edge teaches the wrong
 * thing, which is exactly the failure mode that matters in a trainer.
 */

import {
  type Channel,
  H_DIVS,
  channelValueAt,
  shape,
  sourceValueAt,
  triggerPhase,
  triggerStartTime,
  vrms,
} from '../src/lib/signal'

let failures = 0

function check(name: string, condition: boolean, detail = '') {
  if (condition) {
    console.log(`  ok   ${name}`)
  } else {
    failures++
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

function near(a: number, b: number, tol = 1e-6) {
  return Math.abs(a - b) <= tol
}

function channel(over: Partial<Channel> = {}): Channel {
  return {
    source: { waveform: 'sine', frequency: 1000, amplitude: 2, offset: 0, phase: 0 },
    coupling: 'dc',
    voltsPerDiv: 1,
    position: 0,
    enabled: true,
    ...over,
  }
}

console.log('\nwaveform shapes')
check('sine starts at zero', near(shape('sine', 0), 0))
check('sine peaks at quarter cycle', near(shape('sine', 0.25), 1))
check('square is high then low', shape('square', 0.1) === 1 && shape('square', 0.9) === -1)
check('triangle peaks at quarter cycle', near(shape('triangle', 0.25), 1))
check('triangle troughs at three-quarter', near(shape('triangle', 0.75), -1))
check('sawtooth ramps -1 to 1', near(shape('sawtooth', 0), -1) && near(shape('sawtooth', 0.999), 1, 1e-2))
check('shapes stay within -1..1', [...Array(200)].every((_, i) => {
  const p = i / 200
  return (['sine', 'square', 'triangle', 'sawtooth'] as const).every((w) => {
    const v = shape(w, p)
    return v >= -1.0000001 && v <= 1.0000001
  })
}))

console.log('\ncoupling')
{
  const dc = channel({ source: { waveform: 'sine', frequency: 1000, amplitude: 2, offset: 1.5, phase: 0 } })
  const ac = channel({ coupling: 'ac', source: dc.source })
  const gnd = channel({ coupling: 'gnd', source: dc.source })
  // At phase 0 a sine is zero, so the reading is pure DC offset.
  check('DC coupling passes the offset', near(channelValueAt(dc, 0), 1.5))
  check('AC coupling removes the offset', near(channelValueAt(ac, 0), 0))
  check('GND reads zero', channelValueAt(gnd, 0) === 0)
}

console.log('\ntrigger phase')
check('sine rising through zero is at phase 0', near(triggerPhase(
  { waveform: 'sine', frequency: 1, amplitude: 1, offset: 0, phase: 0 }, 'dc', 0, 'rising')!, 0))
check('sine falling through zero is at half cycle', near(triggerPhase(
  { waveform: 'sine', frequency: 1, amplitude: 1, offset: 0, phase: 0 }, 'dc', 0, 'falling')!, 0.5))
check('level above the peak never triggers', triggerPhase(
  { waveform: 'sine', frequency: 1, amplitude: 1, offset: 0, phase: 0 }, 'dc', 1.5, 'rising') === null)
check('noise never triggers', triggerPhase(
  { waveform: 'noise', frequency: 1, amplitude: 1, offset: 0, phase: 0 }, 'dc', 0, 'rising') === null)
check('a ramp has no falling edge', triggerPhase(
  { waveform: 'sawtooth', frequency: 1, amplitude: 1, offset: 0, phase: 0 }, 'dc', 0, 'falling') === null)
check('offset shifts the trigger level with DC coupling', triggerPhase(
  { waveform: 'sine', frequency: 1, amplitude: 1, offset: 5, phase: 0 }, 'dc', 0, 'rising') === null,
  'level 0 is unreachable once the signal sits at 5 V')

console.log('\ntrigger anchoring — the trace must stand still')
{
  // For several levels, the signal at the center of the window must equal
  // the trigger level and be moving in the chosen direction.
  const levels = [-1.5, -0.8, 0, 0.5, 1.2]
  const c = channel()
  const window = 2e-4 * H_DIVS
  let allMatch = true
  let allRising = true
  for (const level of levels) {
    const tStart = triggerStartTime(c, level, 'rising', window)
    if (tStart === null) { allMatch = false; break }
    const center = tStart + window / 2
    const v = sourceValueAt(c.source, center)
    if (!near(v, level, 1e-6)) allMatch = false
    const ahead = sourceValueAt(c.source, center + 1e-9)
    if (ahead <= v) allRising = false
  }
  check('window center sits exactly on the trigger level', allMatch)
  check('and the signal is rising there', allRising)

  const falling = triggerStartTime(c, 0.5, 'falling', window)!
  const center = falling + window / 2
  check('falling slope anchors on a falling edge',
    near(sourceValueAt(c.source, center), 0.5, 1e-6) &&
    sourceValueAt(c.source, center + 1e-9) < 0.5)

  check('the window never starts before zero',
    levels.every((l) => (triggerStartTime(c, l, 'rising', window) ?? 0) >= 0))
}

console.log('\nmeasurements')
check('sine Vrms is A over root two', near(vrms(channel()), 2 / Math.SQRT2, 1e-9))
check('square Vrms equals A', near(vrms(channel({
  source: { waveform: 'square', frequency: 1000, amplitude: 2, offset: 0, phase: 0 } })), 2))
check('triangle Vrms is A over root three', near(vrms(channel({
  source: { waveform: 'triangle', frequency: 1000, amplitude: 2, offset: 0, phase: 0 } })), 2 / Math.sqrt(3), 1e-9))
check('DC offset raises Vrms in quadrature', near(vrms(channel({
  source: { waveform: 'sine', frequency: 1000, amplitude: 2, offset: 3, phase: 0 } })),
  Math.sqrt((2 / Math.SQRT2) ** 2 + 9), 1e-9))
check('AC coupling excludes the DC term', near(vrms(channel({
  coupling: 'ac',
  source: { waveform: 'sine', frequency: 1000, amplitude: 2, offset: 3, phase: 0 } })),
  2 / Math.SQRT2, 1e-9))

console.log(failures === 0 ? '\nAll checks passed.\n' : `\n${failures} FAILED\n`)
process.exit(failures === 0 ? 0 : 1)
