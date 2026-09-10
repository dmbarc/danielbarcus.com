import { Link } from 'react-router-dom'

import { Disclosure } from '../components/Disclosure'
import { GameEmbed } from '../components/GameEmbed'
import { demos } from '../content/site'

const demo = demos.find((d) => d.id === 'model-viewer')!

export function InstrumentModelViewer() {
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

        <GameEmbed
          src="/model-viewer/index.html"
          title="the engine cutaway"
          downloadHint="About 9 MB on first load, cached after that"
        />

        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 silkscreen text-muted">
          <span>Drag — orbit</span>
          <span>Right-drag — pan</span>
          <span>Scroll — zoom</span>
          <span>Click — inspect a part</span>
          <span>C — cutaway</span>
          <span>X — exploded view</span>
          <span>Space — animation on/off</span>
          <span>R — reset view</span>
        </div>

        <div className="mt-8 grid gap-px bg-line sm:grid-cols-2">
          <article className="bg-panel p-5">
            <h2 className="mb-3 text-base font-semibold">Why I built this one</h2>
            <p className="mb-3 text-[0.8125rem] leading-relaxed text-body">
              For five years my job was reading engineering material — wiring diagrams, repair
              manuals, cutaway drawings, specifications — and turning it into training software that
              behaves the way the hardware does. A technician who learns on a wrong model learns the
              wrong thing, so the standard was never "looks about right."
            </p>
            <p className="mb-3 text-[0.8125rem] leading-relaxed text-body">
              This is that job on a subject I am free to publish. Nobody handed me an engine model.
              I worked the geometry out from how the mechanism actually functions — bore, stroke,
              rod length, firing order — and built it in Unity from there.
            </p>
            <p className="text-[0.8125rem] leading-relaxed text-body">
              The detail I would point at in an interview is the motion. A piston does not travel on
              a sine wave, because the rod is a fixed length pivoting at both ends, so it sits
              longer at the bottom of the stroke than the top:
            </p>
            <pre className="mt-3 overflow-x-auto border border-line bg-screen p-3 font-mono text-[0.75rem] text-cyan">
              x = r·cos θ + √(l² − r²·sin²θ)
            </pre>
            <p className="mt-3 text-[0.8125rem] leading-relaxed text-body">
              A sine wave looks close and is wrong to anyone who has watched an engine turn over.
              The journals are phased 1-3-4-2, so the outer pair rises while the inner pair falls —
              which is why a four-cylinder sounds even.
            </p>
          </article>
          <article className="bg-panel p-5">
            <h2 className="mb-3 text-base font-semibold">Solving it in Unity</h2>
            <p className="mb-3 text-[0.8125rem] leading-relaxed text-body">
              Assembled properly, the pistons are completely enclosed by the block. That is correct,
              and useless in something built to show how the mechanism works — the one thing worth
              seeing is the thing you cannot see.
            </p>
            <p className="mb-3 text-[0.8125rem] leading-relaxed text-body">
              So there are two ways in, and both keep running while the crank turns: strip the
              castings off in place, or separate the whole assembly and see how it fits together.
              Every part answers a click with what it does and why it matters, which is the same job
              a maintenance lesson has to do.
            </p>
            <p className="text-[0.8125rem] leading-relaxed text-body">
              There is no model file behind any of it. The engine is assembled in code from
              measurements, so every dimension is a number that can be read and changed rather than
              a mesh nobody can edit.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {demo.tags.map((t) => (
                <span key={t} className="silkscreen border border-line px-2 py-1 text-muted">
                  {t}
                </span>
              ))}
            </div>
            <a
              className="mt-4 inline-block silkscreen text-cyan hover:text-amber"
              href="https://github.com/dmbarc/3d-model-viewer"
              target="_blank"
              rel="noreferrer"
            >
              Read the source →
            </a>
          </article>
        </div>
      </div>
    </section>
  )
}
