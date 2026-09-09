import { Link } from 'react-router-dom'

import { GameEmbed } from '../components/GameEmbed'
import { projects } from '../content/site'

const project = projects.find((p) => p.id === 'boomsweeper')!

export function ProjectBoomsweeper() {
  return (
    <section className="px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link to="/#work" className="silkscreen text-cyan hover:text-amber">
          ← All projects
        </Link>

        <header className="mt-5 mb-6">
          <p className="silkscreen mb-3 text-caution">Unity · C# · Android</p>
          <h1 className="mb-3 text-[clamp(1.6rem,4vw,2.5rem)] leading-tight font-bold">
            {project.name}
          </h1>
          <p className="max-w-[65ch] text-[0.95rem] leading-relaxed text-body">
            Minesweeper where flagging a mine earns you nothing at all. The only way to score is to
            keep opening cells you are not certain about, which turns the safest move in the game
            into the least rewarding one.
          </p>
        </header>

        <GameEmbed
          src="/boomsweeper/index.html"
          title="BOOMSWEEPER"
          downloadHint="About 13 MB on first load, cached after that"
        />

        <p className="mt-3 silkscreen text-muted">
          Demo — five boards. The full game is coming to Android.
        </p>

        <div className="mt-8 grid gap-px bg-line sm:grid-cols-2">
          <article className="bg-panel p-5">
            <h2 className="mb-3 text-base font-semibold">The design problem</h2>
            <p className="mb-3 text-[0.8125rem] leading-relaxed text-body">
              Classic minesweeper has an economy problem: flagging is free, safe, and correct, so a
              careful player spends most of the game doing the thing that carries no risk. The board
              stops being a gamble and becomes bookkeeping.
            </p>
            <p className="text-[0.8125rem] leading-relaxed text-body">
              Scoring nothing for flags removes the safe move entirely. You can still flag — it
              still helps you think — but the score only moves when you open a cell, and the cells
              worth opening are the ones you are least sure about.
            </p>
          </article>
          <article className="bg-panel p-5">
            <h2 className="mb-3 text-base font-semibold">How it is built</h2>
            <p className="mb-3 text-[0.8125rem] leading-relaxed text-body">
              The rules live in a plain C# library with no Unity types in it, so the board can be
              tested without an engine, an editor, or a running game. Unity is the presentation
              layer over the top of it — the same separation the MFD demo on this site uses, for the
              same reason.
            </p>
            <p className="text-[0.8125rem] leading-relaxed text-body">
              The layout transposes between portrait and landscape rather than locking to one, and
              draws correctly behind a phone's camera cutout. Shipping target is Android; this is
              the same game built for the web.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {project.tags.map((t) => (
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
