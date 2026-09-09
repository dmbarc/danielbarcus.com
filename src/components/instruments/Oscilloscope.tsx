import { useEffect, useRef, useState } from 'react'

import {
  type Channel,
  type Coupling,
  H_DIVS,
  type Slope,
  TIME_PER_DIV,
  V_DIVS,
  VOLTS_PER_DIV,
  WAVEFORMS,
  type Waveform,
  channelValueAt,
  formatFreq,
  formatTime,
  formatVolts,
  triggerStartTime,
  vpp,
  vrms,
} from '../../lib/signal'
import { ControlGroup, Segmented, Select, Slider } from '../ui/Control'

const CH1_COLOUR = '#ffb000'
const CH2_COLOUR = '#4ea1c4'
const SCREEN = '#0c0b07'
const GRATICULE = '#241f14'
const AXIS = '#3a3527'

type TriggerMode = 'auto' | 'normal'

const initialCh1: Channel = {
  source: { waveform: 'sine', frequency: 1000, amplitude: 1.5, offset: 0, phase: 0 },
  coupling: 'dc',
  voltsPerDiv: 0.5,
  position: 0,
  enabled: true,
}

const initialCh2: Channel = {
  source: { waveform: 'square', frequency: 500, amplitude: 1, offset: 0, phase: 0 },
  coupling: 'dc',
  // 1 V at 1 V/div spans one division either side, so with the trace
  // parked two divisions down both channels are fully on screen at once.
  voltsPerDiv: 1,
  position: -2,
  enabled: true,
}

/**
 * A two-channel oscilloscope with a function generator on each input.
 *
 * The behaviour worth noticing is the trigger: with a level the signal
 * actually reaches, the window anchors to an exact crossing and the trace
 * stands still. Move the level past the peak and it stops triggering —
 * AUTO free-runs and the trace slides, NORMAL holds the last sweep. That
 * is the whole reason a trigger control exists, and it is the first thing
 * a technician has to understand about the instrument.
 */
