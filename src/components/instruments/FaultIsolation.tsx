import { useMemo, useState } from 'react'

import {
  type ComponentId,
  type Fault,
  type MeterMode,
  lampState,
  randomFault,
  readMeter,
  totalCurrent,
} from '../../lib/faultTrainer'
import { ControlGroup, Segmented } from '../ui/Control'

const WIRE = '#7e7660'
const INK = '#b9ae92'
const LABEL = '#7e7660'
const PROBE_A = '#ffb000'
const PROBE_B = '#4ea1c4'
const CULPRIT = '#e8a33d'

/** Probe points, positioned to match the schematic below. */
const POINTS: { node: string; x: number; y: number; label: string }[] = [
  { node: 'BUS', x: 60, y: 70, label: 'BUS' },
  { node: 'TP1', x: 165, y: 70, label: 'TP1' },
  { node: 'TP2', x: 270, y: 70, label: 'TP2' },
  { node: 'TP3', x: 425, y: 70, label: 'TP3' },
  { node: 'TP4', x: 545, y: 70, label: 'TP4' },
  { node: 'GND', x: 320, y: 190, label: 'GND' },
]

const COMPONENTS: { id: ComponentId; label: string }[] = [
  { id: 'CB1', label: 'CB1 — circuit breaker' },
  { id: 'S1', label: 'S1 — gear switch' },
  { id: 'W1', label: 'W1 — feed wire run' },
  { id: 'LAMP', label: 'LAMP — indicator' },
  { id: 'W2', label: 'W2 — ground return' },
]

type LogEntry = { mode: MeterMode; a: string; b: string; display: string }

/**
 * A fault-isolation trainer on a 28 V DC gear indicator branch.
 *
 * A fault is injected at random and the learner isolates it by probing
 * test points. Every reading comes from solving the faulted network, so
 * the readings are mutually consistent — probe in an order the author
 * never anticipated and the meter still tells the truth.
 */
