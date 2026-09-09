import { Link } from 'react-router-dom'

import { Oscilloscope } from '../components/instruments/Oscilloscope'
import { Disclosure } from '../components/Disclosure'
import { demos } from '../content/site'

const demo = demos.find((d) => d.id === 'oscilloscope')!

export function InstrumentOscilloscope() {
  return (
    <section className="px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link to="/#instruments" className="silkscreen text-cyan hover:text-amber">
          ← All instruments
        </Link>

        <header className="mt-5 mb-6">
          <p className="silkscreen mb-3 text-caution">Instrument {demo.index}</p>
          <h1 className="mb-3 text-[clamp(1.6rem,4vw,2.5rem)] leading-tight font-bold">
            {demo.name}
          </h1>
          <p className="max-w-[65ch] text-[0.95rem] leading-relaxed text-body">{demo.detail}</p>
        </header>

        <Disclosure compact />

        <Oscilloscope />

        <div className="mt-8 grid gap-px bg-line sm:grid-cols-2">
          <article className="bg-panel p-5">
            <h2 className="mb-3 text-base font-semibold">What is actually simulated</h2>
            <ul className="flex flex-col gap-2 text-[0.8125rem] leading-relaxed text-body">
              <li>
                The trace is computed per frame from the generator's parameters — nothing is
                pre-rendered or looped.
              </li>
              <li>
                The trigger is solved analytically: the display window anchors to the exact phase
                where the signal crosses the level on the chosen slope, which is why a triggered
                trace sits perfectly still.
              </li>
              <li>
                AC coupling removes the DC component exactly, since for a generated signal that
                component is known rather than estimated by a filter.
              </li>
              <li>
                Volts and time per division step in the 1-2-5 sequence real instruments use, and
                measurements come from the signal's mathematics, not from reading pixels.
              </li>
            </ul>
          </article>
          <article className="bg-panel p-5">
            <h2 className="mb-3 text-base font-semibold">Where it comes from</h2>
            <p className="mb-3 text-[0.8125rem] leading-relaxed text-body">
              At Carley I built a waveform generator and oscilloscope in C# for a Unity maintenance
              trainer. It had to replicate real device behavior closely enough that a technician
              who learned on it would not be surprised by the bench equipment.
            </p>
            <p className="text-[0.8125rem] leading-relaxed text-body">
              That work is not mine to show, so this is the same problem solved again in the open,
              in TypeScript and Canvas.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {demo.tags.map((t) => (
                <span key={t} className="silkscreen border border-line px-2 py-1 text-muted">
                  {t}
                </span>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
