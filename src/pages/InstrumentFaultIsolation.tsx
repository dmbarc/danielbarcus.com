import { Link } from 'react-router-dom'

import { FaultIsolation } from '../components/instruments/FaultIsolation'
import { demos } from '../content/site'

const demo = demos.find((d) => d.id === 'fault-isolation')!

export function InstrumentFaultIsolation() {
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

        <FaultIsolation />

        <div className="mt-8 grid gap-px bg-line sm:grid-cols-2">
          <article className="bg-panel p-5">
            <h2 className="mb-3 text-base font-semibold">How to isolate it</h2>
            <ul className="flex flex-col gap-2 text-[0.8125rem] leading-relaxed text-body">
              <li>
                An open conductor drops the entire 28 V across itself, because no current flows and
                the whole supply appears at the break. Probe across each component in turn.
              </li>
              <li>
                That rule identifies conductors, never the load — a healthy lamp is also dropping
                nearly the whole supply, since dropping it is the lamp's job.
              </li>
              <li>
                A high-resistance fault is the one continuity alone would miss: nothing reads open,
                the lamp merely goes dim, and the corroded run quietly takes most of the supply.
              </li>
              <li>
                A short is the opposite signature — almost no voltage across the component, and bus
                current far above nominal.
              </li>
            </ul>
          </article>
          <article className="bg-panel p-5">
            <h2 className="mb-3 text-base font-semibold">What is actually simulated</h2>
            <p className="mb-3 text-[0.8125rem] leading-relaxed text-body">
              The circuit is solved by modified nodal analysis — a conductance matrix with a row per
              voltage source, reduced by Gaussian elimination with partial pivoting. Probe readings
              are differences between solved node voltages, so every reading is consistent with
              every other one no matter what order you take them in.
            </p>
            <p className="mb-3 text-[0.8125rem] leading-relaxed text-body">
              Resistance readings de-energise the circuit by removing the source rather than
              shorting it, which is what disconnecting a supply actually does to the network.
            </p>
            <p className="text-[0.8125rem] leading-relaxed text-body">
              At Carley I helped lead a team delivering 30+ electrical-diagnostics lessons for a
              mock F-18 trainer in under twelve months. This is that problem on a circuit I am free
              to show.
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
