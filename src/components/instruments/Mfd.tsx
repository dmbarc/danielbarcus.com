import { useEffect, useMemo, useRef, useState } from 'react'

import {
  type Aircraft,
  type SystemFault,
  annunciators,
  formatClock,
  formatHeading,
  initialAircraft,
  step,
} from '../../lib/aircraft'

type PageId = 'eng' | 'fuel' | 'elec' | 'hyd' | 'cdu'

const PAGES: { id: PageId; key: string; label: string }[] = [
  { id: 'eng', key: 'L1', label: 'ENG' },
  { id: 'fuel', key: 'L2', label: 'FUEL' },
  { id: 'elec', key: 'L3', label: 'ELEC' },
  { id: 'hyd', key: 'L4', label: 'HYD' },
  { id: 'cdu', key: 'L5', label: 'CDU' },
]

const FAULT_KEYS: { id: SystemFault; key: string; label: string }[] = [
  { id: 'gen1-offline', key: 'R1', label: 'GEN 1' },
  { id: 'hyd2-loss', key: 'R2', label: 'HYD 2' },
  { id: 'eng2-flameout', key: 'R3', label: 'ENG 2' },
  { id: 'fuel-leak-left', key: 'R4', label: 'LEAK' },
]

/** A labelled value in the display's own grid. */
function Field({
  label,
  value,
  unit,
  tone = 'normal',
}: {
  label: string
  value: string
  unit?: string
  tone?: 'normal' | 'caution' | 'warning' | 'off'
}) {
  const colour =
    tone === 'warning'
      ? 'text-[#ff6b5a]'
      : tone === 'caution'
        ? 'text-caution'
        : tone === 'off'
          ? 'text-muted'
          : 'text-cyan'
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line/50 py-1.5">
      <span className="silkscreen text-muted">{label}</span>
      <span className={`font-mono text-sm tabular-nums ${colour}`}>
        {value}
        {unit && <span className="ml-1 text-[0.65rem] text-muted">{unit}</span>}
      </span>
    </div>
  )
}

