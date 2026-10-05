import { Link } from 'react-router-dom'

import { GameEmbed } from '../components/GameEmbed'
import { PlayButton, StudioButton, Trailer } from '../components/Showcase'
import { boomsweeper, studio } from '../content/site'

export function ProjectBoomsweeper() {
  return (
    <section className="px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link to="/#work" className="silkscreen text-cyan hover:text-amber">
          ← All projects
        </Link>

        <header className="mt-5 mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <img
            src={boomsweeper.icon}
            alt=""
            width={88}
            height={88}
            className="size-[88px] rounded-[22%] shadow-lg"
          />
          <div className="min-w-0">
            <p className="silkscreen mb-3 text-status">
              {boomsweeper.kicker} · {studio.name}
            </p>
            <h1 className="mb-2 text-[clamp(1.6rem,4vw,2.5rem)] leading-tight font-bold">
              {boomsweeper.name}
            </h1>
            <p className="max-w-[65ch] text-[0.95rem] leading-relaxed text-body">
              {boomsweeper.pitch}
            </p>
          </div>
        </header>

        <div className="mb-8 flex flex-wrap gap-3">
          <PlayButton />
          <StudioButton />
        </div>

        <Trailer className="border border-line" />

        <div className="mt-px grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-4">
          {boomsweeper.features.map((f) => (
            <article key={f.name} className="flex flex-col bg-panel">
              <img
                src={f.image}
                alt={`Boomsweeper screenshot: ${f.name}`}
                loading="lazy"
                className="aspect-[4/5] w-full object-cover object-top"
              />
              <div className="flex flex-col gap-1.5 p-4">
                <h2 className="text-base font-semibold">{f.name}</h2>
                <p className="text-[0.8125rem] leading-relaxed text-muted">{f.body}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 border border-line bg-panel p-5">
          <h2 className="silkscreen mb-4 text-caution">How it is built</h2>
          <ul className="flex flex-col gap-2.5">
            {boomsweeper.built.map((b) => (
              <li
                key={b}
                className="relative max-w-[75ch] pl-4 text-[0.875rem] leading-relaxed text-body
                           before:absolute before:top-2.5 before:left-0 before:h-px before:w-2
                           before:bg-amber"
              >
                {b}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {boomsweeper.tags.map((t) => (
              <span key={t} className="silkscreen border border-line px-2 py-1 text-muted">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* The original web build stays playable, labelled for what it is. */}
        <div className="mt-12">
          <h2 className="silkscreen mb-3 text-bright">Early web prototype</h2>
          <p className="mb-4 max-w-[65ch] text-[0.875rem] leading-relaxed text-body">
            Five boards from an early version of the game, built for the browser before the
            Android release. The rules and look have moved on since; the full game is on Google
            Play.
          </p>
          <GameEmbed
            src="/boomsweeper/index.html"
            title="BOOMSWEEPER prototype"
            downloadHint="About 13 MB on first load, cached after that"
          />
        </div>
      </div>
    </section>
  )
}
