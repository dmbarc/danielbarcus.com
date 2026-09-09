/**
 * A small systems model for the multi-function display.
 *
 * The point of an MFD is that it is a window onto systems that exist
 * whether or not you are looking at them. So the state lives here and
 * advances on its own clock; the display only ever reads it. Pages are
 * views, not owners — which is exactly the structure that made the
 * CH-53K MFD work worth building once and paging many times.
 *
 * The airframe is invented. Everything real about the CH-53K stays where
 * it belongs.
 */

export type EngineState = {
  /** Gas generator speed, percent. */
  ng: number
  /** Turbine outlet temperature, celsius. */
  tot: number
  /** Torque, percent. */
  torque: number
  /** Fuel flow, pounds per hour. */
  fuelFlow: number
  running: boolean
}

export type FuelState = {
  /** Pounds remaining per tank. */
  left: number
  right: number
  aux: number
  crossfeedOpen: boolean
}

export type HydraulicState = {
  /** PSI. */
  system1: number
  system2: number
}

export type ElectricalState = {
  /** Volts DC on the essential bus. */
  busVolts: number
  generator1: boolean
  generator2: boolean
  batteryOnly: boolean
}

export type GearState = 'up' | 'down' | 'transit'

export type Aircraft = {
  /** Seconds since power-up. */
  time: number
  engines: [EngineState, EngineState]
  fuel: FuelState
  hydraulics: HydraulicState
  electrical: ElectricalState
  gear: GearState
  /** Indicated airspeed, knots. */
  airspeed: number
  /** Pressure altitude, feet. */
  altitude: number
  /** Magnetic heading, degrees. */
  heading: number
  /** Rotor speed, percent. */
  rotorRpm: number
}

export const NOMINAL_BUS_VOLTS = 28

export function initialAircraft(): Aircraft {
  return {
    time: 0,
    engines: [
      { ng: 92.4, tot: 640, torque: 58, fuelFlow: 820, running: true },
      { ng: 92.1, tot: 634, torque: 57, fuelFlow: 812, running: true },
    ],
    fuel: { left: 2400, right: 2380, aux: 900, crossfeedOpen: false },
    hydraulics: { system1: 3050, system2: 3020 },
    electrical: {
      busVolts: NOMINAL_BUS_VOLTS,
      generator1: true,
      generator2: true,
      batteryOnly: false,
    },
    gear: 'down',
    airspeed: 0,
    altitude: 240,
    heading: 187,
    rotorRpm: 100,
  }
}

/** Faults the crew can inject to watch the annunciators respond. */
export type SystemFault = 'gen1-offline' | 'hyd2-loss' | 'eng2-flameout' | 'fuel-leak-left'

export type Annunciator = {
  id: string
  label: string
  severity: 'caution' | 'warning' | 'advisory'
}

/**
 * Advance the model by dt seconds. Faults are applied as forces on the
 * state rather than as flags the display reads, so an annunciator lights
 * because a value crossed a limit — never because a fault was declared.
 */