export function Oscilloscope() {
  const [ch1, setCh1] = useState<Channel>(initialCh1)
  const [ch2, setCh2] = useState<Channel>(initialCh2)
  const [timePerDiv, setTimePerDiv] = useState(2e-4)
  const [triggerSource, setTriggerSource] = useState<'ch1' | 'ch2'>('ch1')
  const [triggerLevel, setTriggerLevel] = useState(0)
  const [triggerSlope, setTriggerSlope] = useState<Slope>('rising')
  const [triggerMode, setTriggerMode] = useState<TriggerMode>('auto')
  const [running, setRunning] = useState(true)

  // Whether the scope locks is a pure function of the controls, so it is
  // derived during render rather than pushed from the draw loop. Setting
  // it per frame would re-render the whole instrument 60 times a second,
  // and would leave the indicator stale whenever rAF is throttled — in a
  // background tab, or under prefers-reduced-motion.
  const triggerChannel = triggerSource === 'ch1' ? ch1 : ch2
  const triggered =
    triggerStartTime(triggerChannel, triggerLevel, triggerSlope, timePerDiv * H_DIVS) !== null

  const canvasRef = useRef<HTMLCanvasElement>(null)
  // The draw loop reads live state through a ref so that changing a knob
  // never restarts the animation.
  const stateRef = useRef({
    ch1,
    ch2,
    timePerDiv,
    triggerSource,
    triggerLevel,
    triggerSlope,
    triggerMode,
    running,
  })
  // Refresh after every render rather than during it: writing a ref mid
  // render is the pattern React warns about, and one frame of lag between
  // turning a knob and the trace following it is imperceptible.
  useEffect(() => {
    stateRef.current = {
      ch1,
      ch2,
      timePerDiv,
      triggerSource,
      triggerLevel,
      triggerSlope,
      triggerMode,
      running,
    }
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let lastStart = 0

    function resize() {
      if (!canvas || !ctx) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.round(rect.width * dpr))
      canvas.height = Math.max(1, Math.round(rect.height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function graticule(w: number, h: number) {
      if (!ctx) return
      ctx.lineWidth = 1
      ctx.strokeStyle = GRATICULE
      for (let i = 1; i < H_DIVS; i++) {
        const x = Math.round((w / H_DIVS) * i) + 0.5
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let i = 1; i < V_DIVS; i++) {
        const y = Math.round((h / V_DIVS) * i) + 0.5
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }
      ctx.strokeStyle = AXIS
      ctx.beginPath()
      ctx.moveTo(0, Math.round(h / 2) + 0.5)
      ctx.lineTo(w, Math.round(h / 2) + 0.5)
      ctx.moveTo(Math.round(w / 2) + 0.5, 0)
      ctx.lineTo(Math.round(w / 2) + 0.5, h)
      ctx.stroke()
    }

    function drawChannel(
      channel: Channel,
      colour: string,
      w: number,
      h: number,
      tStart: number,
      window: number,
    ) {
      if (!ctx || !channel.enabled) return
      const pxPerDiv = h / V_DIVS
      const mid = h / 2 - channel.position * pxPerDiv
      ctx.strokeStyle = colour
      ctx.lineWidth = 2
      ctx.shadowColor = colour
      ctx.shadowBlur = 10
      ctx.beginPath()
      let started = false
      for (let x = 0; x <= w; x += 1) {
        const t = tStart + (x / w) * window
        const v = channelValueAt(channel, t)
        const y = mid - (v / channel.voltsPerDiv) * pxPerDiv
        // A real scope clips at the screen edge rather than drawing off it.
        if (y < -h || y > 2 * h) {
          started = false
          continue
        }
        if (!started) {
          ctx.moveTo(x, y)
          started = true
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()
      ctx.shadowBlur = 0

      // Ground marker on the left rail.
      ctx.fillStyle = colour
      ctx.beginPath()
      ctx.moveTo(0, mid)
      ctx.lineTo(8, mid - 5)
      ctx.lineTo(8, mid + 5)
      ctx.closePath()
      ctx.fill()
    }

    function draw(now: number) {
      if (!canvas || !ctx) return
      const s = stateRef.current
      const rect = canvas.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      const windowSeconds = s.timePerDiv * H_DIVS

      ctx.fillStyle = SCREEN
      ctx.fillRect(0, 0, w, h)
      graticule(w, h)

      const src = s.triggerSource === 'ch1' ? s.ch1 : s.ch2
      const anchored = triggerStartTime(src, s.triggerLevel, s.triggerSlope, windowSeconds)

      let tStart: number
      if (anchored !== null) {
        tStart = anchored
        lastStart = anchored
      } else if (s.triggerMode === 'auto') {
        // Free run: the window slides, so an untriggered trace visibly
        // drifts — which is the symptom that tells you it is untriggered.
        tStart = (now / 1000) % 1000
        lastStart = tStart
      } else {
        // NORMAL holds the last good sweep rather than showing garbage.
        tStart = lastStart
      }

      drawChannel(s.ch1, CH1_COLOUR, w, h, tStart, windowSeconds)
      drawChannel(s.ch2, CH2_COLOUR, w, h, tStart, windowSeconds)

      // Trigger level marker on the right rail, in the source channel's
      // colour and vertical scale.
      const pxPerDiv = h / V_DIVS
      const srcColour = s.triggerSource === 'ch1' ? CH1_COLOUR : CH2_COLOUR
      const mid = h / 2 - src.position * pxPerDiv
      const ty = mid - (s.triggerLevel / src.voltsPerDiv) * pxPerDiv
      if (ty > 0 && ty < h) {
        ctx.strokeStyle = srcColour
        ctx.setLineDash([4, 4])
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, ty)
        ctx.lineTo(w, ty)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle = srcColour
        ctx.beginPath()
        ctx.moveTo(w, ty)
        ctx.lineTo(w - 8, ty - 5)
        ctx.lineTo(w - 8, ty + 5)
        ctx.closePath()
        ctx.fill()
      }

      if (s.running) raf = requestAnimationFrame(draw)
    }

    resize()
    raf = requestAnimationFrame(draw)
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [running])

  const patch = (setter: typeof setCh1) => ({
    source: (part: Partial<Channel['source']>) =>
      setter((c) => ({ ...c, source: { ...c.source, ...part } })),
    channel: (part: Partial<Channel>) => setter((c) => ({ ...c, ...part })),
  })
  const p1 = patch(setCh1)
  const p2 = patch(setCh2)

  const measurements = [
    { label: 'CH1 Vpp', value: formatVolts(vpp(ch1)), tone: 'amber' as const },
    { label: 'CH1 Vrms', value: formatVolts(vrms(ch1)), tone: 'amber' as const },
    { label: 'CH1 freq', value: formatFreq(ch1.source.frequency), tone: 'amber' as const },
    { label: 'CH2 Vpp', value: formatVolts(vpp(ch2)), tone: 'cyan' as const },
    { label: 'CH2 Vrms', value: formatVolts(vrms(ch2)), tone: 'cyan' as const },
    { label: 'CH2 freq', value: formatFreq(ch2.source.frequency), tone: 'cyan' as const },
  ]

  return (
    <div className="flex flex-col gap-px bg-line">
      {/* ---------------- Display ---------------- */}
      <div className="bg-panel p-3">
        <div className="relative border-2 border-line bg-screen">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="Oscilloscope display"
            className="block h-[260px] w-full sm:h-[380px]"
          />
          {/* Status overlay, as printed along a scope's screen edge. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between p-2">
            <span
              className={`silkscreen border px-2 py-1 ${
                triggered
                  ? 'border-status/50 text-status'
                  : triggerMode === 'auto'
                    ? 'border-caution/50 text-caution'
                    : 'border-line text-muted'
              }`}
            >
              {triggered ? 'Trig’d' : triggerMode === 'auto' ? 'Auto — free run' : 'Holding'}
            </span>
            <span className="silkscreen border border-line px-2 py-1 text-muted">
              {running ? 'Run' : 'Stop'}
            </span>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap justify-between gap-2 p-2">
            <span className="silkscreen text-amber">
              CH1 {formatVolts(ch1.voltsPerDiv)}/div {ch1.coupling.toUpperCase()}
            </span>
            <span className="silkscreen text-cyan">
              CH2 {formatVolts(ch2.voltsPerDiv)}/div {ch2.coupling.toUpperCase()}
            </span>
            <span className="silkscreen text-muted">{formatTime(timePerDiv)}/div</span>
          </div>
        </div>

        {/* Measurements, computed from the signal rather than the pixels. */}
        <div className="mt-px grid grid-cols-3 gap-px bg-line sm:grid-cols-6">
          {measurements.map((m) => (
            <div key={m.label} className="bg-panel px-3 py-2">
              <div className="silkscreen mb-1 text-muted">{m.label}</div>
              <div
                className={`font-mono text-sm tabular-nums ${
                  m.tone === 'amber' ? 'text-amber' : 'text-cyan'
                }`}
              >
                {m.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- Controls ---------------- */}
      <div className="grid gap-3 bg-panel p-3 lg:grid-cols-4">
        <ControlGroup label="Channel 1" accent="amber">
          <Segmented
            label="Trace"
            value={ch1.enabled ? 'on' : 'off'}
            options={[
              { value: 'on', label: 'On' },
              { value: 'off', label: 'Off' },
            ]}
            onChange={(v) => p1.channel({ enabled: v === 'on' })}
          />
          <Select
            label="Wave"
            value={ch1.source.waveform}
            options={WAVEFORMS.map((w) => ({ value: w, label: w }))}
            onChange={(v: Waveform) => p1.source({ waveform: v })}
          />
          <Slider
            label="Freq"
            value={Math.log10(ch1.source.frequency)}
            min={0}
            max={4}
            step={0.01}
            display={formatFreq(ch1.source.frequency)}
            onChange={(v) => p1.source({ frequency: 10 ** v })}
          />
          <Slider
            label="Amplitude"
            value={ch1.source.amplitude}
            min={0}
            max={4}
            step={0.05}
            display={formatVolts(ch1.source.amplitude)}
            onChange={(v) => p1.source({ amplitude: v })}
          />
          <Slider
            label="DC offset"
            value={ch1.source.offset}
            min={-2}
            max={2}
            step={0.05}
            display={formatVolts(ch1.source.offset)}
            onChange={(v) => p1.source({ offset: v })}
          />
          <Select
            label="Volts/div"
            value={ch1.voltsPerDiv}
            options={VOLTS_PER_DIV.map((v) => ({ value: v, label: formatVolts(v) }))}
            onChange={(v: number) => p1.channel({ voltsPerDiv: v })}
          />
          <Segmented
            label="Coupling"
            value={ch1.coupling}
            options={[
              { value: 'dc', label: 'DC' },
              { value: 'ac', label: 'AC' },
              { value: 'gnd', label: 'GND' },
            ]}
            onChange={(v: Coupling) => p1.channel({ coupling: v })}
          />
        </ControlGroup>

        <ControlGroup label="Channel 2" accent="cyan">
          <Segmented
            label="Trace"
            value={ch2.enabled ? 'on' : 'off'}
            options={[
              { value: 'on', label: 'On' },
              { value: 'off', label: 'Off' },
            ]}
            onChange={(v) => p2.channel({ enabled: v === 'on' })}
          />
          <Select
            label="Wave"
            value={ch2.source.waveform}
            options={WAVEFORMS.map((w) => ({ value: w, label: w }))}
            onChange={(v: Waveform) => p2.source({ waveform: v })}
          />
          <Slider
            label="Freq"
            value={Math.log10(ch2.source.frequency)}
            min={0}
            max={4}
            step={0.01}
            display={formatFreq(ch2.source.frequency)}
            onChange={(v) => p2.source({ frequency: 10 ** v })}
          />
          <Slider
            label="Amplitude"
            value={ch2.source.amplitude}
            min={0}
            max={4}
            step={0.05}
            display={formatVolts(ch2.source.amplitude)}
            onChange={(v) => p2.source({ amplitude: v })}
          />
          <Slider
            label="DC offset"
            value={ch2.source.offset}
            min={-2}
            max={2}
            step={0.05}
            display={formatVolts(ch2.source.offset)}
            onChange={(v) => p2.source({ offset: v })}
          />
          <Select
            label="Volts/div"
            value={ch2.voltsPerDiv}
            options={VOLTS_PER_DIV.map((v) => ({ value: v, label: formatVolts(v) }))}
            onChange={(v: number) => p2.channel({ voltsPerDiv: v })}
          />
          <Segmented
            label="Coupling"
            value={ch2.coupling}
            options={[
              { value: 'dc', label: 'DC' },
              { value: 'ac', label: 'AC' },
              { value: 'gnd', label: 'GND' },
            ]}
            onChange={(v: Coupling) => p2.channel({ coupling: v })}
          />
        </ControlGroup>

        <ControlGroup label="Horizontal">
          <Select
            label="Time/div"
            value={timePerDiv}
            options={TIME_PER_DIV.map((t) => ({ value: t, label: formatTime(t) }))}
            onChange={setTimePerDiv}
          />
          <Slider
            label="CH1 position"
            value={ch1.position}
            min={-3}
            max={3}
            step={0.1}
            display={`${ch1.position.toFixed(1)} div`}
            onChange={(v) => p1.channel({ position: v })}
          />
          <Slider
            label="CH2 position"
            value={ch2.position}
            min={-3}
            max={3}
            step={0.1}
            display={`${ch2.position.toFixed(1)} div`}
            onChange={(v) => p2.channel({ position: v })}
          />
          <Segmented
            label="Sweep"
            value={running ? 'run' : 'stop'}
            options={[
              { value: 'run', label: 'Run' },
              { value: 'stop', label: 'Stop' },
            ]}
            onChange={(v) => setRunning(v === 'run')}
          />
        </ControlGroup>

        <ControlGroup label="Trigger">
          <Segmented
            label="Source"
            value={triggerSource}
            options={[
              { value: 'ch1', label: 'CH1' },
              { value: 'ch2', label: 'CH2' },
            ]}
            onChange={setTriggerSource}
          />
          <Slider
            label="Level"
            value={triggerLevel}
            min={-4}
            max={4}
            step={0.05}
            display={formatVolts(triggerLevel)}
            onChange={setTriggerLevel}
          />
          <Segmented
            label="Slope"
            value={triggerSlope}
            options={[
              { value: 'rising', label: 'Rise' },
              { value: 'falling', label: 'Fall' },
            ]}
            onChange={setTriggerSlope}
          />
          <Segmented
            label="Mode"
            value={triggerMode}
            options={[
              { value: 'auto', label: 'Auto' },
              { value: 'normal', label: 'Norm' },
            ]}
            onChange={setTriggerMode}
          />
          <p className="text-[0.75rem] leading-relaxed text-muted">
            Push the level past the peak and the trace stops locking. Auto keeps sweeping so you
            still see something; Norm holds the last sweep. That difference is the whole point of
            the control.
          </p>
        </ControlGroup>
      </div>
    </div>
  )
}
