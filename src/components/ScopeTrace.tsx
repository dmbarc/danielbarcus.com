import { useEffect, useRef } from 'react'

type Props = {
  /**
   * Height comes from the caller's classes, not a pixel prop, so the
   * display can be short on a phone and tall on a desktop. The canvas
   * resizes its backing store to whatever the class gives it.
   */
  className?: string
}

const SCREEN = '#0c0b07'
const GRATICULE = '#241f14'
const AXIS = '#3a3527'
const CH1 = '#ffb000'
const CH2 = '#4ea1c4'

/**
 * The hero trace: two channels drawn per frame from their signal
 * parameters, on a 12x6 graticule. This is decoration on the home page,
 * but it is the same drawing routine the full oscilloscope demo uses —
 * so it is worth it being honest about how a scope actually rasterizes.
 */
export function ScopeTrace({ className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    let phase = 0

    /** Match the backing store to the element's real size and DPR. */
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
      for (let i = 1; i < 12; i++) {
        const x = Math.round((w / 12) * i) + 0.5
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let i = 1; i < 6; i++) {
        const y = Math.round((h / 6) * i) + 0.5
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }
      // Center cross, brighter than the rest — as on a real graticule.
      ctx.strokeStyle = AXIS
      ctx.beginPath()
      ctx.moveTo(0, Math.round(h / 2) + 0.5)
      ctx.lineTo(w, Math.round(h / 2) + 0.5)
      ctx.moveTo(Math.round(w / 2) + 0.5, 0)
      ctx.lineTo(Math.round(w / 2) + 0.5, h)
      ctx.stroke()
    }

    function trace(
      w: number,
      h: number,
      amp: number,
      freq: number,
      drift: number,
      color: string,
      glow: number,
    ) {
      if (!ctx) return
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.shadowColor = color
      ctx.shadowBlur = glow
      ctx.beginPath()
      for (let x = 0; x <= w; x += 2) {
        const t = (x / w) * Math.PI * 2 * freq + phase * drift
        // A fundamental plus a third harmonic: closer to a real bench
        // signal than a clean sine, and it keeps the trace interesting.
        const y = h / 2 - Math.sin(t) * amp - Math.sin(t * 3.1) * amp * 0.18
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    function draw() {
      if (!canvas || !ctx) return
      const rect = canvas.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      ctx.fillStyle = SCREEN
      ctx.fillRect(0, 0, w, h)
      graticule(w, h)
      const unit = h / 6
      trace(w, h, unit * 1.35, 2, 1.0, CH1, 14)
      trace(w, h, unit * 0.62, 3.5, -1.6, CH2, 9)
      if (!reduced) {
        phase += 0.012
        frame = requestAnimationFrame(draw)
      }
    }

    resize()
    draw()

    const observer = new ResizeObserver(() => {
      resize()
      if (reduced) draw()
    })
    observer.observe(canvas)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="An oscilloscope display showing two live traces on a graticule"
      className={`block w-full ${className}`}
    />
  )
}
