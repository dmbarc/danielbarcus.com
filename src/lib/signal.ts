/**
 * Signal generation and the trigger solver for the oscilloscope demo.
 *
 * Everything here is pure. The scope draws by asking `valueAt` for a
 * voltage at a time, so the trace is computed per frame rather than
 * replayed from a recording — the same way the Unity scope I built at
 * Carley drove its display.
 */

export type Waveform = 'sine' | 'square' | 'triangle' | 'sawtooth' | 'noise'
export type Coupling = 'dc' | 'ac' | 'gnd'
export type Slope = 'rising' | 'falling'

export const WAVEFORMS: Waveform[] = ['sine', 'square', 'triangle', 'sawtooth', 'noise']

/** A generator feeding one channel. */
export type Source = {
  waveform: Waveform
  /** Hz */
  frequency: number
  /** Volts, peak (so a sine spans 2 x amplitude peak-to-peak). */
  amplitude: number
  /** Volts of DC offset. */
  offset: number
  /** Fraction of a cycle, 0..1. */
  phase: number
}

export type Channel = {
  source: Source
  coupling: Coupling
  /** Volts per division. */
  voltsPerDiv: number
  /** Vertical position in divisions, positive is up. */
  position: number
  enabled: boolean
}

/** Real instruments step in a 1-2-5 sequence, so these do too. */
export const VOLTS_PER_DIV = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5] as const
export const TIME_PER_DIV = [
  1e-5, 2e-5, 5e-5, 1e-4, 2e-4, 5e-4, 1e-3, 2e-3, 5e-3, 1e-2,
] as const

/** Standard scope graticule. */
export const H_DIVS = 10
export const V_DIVS = 8

/**
 * One cycle of a waveform, normalised to -1..1, over phase p in [0,1).
 * `noise` ignores phase — it is noise.
 */
export function shape(waveform: Waveform, p: number): number {
  const t = p - Math.floor(p)
  switch (waveform) {
    case 'sine':
      return Math.sin(2 * Math.PI * t)
    case 'square':
      return t < 0.5 ? 1 : -1
    case 'triangle':
      if (t < 0.25) return 4 * t
      if (t < 0.75) return 2 - 4 * t
      return 4 * t - 4
    case 'sawtooth':
      return 2 * t - 1
    case 'noise':
      return Math.random() * 2 - 1
  }
}

/** Volts out of a generator at time t (seconds), before coupling. */
export function sourceValueAt(source: Source, t: number): number {
  const p = t * source.frequency + source.phase
  return source.amplitude * shape(source.waveform, p) + source.offset
}

/** Volts as the channel presents them, after coupling. */
export function channelValueAt(channel: Channel, t: number): number {
  if (channel.coupling === 'gnd') return 0
  const v = sourceValueAt(channel.source, t)
  // AC coupling blocks DC. For a generated signal the DC component is
  // exactly the offset, so removing it is exact rather than approximated
  // with a high-pass filter.
  return channel.coupling === 'ac' ? v - channel.source.offset : v
}

/**
 * The phase within one cycle at which the waveform crosses `level` volts
 * on the given slope, or null when it never does.
 *
 * Solving this analytically rather than scanning samples is what lets the
 * trace sit perfectly still: the window is anchored to an exact crossing,
 * not to the nearest sample that happened to be past the threshold.
 */
