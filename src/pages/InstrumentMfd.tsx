import { Link } from 'react-router-dom'

import { Mfd } from '../components/instruments/Mfd'
import { Disclosure } from '../components/Disclosure'
import { demos } from '../content/site'

const demo = demos.find((d) => d.id === 'mfd')!

export function InstrumentMfd() {
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

        <Mfd />

        <div className="mt-8 grid gap-px bg-line sm:grid-cols-2">
          <article className="bg-panel p-5">
            <h2 className="mb-3 text-base font-semibold">The structural idea</h2>
            <ul className="flex flex-col gap-2 text-[0.8125rem] leading-relaxed text-body">
              <li>
                The systems model runs on its own clock and owns all state. Pages are views onto it,
                never owners of it — leave a page for a minute and the tanks have been burning down
                the whole time.
              </li>
              <li>
                The warning lights are driven by values crossing limits, never by the fault list
                itself. A light means a limit was genuinely exceeded, which is why losing the second
                hydraulic system walks through low pressure and on to pressure lost as it bleeds
                down, rather than jumping straight to the worst state.
              </li>
              <li>
                The CDU refuses an invalid entry into the message line rather than silently
                accepting it. Silent acceptance is how a crew ends up trusting a value nothing ever
                applied.
              </li>
            </ul>
          </article>
          <article className="bg-panel p-5">
            <h2 className="mb-3 text-base font-semibold">Where it comes from</h2>
            <p className="mb-3 text-[0.8125rem] leading-relaxed text-body">
              I built simulated CH-53K cockpit displays in Coherent UI — a browser engine embedded
              inside Unity, so the panels themselves were JavaScript, HTML and CSS running against a
              C# simulation behind them. The customer preferred them to the training software they
              already had.
            </p>
            <p className="text-[0.8125rem] leading-relaxed text-body">
              That aircraft is not mine to show. This is the same way of building a panel, and the
              same separation between the model and the display, on an airframe I made up.
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