export function FaultIsolation() {
  const [fault, setFault] = useState<Fault>(() => randomFault())
  const [switchClosed, setSwitchClosed] = useState(true)
  const [mode, setMode] = useState<MeterMode>('volts')
  const [probeA, setProbeA] = useState<string>('TP2')
  const [probeB, setProbeB] = useState<string>('GND')
  const [log, setLog] = useState<LogEntry[]>([])
  const [answer, setAnswer] = useState<ComponentId | ''>('')
  const [verdict, setVerdict] = useState<'right' | 'wrong' | null>(null)

  const reading = useMemo(
    () => readMeter(fault.id, switchClosed, mode, probeA, probeB),
    [fault, switchClosed, mode, probeA, probeB],
  )
  const lamp = useMemo(() => lampState(fault.id, switchClosed), [fault, switchClosed])
  const amps = useMemo(() => totalCurrent(fault.id, switchClosed), [fault, switchClosed])

  function probe(node: string) {
    // Clicking cycles A then B, so two clicks set up any measurement.
    if (probeA === node) return
    if (!probeB || probeA) {
      setProbeB(probeA)
      setProbeA(node)
    } else {
      setProbeA(node)
    }
  }

  function record() {
    setLog((l) =>
      [{ mode, a: probeA, b: probeB, display: reading.display }, ...l].slice(0, 8),
    )
  }

  function newFault() {
    setFault(randomFault(fault.id))
    setLog([])
    setAnswer('')
    setVerdict(null)
    setSwitchClosed(true)
    setMode('volts')
  }

  function commit() {
    if (!answer) return
    setVerdict(answer === fault.culprit ? 'right' : 'wrong')
  }

  const revealed = verdict !== null
  const lampFill = lamp.lit ? PROBE_A : lamp.dim ? '#8a6a1e' : '#2a2619'

  /** Highlight a component once the answer is revealed. */
  const strokeFor = (id: ComponentId) =>
    revealed && id === fault.culprit ? CULPRIT : INK
  const widthFor = (id: ComponentId) => (revealed && id === fault.culprit ? 3 : 2)

  return (
    <div className="flex flex-col gap-px bg-line">
      {/* ---------------- Schematic ---------------- */}
      <div className="bg-panel p-3">
        <div className="overflow-x-auto border-2 border-line bg-screen">
          <svg
            viewBox="0 0 640 240"
            role="img"
            aria-label="Schematic of a 28 volt gear indicator lamp circuit with test points"
            className="block h-auto w-full min-w-[560px]"
          >
            {/* Loop conductors */}
            <g stroke={WIRE} strokeWidth="2" fill="none">
              <path d="M60 70 H90" />
              <path d="M140 70 H195" />
              <path d="M245 70 H290" />
              <path d="M400 70 H460" />
              <path d="M510 70 H580" />
              <path d="M580 70 V190" />
              <path d="M580 190 H60" />
              <path d="M60 190 V70" />
            </g>

            {/* W1 feed run, drawn as its own segment with a splice */}
            <g stroke={strokeFor('W1')} strokeWidth={widthFor('W1')} fill="none">
              <path d="M290 70 H400" />
            </g>
            <circle cx="345" cy="70" r="3.5" fill={strokeFor('W1')} />
            <text x="345" y="52" fill={LABEL} fontSize="11" textAnchor="middle" fontFamily="monospace">
              W1
            </text>

            {/* W2 ground return along the bottom */}
            <g stroke={strokeFor('W2')} strokeWidth={widthFor('W2')} fill="none">
              <path d="M580 190 H60" />
            </g>
            <text x="450" y="182" fill={LABEL} fontSize="11" textAnchor="middle" fontFamily="monospace">
              W2
            </text>

            {/* Battery / bus */}
            <g stroke={INK} strokeWidth="2">
              <path d="M50 116 H70" />
              <path d="M56 126 H64" />
              <path d="M50 136 H70" />
              <path d="M56 146 H64" />
            </g>
            <text x="20" y="132" fill={LABEL} fontSize="11" fontFamily="monospace">
              28V
            </text>

            {/* CB1 breaker */}
            <g stroke={strokeFor('CB1')} strokeWidth={widthFor('CB1')} fill="none">
              <rect x="90" y="58" width="50" height="24" rx="2" />
              <path d="M98 70 H132" />
            </g>
            <text x="115" y="52" fill={LABEL} fontSize="11" textAnchor="middle" fontFamily="monospace">
              CB1
            </text>

            {/* S1 switch — drawn open or closed to match its state */}
            <g stroke={strokeFor('S1')} strokeWidth={widthFor('S1')} fill="none">
              <path d={switchClosed ? 'M195 70 H245' : 'M195 70 L232 54'} />
            </g>
            <circle cx="195" cy="70" r="3" fill={strokeFor('S1')} />
            <circle cx="245" cy="70" r="3" fill={strokeFor('S1')} />
            <text x="220" y="96" fill={LABEL} fontSize="11" textAnchor="middle" fontFamily="monospace">
              S1
            </text>

            {/* Lamp */}
            <g stroke={strokeFor('LAMP')} strokeWidth={widthFor('LAMP')} fill={lampFill}>
              <circle cx="485" cy="70" r="25" />
            </g>
            <g stroke={strokeFor('LAMP')} strokeWidth="1.5" fill="none">
              <path d="M467 52 L503 88" />
              <path d="M503 52 L467 88" />
            </g>
            {lamp.lit && (
              <circle cx="485" cy="70" r="34" fill="none" stroke={PROBE_A} strokeWidth="1" opacity="0.4" />
            )}
            <text x="485" y="112" fill={LABEL} fontSize="11" textAnchor="middle" fontFamily="monospace">
              LAMP
            </text>

            {/* Ground symbol */}
            <g stroke={INK} strokeWidth="2" fill="none">
              <path d="M320 190 V206" />
              <path d="M306 206 H334" />
              <path d="M311 212 H329" />
              <path d="M316 218 H324" />
            </g>

            {/* Test points */}
            {POINTS.map((p) => {
              const isA = probeA === p.node
              const isB = probeB === p.node
              return (
                <g
                  key={p.node}
                  onClick={() => probe(p.node)}
                  style={{ cursor: 'pointer' }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Probe ${p.label}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      probe(p.node)
                    }
                  }}
                >
                  <circle cx={p.x} cy={p.y} r="12" fill="transparent" />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="5.5"
                    fill={isA ? PROBE_A : isB ? PROBE_B : '#0c0b07'}
                    stroke={isA ? PROBE_A : isB ? PROBE_B : INK}
                    strokeWidth="2"
                  />
                  <text
                    x={p.x}
                    y={p.node === 'GND' ? p.y + 28 : p.y - 16}
                    fill={isA ? PROBE_A : isB ? PROBE_B : LABEL}
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {p.label}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Meter head */}
        <div className="mt-px grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
          <div className="bg-panel px-4 py-3">
            <div className="silkscreen mb-2 text-muted">
              {mode === 'volts' ? 'DC volts' : 'Resistance'}
            </div>
            <div className="font-mono text-2xl font-bold text-amber tabular-nums">
              {reading.display}
            </div>
          </div>
          <div className="bg-panel px-4 py-3">
            <div className="silkscreen mb-2 text-muted">Probes</div>
            <div className="font-mono text-sm tabular-nums">
              <span className="text-amber">{probeA}</span>
              <span className="text-muted"> → </span>
              <span className="text-cyan">{probeB}</span>
            </div>
          </div>
          <div className="bg-panel px-4 py-3">
            <div className="silkscreen mb-2 text-muted">Lamp</div>
            <div
              className={`font-mono text-sm ${
                lamp.lit ? 'text-amber' : lamp.dim ? 'text-caution' : 'text-muted'
              }`}
            >
              {lamp.lit ? 'Lit' : lamp.dim ? 'Dim' : 'Dark'}
            </div>
          </div>
          <div className="bg-panel px-4 py-3">
            <div className="silkscreen mb-2 text-muted">Bus current</div>
            <div
              className={`font-mono text-sm tabular-nums ${
                amps > 1 ? 'text-caution' : 'text-cyan'
              }`}
            >
              {amps < 0.001 ? '0 A' : amps > 10 ? `${amps.toFixed(0)} A` : `${amps.toFixed(3)} A`}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- Controls ---------------- */}
      <div className="grid gap-3 bg-panel p-3 lg:grid-cols-3">
        <ControlGroup label="Meter" accent="amber">
          <Segmented
            label="Function"
            value={mode}
            options={[
              { value: 'volts', label: 'V DC' },
              { value: 'ohms', label: 'Ω' },
            ]}
            onChange={setMode}
          />
          <Segmented
            label="Gear switch"
            value={switchClosed ? 'closed' : 'open'}
            options={[
              { value: 'closed', label: 'Closed' },
              { value: 'open', label: 'Open' },
            ]}
            onChange={(v) => setSwitchClosed(v === 'closed')}
          />
          <button
            type="button"
            onClick={record}
            className="border border-line px-3 py-2 silkscreen text-cyan hover:border-cyan"
          >
            Record this reading
          </button>
          <p className="text-[0.75rem] leading-relaxed text-muted">
            Click any two test points on the schematic to move the probes. Resistance is measured
            with the supply disconnected, so an ohms reading ignores the bus.
          </p>
        </ControlGroup>

        <ControlGroup label="Readings">
          {log.length === 0 ? (
            <p className="text-[0.75rem] leading-relaxed text-muted">
              Nothing recorded yet. A written record is how you avoid probing the same point twice
              and talking yourself into the wrong answer.
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {log.map((e, i) => (
                <li
                  key={i}
                  className="flex items-baseline justify-between gap-2 border-b border-line/60 pb-1
                             font-mono text-xs tabular-nums"
                >
                  <span className="text-muted">
                    {e.mode === 'volts' ? 'V' : 'Ω'} {e.a}–{e.b}
                  </span>
                  <span className="text-bright">{e.display}</span>
                </li>
              ))}
            </ul>
          )}
        </ControlGroup>

        <ControlGroup label="Call the fault" accent="cyan">
          <div className="flex flex-col gap-2">
            {COMPONENTS.map((c) => (
              <label
                key={c.id}
                className={`flex cursor-pointer items-center gap-2 border px-2 py-1.5 text-xs
                            transition-colors ${
                              answer === c.id
                                ? 'border-cyan text-bright'
                                : 'border-line text-body hover:border-cyan/60'
                            }`}
              >
                <input
                  type="radio"
                  name="culprit"
                  value={c.id}
                  checked={answer === c.id}
                  onChange={() => setAnswer(c.id)}
                  disabled={revealed}
                  className="accent-cyan"
                />
                {c.label}
              </label>
            ))}
          </div>

          {!revealed ? (
            <button
              type="button"
              onClick={commit}
              disabled={!answer}
              className="border border-amber bg-amber px-3 py-2 silkscreen text-screen
                         hover:bg-transparent hover:text-amber disabled:cursor-not-allowed
                         disabled:border-line disabled:bg-transparent disabled:text-muted"
            >
              Commit
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <p
                className={`silkscreen border px-2 py-1.5 ${
                  verdict === 'right'
                    ? 'border-status/50 text-status'
                    : 'border-caution/50 text-caution'
                }`}
              >
                {verdict === 'right' ? 'Correct' : `Not it — the fault was ${fault.culprit}`}
              </p>
              <div>
                <p className="mb-1 text-sm font-semibold text-bright">{fault.label}</p>
                <p className="text-[0.8125rem] leading-relaxed text-body">{fault.explanation}</p>
              </div>
              <button
                type="button"
                onClick={newFault}
                className="border border-amber px-3 py-2 silkscreen text-amber
                           hover:bg-amber hover:text-screen"
              >
                Inject another fault
              </button>
            </div>
          )}
        </ControlGroup>
      </div>
    </div>
  )
}