/** A horizontal tape gauge with a redline. */
function Tape({
  label,
  value,
  max,
  limit,
  unit,
}: {
  label: string
  value: number
  max: number
  limit: number
  unit: string
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  const limitPct = (limit / max) * 100
  const over = value > limit
  return (
    <div className="py-1.5">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="silkscreen text-muted">{label}</span>
        <span
          className={`font-mono text-sm tabular-nums ${over ? 'text-[#ff6b5a]' : 'text-cyan'}`}
        >
          {value.toFixed(1)}
          <span className="ml-1 text-[0.65rem] text-muted">{unit}</span>
        </span>
      </div>
      <div className="relative h-2 w-full bg-screen">
        <div
          className={`h-full ${over ? 'bg-[#ff6b5a]' : 'bg-cyan'}`}
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-0 h-full w-px bg-caution"
          style={{ left: `${limitPct}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}

/**
 * A multi-function display: softkeys down the bezel, one page shown at a
 * time, and a scratchpad line at the bottom the way a CDU works.
 *
 * The systems model in lib/aircraft.ts runs whether or not its page is
 * open — switch to FUEL after a minute on ENG and the tanks have been
 * burning down the whole time. Annunciators are derived from values
 * against limits, never from the fault list, so a light means a limit was
 * actually crossed.
 */
export function Mfd() {
  const [aircraft, setAircraft] = useState<Aircraft>(initialAircraft)
  const [page, setPage] = useState<PageId>('eng')
  const [faults, setFaults] = useState<Set<SystemFault>>(() => new Set())
  const [scratchpad, setScratchpad] = useState('')
  const [message, setMessage] = useState('SYSTEMS NOMINAL')
  const faultsRef = useRef(faults)

  useEffect(() => {
    faultsRef.current = faults
  })

  // One clock for the whole aircraft, independent of what is displayed.
  useEffect(() => {
    const id = window.setInterval(() => {
      setAircraft((a) => step(a, 0.5, faultsRef.current))
    }, 500)
    return () => window.clearInterval(id)
  }, [])

  const lights = useMemo(() => annunciators(aircraft), [aircraft])
  const totalFuel = aircraft.fuel.left + aircraft.fuel.right + aircraft.fuel.aux

  function toggleFault(f: SystemFault) {
    setFaults((prev) => {
      const next = new Set(prev)
      if (next.has(f)) {
        next.delete(f)
        setMessage(`${f.toUpperCase()} CLEARED`)
      } else {
        next.add(f)
        setMessage(`${f.toUpperCase()} INJECTED`)
      }
      return next
    })
  }

  function cduKey(k: string) {
    if (k === 'CLR') {
      setScratchpad((s) => s.slice(0, -1))
      return
    }
    if (k === 'EXEC') {
      const entry = scratchpad.trim()
      if (!entry) {
        setMessage('NO ENTRY')
        return
      }
      const hdg = Number(entry)
      if (Number.isFinite(hdg) && hdg >= 0 && hdg <= 360) {
        setAircraft((a) => ({ ...a, heading: hdg }))
        setMessage(`HEADING SET ${formatHeading(hdg)}`)
      } else {
        setMessage('INVALID ENTRY')
      }
      setScratchpad('')
      return
    }
    setScratchpad((s) => (s.length < 6 ? s + k : s))
  }

  return (
    <div className="flex flex-col gap-px bg-line">
      <div className="bg-panel p-3">
        <div className="grid gap-2 sm:grid-cols-[auto_1fr_auto]">
          {/* Left bezel: page keys */}
          <div className="flex gap-2 sm:flex-col sm:justify-center">
            {PAGES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPage(p.id)}
                aria-pressed={page === p.id}
                className={`min-w-[52px] border px-2 py-2.5 font-mono text-[0.6rem] leading-tight
                            tracking-wider transition-colors ${
                              page === p.id
                                ? 'border-cyan bg-cyan text-screen'
                                : 'border-line bg-screen text-muted hover:border-cyan hover:text-cyan'
                            }`}
              >
                <span className="block opacity-60">{p.key}</span>
                {p.label}
              </button>
            ))}
          </div>

          {/* Display */}
          <div className="scanlines min-h-[380px] border border-line bg-screen">
            {/* Status strip */}
            <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-b border-line px-3 py-1.5 silkscreen text-muted">
              <span>{PAGES.find((p) => p.id === page)?.label} PAGE</span>
              <span className={lights.length ? 'text-caution' : 'text-status'}>
                {lights.length ? `${lights.length} ADVISORY` : 'NO ADVISORIES'}
              </span>
              <span className="tabular-nums">ET {formatClock(aircraft.time)}</span>
            </div>

            <div className="p-4">
              {page === 'eng' && (
                <div className="grid gap-x-6 sm:grid-cols-2">
                  {aircraft.engines.map((e, i) => (
                    <div key={i}>
                      <p
                        className={`silkscreen mb-2 ${e.running ? 'text-cyan' : 'text-[#ff6b5a]'}`}
                      >
                        Engine {i + 1} {e.running ? '' : '— OUT'}
                      </p>
                      <Tape label="Ng" value={e.ng} max={110} limit={102} unit="%" />
                      <Tape label="Torque" value={e.torque} max={120} limit={100} unit="%" />
                      <Field
                        label="TOT"
                        value={e.tot.toFixed(0)}
                        unit="°C"
                        tone={e.tot > 850 ? 'warning' : 'normal'}
                      />
                      <Field
                        label="Fuel flow"
                        value={e.fuelFlow.toFixed(0)}
                        unit="pph"
                        tone={e.running ? 'normal' : 'off'}
                      />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <Field
                      label="Rotor RPM"
                      value={aircraft.rotorRpm.toFixed(1)}
                      unit="%"
                      tone={aircraft.rotorRpm < 95 ? 'warning' : 'normal'}
                    />
                  </div>
                </div>
              )}

              {page === 'fuel' && (
                <div>
                  <Field
                    label="Left tank"
                    value={aircraft.fuel.left.toFixed(0)}
                    unit="lb"
                    tone={aircraft.fuel.left < 400 ? 'warning' : 'normal'}
                  />
                  <Field label="Right tank" value={aircraft.fuel.right.toFixed(0)} unit="lb" />
                  <Field label="Auxiliary" value={aircraft.fuel.aux.toFixed(0)} unit="lb" />
                  <Field
                    label="Total"
                    value={totalFuel.toFixed(0)}
                    unit="lb"
                    tone={totalFuel < 1200 ? 'warning' : 'normal'}
                  />
                  <Field
                    label="Imbalance"
                    value={Math.abs(aircraft.fuel.left - aircraft.fuel.right).toFixed(0)}
                    unit="lb"
                    tone={
                      Math.abs(aircraft.fuel.left - aircraft.fuel.right) > 300 ? 'caution' : 'normal'
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setAircraft((a) => ({
                        ...a,
                        fuel: { ...a.fuel, crossfeedOpen: !a.fuel.crossfeedOpen },
                      }))
                    }
                    className={`mt-3 border px-3 py-2 silkscreen ${
                      aircraft.fuel.crossfeedOpen
                        ? 'border-cyan bg-cyan text-screen'
                        : 'border-line text-muted hover:border-cyan hover:text-cyan'
                    }`}
                  >
                    Crossfeed {aircraft.fuel.crossfeedOpen ? 'open' : 'closed'}
                  </button>
                </div>
              )}

              {page === 'elec' && (
                <div>
                  <Field
                    label="Essential bus"
                    value={aircraft.electrical.busVolts.toFixed(1)}
                    unit="V"
                    tone={aircraft.electrical.busVolts < 24 ? 'warning' : 'normal'}
                  />
                  <Field
                    label="Generator 1"
                    value={aircraft.electrical.generator1 ? 'ONLINE' : 'OFFLINE'}
                    tone={aircraft.electrical.generator1 ? 'normal' : 'caution'}
                  />
                  <Field
                    label="Generator 2"
                    value={aircraft.electrical.generator2 ? 'ONLINE' : 'OFFLINE'}
                    tone={aircraft.electrical.generator2 ? 'normal' : 'caution'}
                  />
                  <Field
                    label="Source"
                    value={aircraft.electrical.batteryOnly ? 'BATTERY' : 'GENERATOR'}
                    tone={aircraft.electrical.batteryOnly ? 'warning' : 'normal'}
                  />
                </div>
              )}

              {page === 'hyd' && (
                <div>
                  <Tape
                    label="System 1"
                    value={aircraft.hydraulics.system1}
                    max={3500}
                    limit={3200}
                    unit="psi"
                  />
                  <Tape
                    label="System 2"
                    value={aircraft.hydraulics.system2}
                    max={3500}
                    limit={3200}
                    unit="psi"
                  />
                  <Field
                    label="Gear"
                    value={aircraft.gear.toUpperCase()}
                    tone={aircraft.gear === 'transit' ? 'caution' : 'normal'}
                  />
                  <Field label="Heading" value={formatHeading(aircraft.heading)} />
                  <Field label="Altitude" value={aircraft.altitude.toFixed(0)} unit="ft" />
                </div>
              )}

              {page === 'cdu' && (
                <div>
                  <p className="silkscreen mb-3 text-cyan">Heading select</p>
                  <p className="mb-4 text-[0.8125rem] leading-relaxed text-muted">
                    Key a heading of 0 to 360 into the scratchpad, then EXEC. CLR backspaces.
                    Invalid entries are rejected into the message line, the way a real CDU refuses
                    an entry rather than silently accepting it.
                  </p>
                  <div className="grid max-w-[240px] grid-cols-3 gap-px bg-line">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLR', '0', 'EXEC'].map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => cduKey(k)}
                        className="bg-screen px-2 py-3 font-mono text-xs text-cyan
                                   hover:bg-cyan hover:text-screen"
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Field label="Current heading" value={formatHeading(aircraft.heading)} />
                  </div>
                </div>
              )}
            </div>

            {/* Annunciator panel */}
            <div className="border-t border-line px-3 py-2">
              {lights.length === 0 ? (
                <span className="silkscreen text-status">● All systems nominal</span>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {lights.map((l) => (
                    <span
                      key={l.id}
                      className={`silkscreen border px-2 py-1 ${
                        l.severity === 'warning'
                          ? 'border-[#ff6b5a]/60 bg-[#ff6b5a]/10 text-[#ff6b5a]'
                          : l.severity === 'caution'
                            ? 'border-caution/60 bg-caution/10 text-caution'
                            : 'border-line text-muted'
                      }`}
                    >
                      {l.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Scratchpad / message line */}
            <div className="flex items-center justify-between gap-3 border-t border-line px-3 py-2">
              <span className="font-mono text-xs text-caution">{message}</span>
              <span className="font-mono text-sm text-bright tabular-nums">
                {scratchpad || '□□□'}
              </span>
            </div>
          </div>

          {/* Right bezel: fault injection */}
          <div className="flex gap-2 sm:flex-col sm:justify-center">
            {FAULT_KEYS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => toggleFault(f.id)}
                aria-pressed={faults.has(f.id)}
                className={`min-w-[52px] border px-2 py-2.5 font-mono text-[0.6rem] leading-tight
                            tracking-wider transition-colors ${
                              faults.has(f.id)
                                ? 'border-caution bg-caution text-screen'
                                : 'border-line bg-screen text-muted hover:border-caution hover:text-caution'
                            }`}
              >
                <span className="block opacity-60">{f.key}</span>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-3 text-[0.75rem] leading-relaxed text-muted">
          The right-hand keys inject faults. Nothing on the display reads the fault list — every
          annunciator is a value against a limit, so lose HYD 2 and watch the pressure bleed down
          through <span className="text-caution">low pressure</span> to{' '}
          <span className="text-[#ff6b5a]">pressure lost</span> as it crosses each one. Leave a
          page and come back; the aircraft kept running while you were away.
        </p>
      </div>
    </div>
  )
}