export function triggerPhase(
  source: Source,
  coupling: Coupling,
  level: number,
  slope: Slope,
): number | null {
  if (coupling === 'gnd' || source.waveform === 'noise') return null
  if (source.amplitude === 0) return null

  // Normalise the level into the shape's own -1..1 space.
  const dc = coupling === 'ac' ? 0 : source.offset
  const n = (level - dc) / source.amplitude
  if (n < -1 || n > 1) return null

  switch (source.waveform) {
    case 'sine': {
      // Rising crossing of sin(2*pi*p) = n is at asin(n)/(2*pi).
      const a = Math.asin(Math.max(-1, Math.min(1, n))) / (2 * Math.PI)
      return norm(slope === 'rising' ? a : 0.5 - a)
    }
    case 'square':
      // The only edges are at p = 0 (rising) and p = 0.5 (falling).
      if (Math.abs(n) >= 1) return null
      return slope === 'rising' ? 0 : 0.5
    case 'triangle':
      if (slope === 'rising') return norm(n >= 0 ? n / 4 : (n + 4) / 4)
      return norm((2 - n) / 4)
    case 'sawtooth':
      // A ramp only ever rises; the reset is a discontinuity, not a slope.
      if (slope === 'falling') return null
      return norm((n + 1) / 2)
    default:
      return null
  }
}

function norm(p: number): number {
  return p - Math.floor(p)
}

/**
 * The time to place at the left edge of the display so that the trigger
 * point lands at horizontal centre, matching a real scope's default.
 * Returns null when the channel will not trigger.
 */
export function triggerStartTime(
  channel: Channel,
  level: number,
  slope: Slope,
  window: number,
): number | null {
  const p = triggerPhase(channel.source, channel.coupling, level, slope)
  if (p === null) return null
  const { frequency, phase } = channel.source
  if (frequency <= 0) return null
  // sourceValueAt uses phase p = t*f + phase, so the crossing is at
  // t = (p - phase)/f. Any cycle will do; pick one far enough from zero
  // that the window never starts negative.
  const period = 1 / frequency
  const tTrigger = (p - phase) * period
  const cycles = Math.ceil((window / 2 + 1) / period)
  return tTrigger + cycles * period - window / 2
}

/** Peak-to-peak volts of what the channel shows. */
export function vpp(channel: Channel): number {
  if (channel.coupling === 'gnd') return 0
  if (channel.source.waveform === 'noise') return 2 * channel.source.amplitude
  return 2 * Math.abs(channel.source.amplitude)
}

/** RMS volts of what the channel shows, including any DC it passes. */
export function vrms(channel: Channel): number {
  if (channel.coupling === 'gnd') return 0
  const { waveform, amplitude } = channel.source
  const dc = channel.coupling === 'ac' ? 0 : channel.source.offset
  // RMS of the AC part, by waveform crest factor.
  let ac: number
  switch (waveform) {
    case 'sine':
      ac = Math.abs(amplitude) / Math.SQRT2
      break
    case 'square':
      ac = Math.abs(amplitude)
      break
    case 'triangle':
    case 'sawtooth':
      ac = Math.abs(amplitude) / Math.sqrt(3)
      break
    case 'noise':
      ac = Math.abs(amplitude) / Math.sqrt(3)
      break
  }
  return Math.sqrt(ac * ac + dc * dc)
}

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

export function formatVolts(v: number): string {
  // Collapse signed zero, so a control parked at centre reads "0 µV"
  // rather than "-0 µV".
  if (Math.abs(v) < 1e-9) return '0 µV'
  const a = Math.abs(v)
  if (a < 1e-3) return `${(v * 1e6).toFixed(0)} µV`
  if (a < 1) return `${(v * 1e3).toFixed(a < 0.1 ? 1 : 0)} mV`
  return `${v.toFixed(2)} V`
}

export function formatTime(s: number): string {
  const a = Math.abs(s)
  if (a < 1e-6) return `${(s * 1e9).toFixed(0)} ns`
  if (a < 1e-3) return `${(s * 1e6).toFixed(a < 1e-5 ? 1 : 0)} µs`
  if (a < 1) return `${(s * 1e3).toFixed(a < 1e-2 ? 2 : 1)} ms`
  return `${s.toFixed(2)} s`
}

export function formatFreq(hz: number): string {
  if (hz >= 1e6) return `${(hz / 1e6).toFixed(2)} MHz`
  if (hz >= 1e3) return `${(hz / 1e3).toFixed(hz < 1e4 ? 2 : 1)} kHz`
  return `${hz.toFixed(hz < 10 ? 1 : 0)} Hz`
}
