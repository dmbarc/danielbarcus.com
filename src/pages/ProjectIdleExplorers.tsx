import { Link } from 'react-router-dom'

import { GameEmbed } from '../components/GameEmbed'
import { projects } from '../content/site'

const project = projects.find((p) => p.id === 'idle-explorers')!

export function ProjectIdleExplorers() {
  return (
    <section className="px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link to="/#work" className="silkscreen text-cyan hover:text-amber">
          ← All projects
        </Link>

        <header className="mt-5 mb-6">
          <p className="silkscreen mb-3 text-caution">
            Unity · C# · ASP.NET Core · Postgres · WebGL
          </p>
          <h1 className="mb-3 text-[clamp(1.6rem,4vw,2.5rem)] leading-tight font-bold">
            {project.name}
          </h1>
          <p className="max-w-[65ch] text-[0.95rem] leading-relaxed text-body">
            An idle MMO where the rules live on the server and the client is only allowed to ask.
            The game itself is parked, but the architecture is the part worth reading, and the
            build below is the real client talking to the real API.
          </p>
        </header>

        {/* Accurate as of this deploy: the client has a PLAY AS GUEST button and the
            server collects guests that go quiet, but the Supabase project has
            anonymous sign-ins switched off, so the button comes back 422. This notice
            comes out the moment that setting is flipped, and not before. */}
        <div className="mb-4 border border-caution/40 bg-caution/5 px-4 py-3 text-[0.8125rem] leading-relaxed text-body">
          <span className="silkscreen mr-2 text-caution">Needs an account</span>
          The server tells an unauthenticated client nothing, so trying it means signing up for
          now. Guest sign-in is built and waiting on one provider setting.
        </div>

        <GameEmbed
          src="/idle-explorers/index.html"
          title="Idle Explorers"
          downloadHint="About 27 MB on first load, cached after that"
        />

        <div className="mt-8 grid gap-px bg-line sm:grid-cols-2">
          <article className="bg-panel p-5">
            <h2 className="mb-3 text-base font-semibold">Server-authoritative, and strictly</h2>
            <ul className="flex flex-col gap-2 text-[0.8125rem] leading-relaxed text-body">
              <li>
                Every rule lives on the server in one shared C# tree. The client sends intent and
                renders what comes back; it never decides an outcome, so there is nothing in the
                build worth tampering with.
              </li>
              <li>
                Row-level security is enabled <em>and forced</em> on every table with no policies
                at all, so Postgres denies by default and the API is the only way in. The
                publishable key in the client is safe precisely because it can do nothing on its
                own.
              </li>
              <li>
                A build refuses to compile if a secret-class key ever appears in client config.
                That guard is why the repository could be made public without a scrub.
              </li>
              <li>
                One session per account, presence and chat on polling rather than sockets —
                because WebGL has no sockets, which is a constraint the design had to absorb
                rather than work around.
              </li>
            </ul>
          </article>
          <article className="bg-panel p-5">
            <h2 className="mb-3 text-base font-semibold">What the web build cost</h2>
            <p className="mb-3 text-[0.8125rem] leading-relaxed text-body">
              Compression was the decision that mattered. Turning it off lets the edge compress
              instead, which sounds cleaner — until the 25 MiB per-file host limit turns out to
              apply to the <em>uncompressed</em> size, and the wasm is 58 MB.
            </p>
            <p className="mb-3 text-[0.8125rem] leading-relaxed text-body">
              So it ships Brotli with Unity's own decompressor rather than relying on the host to
              send <code>Content-Encoding: br</code>. It works on any host, needs no configuration,
              and cannot be broken by a CDN behaving unexpectedly.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {project.tags.map((t) => (
                <span key={t} className="silkscreen border border-line px-2 py-1 text-muted">
                  {t}
                </span>
              ))}
            </div>
            {project.href && (
              <a
                className="mt-4 inline-block silkscreen text-cyan hover:text-amber"
                href={project.href}
                target="_blank"
                rel="noreferrer"
              >
                Read the source →
              </a>
            )}
          </article>
        </div>
      </div>
    </section>
  )
}
