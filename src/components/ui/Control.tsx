import type { ReactNode } from 'react'
import { useId } from 'react'

/** A bordered group of related controls, as on a real instrument face. */
export function ControlGroup({
  label,
  accent,
  children,
}: {
  label: string
  accent?: 'amber' | 'cyan' | 'muted'
  children: ReactNode
}) {
  const tone =
    accent === 'amber' ? 'text-amber' : accent === 'cyan' ? 'text-cyan' : 'text-muted'
  return (
    <fieldset className="border border-line bg-panel p-3">
      <legend className={`silkscreen px-1.5 ${tone}`}>{label}</legend>
      <div className="flex flex-col gap-2.5">{children}</div>
    </fieldset>
  )
}

/** A labeled select, styled as a rotary switch's position readout. */
export function Select<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  const id = useId()
  return (
    <div className="flex items-center justify-between gap-3">
      <label htmlFor={id} className="silkscreen text-muted">
        {label}
      </label>
      <select
        id={id}
        value={String(value)}
        onChange={(e) => {
          const next = options.find((o) => String(o.value) === e.target.value)
          if (next) onChange(next.value)
        }}
        className="min-w-[7.5rem] border border-line bg-screen px-2 py-1.5 font-mono text-xs
                   text-bright tabular-nums hover:border-amber/60"
      >
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)} className="bg-screen">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

/** A labeled slider with a live value readout. */
export function Slider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  display: string
  onChange: (value: number) => void
}) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="silkscreen text-muted">
          {label}
        </label>
        <span className="font-mono text-xs text-bright tabular-nums">{display}</span>
      </div>
      <input
        id={id}
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 w-full cursor-pointer appearance-none rounded-none bg-line
                   accent-amber outline-offset-4"
      />
    </div>
  )
}

/** A row of mutually exclusive push buttons. */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="silkscreen text-muted">{label}</span>
      <div className="flex gap-px" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={[
              'border px-2 py-1.5 silkscreen transition-colors',
              value === o.value
                ? 'border-amber bg-amber text-screen'
                : 'border-line bg-screen text-muted hover:border-amber/60 hover:text-amber',
            ].join(' ')}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
