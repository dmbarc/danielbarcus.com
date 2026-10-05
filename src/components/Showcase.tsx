import { useState } from 'react'

import { boomsweeper, studio } from '../content/site'

/** Google Play's triangle, drawn flat so it sits in any button colour. */
function PlayGlyph({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M4 2.6v18.8c0 .5.5.8.9.6L21 12.6c.4-.2.4-.9 0-1.2L4.9 2c-.4-.2-.9.1-.9.6Z" />
    </svg>
  )
}

export function PlayButton({ className = '' }: { className?: string }) {
  return (
    <a
      href={boomsweeper.playUrl}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-2 border border-amber bg-amber px-4 py-3 silkscreen
                  text-screen transition-colors hover:bg-transparent hover:text-amber ${className}`}
    >
      <PlayGlyph className="size-3.5" />
      Get it on Google Play
    </a>
  )
}

export function StudioButton({ className = '' }: { className?: string }) {
  return (
    <a
      href={studio.url}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-2 border border-line px-4 py-3 silkscreen text-cyan
                  transition-colors hover:border-cyan ${className}`}
    >
      {studio.name} studio site →
    </a>
  )
}

function Facts() {
  return (
    <dl className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
      {boomsweeper.facts.map((f, i) => (
        <div key={f.key} className="bg-screen px-3 py-2.5">
          <dt className="silkscreen mb-1.5 text-muted">{f.key}</dt>
          <dd className={`font-mono text-sm font-bold ${i % 2 ? 'text-cyan' : 'text-amber'}`}>
            {f.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/** Click-to-play trailer; nothing downloads until someone asks for it. */
export function Trailer({ className = '' }: { className?: string }) {
  const [playing, setPlaying] = useState(false)
  return (
    <div className={`relative aspect-video overflow-hidden bg-screen ${className}`}>
      {playing ? (
        <video
          src={boomsweeper.trailer}
          poster={boomsweeper.poster}
          controls
          autoPlay
          playsInline
          className="size-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 block size-full"
          aria-label="Play the Boomsweeper trailer"
        >
          <img src={boomsweeper.poster} alt="" className="size-full object-cover" />
          <span className="absolute inset-0 grid place-items-center bg-screen/30 transition-colors group-hover:bg-screen/10">
            <span className="flex items-center gap-2 border border-amber bg-screen/80 px-4 py-3 silkscreen text-amber">
              <PlayGlyph className="size-3.5" /> Watch the trailer · 0:28
            </span>
          </span>
        </button>
      )}
    </div>
  )
}

/**
 * The featured game: a full showcase section — trailer, the four things the game
 * does, and how it is built — that reads like a small press kit.
 */
export function BoomsweeperShowcase() {
  return (
    <section className="px-4 pt-14 sm:px-6" aria-labelledby="boomsweeper">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-baseline gap-4">
          <h2 id="boomsweeper" className="silkscreen text-[0.8125rem] text-bright">
            Featured game
          </h2>
          <span className="h-px flex-1 bg-line" aria-hidden="true" />
          <span className="silkscreen text-muted">{studio.name}</span>
        </div>

        <div className="grid gap-px border border-line bg-line lg:grid-cols-[1.35fr_1fr]">
          <Trailer />
          <div className="flex flex-col justify-center gap-4 bg-panel p-6">
            <div className="flex items-center gap-3">
              <img src={boomsweeper.icon} alt="" width={56} height={56} className="size-14 rounded-[22%]" />
              <div>
                <h3 className="text-2xl leading-tight font-bold">{boomsweeper.name}</h3>
                <p className="silkscreen mt-1.5 text-status">{boomsweeper.kicker}</p>
              </div>
            </div>
            <p className="text-[0.95rem] leading-relaxed text-body">{boomsweeper.pitch}</p>
            <Facts />
            <div className="flex flex-wrap gap-3">
              <PlayButton />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px border border-t-0 border-line bg-line md:grid-cols-4">
          {boomsweeper.features.map((f) => (
            <article key={f.name} className="flex flex-col bg-panel">
              <img
                src={f.image}
                alt={`Boomsweeper screenshot: ${f.name}`}
                loading="lazy"
                className="aspect-[4/5] w-full object-cover object-top"
              />
              <div className="flex flex-col gap-1.5 p-4">
                <h4 className="text-base font-semibold text-bright">{f.name}</h4>
                <p className="text-[0.8125rem] leading-relaxed text-muted">{f.body}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="grid gap-px border border-t-0 border-line bg-line md:grid-cols-[1fr_1.2fr]">
          <div className="flex flex-col justify-between gap-5 bg-[#1c1840] p-6">
            <img src={`${import.meta.env.BASE_URL}showcase/lockup-cream.svg`} alt={studio.name} className="h-12 w-auto self-start" />
            <p className="text-[0.875rem] leading-relaxed text-[#f4ead3]/80">{studio.blurb}</p>
            <a
              href={studio.url}
              target="_blank"
              rel="noreferrer"
              className="silkscreen self-start border border-[#f4ead3]/30 px-4 py-3 text-[#f4ead3] hover:border-[#ffc62e] hover:text-[#ffc62e]"
            >
              Visit {studio.urlLabel} →
            </a>
          </div>
          <div className="bg-panel p-6">
            <h4 className="silkscreen mb-4 text-caution">How it is built</h4>
            <ul className="flex flex-col gap-2.5">
              {boomsweeper.built.map((b) => (
                <li
                  key={b}
                  className="relative pl-4 text-[0.875rem] leading-relaxed text-body before:absolute
                             before:top-2.5 before:left-0 before:h-px before:w-2 before:bg-amber"
                >
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