export function step(a: Aircraft, dt: number, faults: Set<SystemFault>): Aircraft {
  const next: Aircraft = structuredClone(a)
  next.time += dt

  // A slow wander so the panel looks alive without looking random.
  const wobble = (base: number, amp: number, period: number, phase = 0) =>
    base + Math.sin((next.time / period + phase) * Math.PI * 2) * amp

  const eng2Out = faults.has('eng2-flameout')

  next.engines[0] = {
    ng: wobble(92.4, 0.4, 17),
    tot: wobble(640, 6, 23),
    // The live engine takes up the load when the other quits.
    torque: eng2Out ? wobble(88, 1.5, 13) : wobble(58, 1.2, 19),
    fuelFlow: eng2Out ? wobble(1180, 20, 29) : wobble(820, 12, 29),
    running: true,
  }

  next.engines[1] = eng2Out
    ? { ng: Math.max(0, a.engines[1].ng - dt * 9), tot: Math.max(180, a.engines[1].tot - dt * 40),
        torque: 0, fuelFlow: 0, running: false }
    : { ng: wobble(92.1, 0.4, 17, 0.4), tot: wobble(634, 6, 23, 0.4),
        torque: wobble(57, 1.2, 19, 0.4), fuelFlow: wobble(812, 12, 29, 0.4), running: true }

  // Fuel burns from what the engines are actually drawing.
  const burn = ((next.engines[0].fuelFlow + next.engines[1].fuelFlow) / 3600) * dt
  const leak = faults.has('fuel-leak-left') ? dt * 4.5 : 0
  if (next.fuel.crossfeedOpen) {
    const half = burn / 2
    next.fuel.left = Math.max(0, next.fuel.left - half - leak)
    next.fuel.right = Math.max(0, next.fuel.right - half)
  } else {
    next.fuel.left = Math.max(0, next.fuel.left - burn / 2 - leak)
    next.fuel.right = Math.max(0, next.fuel.right - burn / 2)
  }

  // Hydraulics: system 2 bleeds down when its pump is lost.
  next.hydraulics.system1 = wobble(3050, 25, 11)
  next.hydraulics.system2 = faults.has('hyd2-loss')
    ? Math.max(0, a.hydraulics.system2 - dt * 420)
    : wobble(3020, 25, 11, 0.5)

  // Electrical: one generator carries the bus; on battery it sags.
  const gen1 = !faults.has('gen1-offline')
  const gen2 = !eng2Out
  next.electrical.generator1 = gen1
  next.electrical.generator2 = gen2
  next.electrical.batteryOnly = !gen1 && !gen2
  next.electrical.busVolts = next.electrical.batteryOnly
    ? Math.max(22, a.electrical.busVolts - dt * 0.25)
    : wobble(NOMINAL_BUS_VOLTS, 0.15, 7)

  next.rotorRpm = eng2Out ? wobble(97.5, 0.6, 9) : wobble(100, 0.4, 9)
  next.heading = (a.heading + dt * 0.6) % 360
  next.altitude = wobble(240, 12, 31)

  return next
}

/**
 * Annunciators, derived from the state. Nothing here consults the fault
 * list — every light is a value against a limit, which is why injecting
 * a fault and watching the right caption appear proves the model rather
 * than the wiring.
 */
export function annunciators(a: Aircraft): Annunciator[] {
  const out: Annunciator[] = []

  if (!a.engines[1].running || a.engines[1].ng < 50) {
    out.push({ id: 'eng2', label: 'No. 2 engine out', severity: 'warning' })
  }
  if (!a.engines[0].running || a.engines[0].ng < 50) {
    out.push({ id: 'eng1', label: 'No. 1 engine out', severity: 'warning' })
  }
  if (a.hydraulics.system2 < 2000) {
    out.push({
      id: 'hyd2',
      label: a.hydraulics.system2 < 500 ? 'HYD 2 pressure lost' : 'HYD 2 low pressure',
      severity: a.hydraulics.system2 < 500 ? 'warning' : 'caution',
    })
  }
  if (a.hydraulics.system1 < 2000) {
    out.push({ id: 'hyd1', label: 'HYD 1 low pressure', severity: 'caution' })
  }
  if (!a.electrical.generator1) {
    out.push({ id: 'gen1', label: 'GEN 1 offline', severity: 'caution' })
  }
  if (!a.electrical.generator2) {
    out.push({ id: 'gen2', label: 'GEN 2 offline', severity: 'caution' })
  }
  if (a.electrical.batteryOnly) {
    out.push({ id: 'batt', label: 'Battery power only', severity: 'warning' })
  }
  if (a.electrical.busVolts < 24) {
    out.push({ id: 'volt', label: 'Essential bus low voltage', severity: 'warning' })
  }

  const totalFuel = a.fuel.left + a.fuel.right + a.fuel.aux
  if (totalFuel < 1200) {
    out.push({ id: 'fuel', label: 'Fuel low', severity: 'warning' })
  }
  // An imbalance the crew should notice before it becomes a handling issue.
  if (Math.abs(a.fuel.left - a.fuel.right) > 300) {
    out.push({ id: 'imbal', label: 'Fuel imbalance', severity: 'caution' })
  }
  if (a.rotorRpm < 95) {
    out.push({ id: 'rotor', label: 'Rotor RPM low', severity: 'warning' })
  }
  if (a.gear === 'transit') {
    out.push({ id: 'gear', label: 'Gear in transit', severity: 'advisory' })
  }

  return out
}

export function formatHeading(deg: number): string {
  const d = Math.round(deg) % 360
  return `${String(d === 0 ? 360 : d).padStart(3, '0')}°`
}

export function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
