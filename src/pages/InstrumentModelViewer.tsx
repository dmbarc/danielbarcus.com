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
          title="the model viewer"
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
            <h2 className="mb-3 text-base font-semibold">The motion is the mechanism</h2>
            <p className="mb-3 text-[0.8125rem] leading-relaxed text-body">
              A piston does not move sinusoidally. The connecting rod is a fixed length pivoting at
              both ends, so the piston spends longer near bottom dead center than near top. Height
              above the crank axis is:
            </p>
            <pre className="mb-3 overflow-x-auto border border-line bg-screen p-3 font-mono text-[0.75rem] text-cyan">
              x = r·cos θ + √(l² − r²·sin²θ)
            </pre>
            <p className="mb-3 text-[0.8125rem] leading-relaxed text-body">
              Animating <code>sin θ</code> instead looks close and is visibly wrong to anyone who
              has watched an engine turn over. The rods lean by <code>asin(r·sin θ / l)</code> for
              the same reason, and the crank journals are phased 1-3-4-2 so the outer pair rises
              while the inner pair falls — which is why a four sounds even.
            </p>
            <p className="text-[0.8125rem] leading-relaxed text-body">
              That geometry lives in a file with no Unity types in it, so it can be checked without
              an engine or an editor.
            </p>
          </article>
          <article className="bg-panel p-5">
            <h2 className="mb-3 text-base font-semibold">No binary assets</h2>
            <p className="mb-3 text-[0.8125rem] leading-relaxed text-body">
              There is no model file in the repository. The engine is assembled from primitives at
              runtime, so every dimension is a number somebody can read and change, and there is no
              mesh whose license or provenance anyone has to take on trust.
            </p>
            <p className="mb-3 text-[0.8125rem] leading-relaxed text-body">
              The scene is generated at build time too. It holds one empty object carrying the
              bootstrap — not worth a file that is unreadable in a diff and unmergeable in a
              conflict.
            </p>
            <p className="text-[0.8125rem] leading-relaxed text-body">
              The cost of that choice is one real trap: a scene built at runtime references no
              shaders, so the build stripper removes them and every part renders solid magenta in
              the player while looking perfect in the editor. The build script names them
              explicitly to keep them in.
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
