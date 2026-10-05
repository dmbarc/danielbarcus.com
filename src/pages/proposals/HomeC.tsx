import { Link } from 'react-router-dom'

import { Trailer } from '../../components/Showcase'
import {
  about,
  boomsweeper,
  demos,
  disclosure,
  education,
  experience,
  hero,
  profile,
  projects,
  skills,
  studio,
} from '../../content/site'

/**
 * Proposal C — a light, editorial portfolio in the Biggietronics palette
 * (navy, cream, the three stripes). Rendered outside the instrument-panel
 * Layout so it can be judged on its own.
 */

const ink = '!text-[#1c1840]'
const body = 'text-[#4b4256]'

function Stripes({ className = '' }: { className?: string }) {
  return (
    <span className={`flex flex-col gap-[3px] ${className}`} aria-hidden="true">
      <span className="h-[5px] -skew-x-12 bg-[#ffc62e]" />
      <span className="h-[5px] -skew-x-12 bg-[#ff7b22]" />
      <span className="h-[5px] -skew-x-12 bg-[#ff3d6e]" />
    </span>
  )
}

function Head({ id, kicker, title }: { id: string; kicker: string; title: string }) {
  return (
    <div className="mb-8">
      <p className="mb-2 font-mono text-[0.7rem] tracking-[0.18em] text-[#ff3d6e] uppercase">{kicker}</p>
      <h2 id={id} className={`text-[clamp(1.6rem,3.4vw,2.3rem)] leading-tight font-bold ${ink}`}>
        {title}
      </h2>
    </div>
  )
}

function Btn({
  href,
  children,
  solid = false,
}: {
  href: string
  children: React.ReactNode
  solid?: boolean
}) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel="noreferrer"
      className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors ${
        solid
          ? 'bg-[#1c1840] text-[#f4ead3] hover:bg-[#ff3d6e]'
          : 'border border-[#1c1840]/25 text-[#1c1840] hover:border-[#1c1840]'
      }`}
    >
      {children}
    </a>
  )
}

export function HomeC() {
  return (
    <div className="min-h-screen bg-[#f6f1e6] text-[#4b4256] [color-scheme:light]">
      <header className="sticky top-0 z-40 border-b border-[#1c1840]/10 bg-[#f6f1e6]/90 backdrop-blur">
        <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <a href="#top" className={`font-bold tracking-tight ${ink}`}>
            Daniel Barcus
          </a>
          <div className="flex gap-5 text-sm font-medium">
            <a href="#games" className="hover:text-[#ff3d6e]">Games</a>
            <a href="#work" className="hidden hover:text-[#ff3d6e] sm:inline">Work</a>
            <a href="#experience" className="hidden hover:text-[#ff3d6e] sm:inline">Experience</a>
            <a href="#contact" className="hover:text-[#ff3d6e]">Contact</a>
          </div>
        </nav>
      </header>

      <main id="top">
        {/* Hero */}
        <section className="px-4 pt-16 pb-14 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <Stripes className="mb-6 w-16" />
            <h1 className={`max-w-[18ch] text-[clamp(2.3rem,6vw,4.2rem)] leading-[1.02] font-bold tracking-tight ${ink}`}>
              Software engineer and founder of {studio.name}.
            </h1>
            <p className={`mt-5 max-w-[58ch] text-lg leading-relaxed ${body}`}>
              I build games and interactive software in Unity, C# and .NET. My studio's first game,
              Boomsweeper, is out now on Google Play. Before that I spent five years building
              training simulations for military aircraft maintenance.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Btn href={boomsweeper.playUrl} solid>
                Boomsweeper on Google Play
              </Btn>
              <Btn href={studio.url}>{studio.urlLabel} →</Btn>
              <Btn href="#contact">Get in touch</Btn>
            </div>
          </div>
        </section>

        {/* Featured game */}
        <section className="px-4 pb-20 sm:px-6" aria-labelledby="games">
          <div className="mx-auto max-w-5xl">
            <Head id="games" kicker="Featured game" title="Boomsweeper, out now on Google Play" />
            <div className="overflow-hidden rounded-3xl bg-[#1c1840] text-[#f4ead3] shadow-[0_30px_60px_-30px_rgba(28,24,64,.6)]">
              <div className="grid lg:grid-cols-[1.3fr_1fr]">
                <Trailer />
                <div className="flex flex-col justify-center gap-4 p-7">
                  <div className="flex items-center gap-4">
                    <img src={boomsweeper.icon} alt="" className="size-16 rounded-[22%]" />
                    <div>
                      <p className="text-2xl font-bold text-white">{boomsweeper.name}</p>
                      <p className="text-sm text-[#ffc62e]">{boomsweeper.tagline}</p>
                    </div>
                  </div>
                  <p className="leading-relaxed text-[#f4ead3]/80">{boomsweeper.pitch}</p>
                  <div className="flex flex-wrap gap-2">
                    {boomsweeper.facts.map((f) => (
                      <span key={f.key} className="rounded-full bg-white/10 px-3 py-1 text-xs">
                        {f.key}: <b className="text-white">{f.value}</b>
                      </span>
                    ))}
                  </div>
                  <a
                    href={boomsweeper.playUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-2 self-start rounded-full bg-[#ffc62e] px-5 py-3 text-sm font-bold text-[#1c1840] hover:bg-white"
                  >
                    ▶ Get it on Google Play
                  </a>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-[#15122f] p-5 sm:grid-cols-4">
                {boomsweeper.features.map((f) => (
                  <figure key={f.name}>
                    <img src={f.image} alt={`Boomsweeper: ${f.name}`} loading="lazy" className="w-full rounded-xl" />
                    <figcaption className="mt-3 text-sm">
                      <b className="text-white">{f.name}.</b>{' '}
                      <span className="text-[#f4ead3]/70">{f.body}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>

            {/* Studio */}
            <div className="mt-6 grid items-center gap-6 rounded-3xl border border-[#1c1840]/10 bg-white/60 p-7 sm:grid-cols-[auto_1fr_auto]">
              <img src="/showcase/lockup-navy.svg" alt={studio.name} className="h-14 w-auto" />
              <p className={`max-w-[56ch] leading-relaxed ${body}`}>{studio.blurb}</p>
              <Btn href={studio.url}>Visit the studio →</Btn>
            </div>
          </div>
        </section>

        {/* Other work */}
        <section className="bg-white/50 px-4 py-20 sm:px-6" aria-labelledby="work">
          <div className="mx-auto max-w-5xl">
            <Head id="work" kicker="Interactive work" title="Run it in your browser" />
            <p className={`-mt-4 mb-8 max-w-[62ch] ${body}`}>
              {hero.cta} <span className="text-[#4b4256]/70">{disclosure.short}.</span>
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {demos.map((d) => (
                <Link
                  key={d.id}
                  to={d.to ?? '/'}
                  className="group flex flex-col gap-2 rounded-2xl border border-[#1c1840]/10 bg-[#f6f1e6] p-5 hover:border-[#ff3d6e]"
                >
                  <span className="font-mono text-xs text-[#ff7b22]">{d.index}</span>
                  <span className={`text-lg font-semibold ${ink}`}>{d.name}</span>
                  <span className="text-sm leading-relaxed">{d.blurb}</span>
                  <span className="mt-auto pt-2 text-sm font-semibold text-[#1c1840] group-hover:text-[#ff3d6e]">
                    Open →
                  </span>
                </Link>
              ))}
              {projects
                .filter((p) => p.id !== 'boomsweeper')
                .map((p) => (
                  <Link
                    key={p.id}
                    to={p.to ?? '/'}
                    className="group flex flex-col gap-2 rounded-2xl border border-[#1c1840]/10 bg-[#f6f1e6] p-5 hover:border-[#ff3d6e]"
                  >
                    <span className="font-mono text-xs text-[#ff7b22]">Project</span>
                    <span className={`text-lg font-semibold ${ink}`}>{p.name}</span>
                    <span className="text-sm leading-relaxed">{p.blurb}</span>
                    <span className="mt-auto pt-2 text-sm font-semibold text-[#1c1840] group-hover:text-[#ff3d6e]">
                      {p.toLabel} →
                    </span>
                  </Link>
                ))}
            </div>
          </div>
        </section>

        {/* Experience */}
        <section className="px-4 py-20 sm:px-6" aria-labelledby="experience">
          <div className="mx-auto max-w-5xl">
            <Head id="experience" kicker="Experience" title="Where I have worked" />
            <div className="flex flex-col divide-y divide-[#1c1840]/10 border-y border-[#1c1840]/10">
              {experience.map((r) => (
                <article key={`${r.org}-${r.dates}`} className="grid gap-4 py-7 sm:grid-cols-[14rem_1fr]">
                  <div>
                    <h3 className={`font-semibold ${ink}`}>{r.title}</h3>
                    <p className="text-sm">{r.org}</p>
                    <p className="mt-1 font-mono text-xs text-[#4b4256]/70">{r.dates}</p>
                  </div>
                  <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[0.9rem] leading-relaxed marker:text-[#ff7b22]">
                    {r.bullets.slice(0, 4).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            <div className="mt-14 grid gap-10 lg:grid-cols-[1.15fr_1fr]">
              <div>
                <h3 className={`mb-4 text-xl font-bold ${ink}`}>{about.heading}</h3>
                {about.body.slice(0, 2).map((p, i) => (
                  <p key={i} className="mb-4 max-w-[62ch] leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
              <div>
                <h3 className={`mb-4 text-xl font-bold ${ink}`}>Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {skills.flatMap((s) => s.items).map((i) => (
                    <span key={i} className="rounded-full border border-[#1c1840]/15 px-3 py-1 text-xs">
                      {i}
                    </span>
                  ))}
                </div>
                <h3 className={`mt-8 mb-3 text-xl font-bold ${ink}`}>Education</h3>
                {education.map((e) => (
                  <p key={e.what} className="text-sm">
                    <b className={ink}>{e.what}</b>, {e.where} · {e.when}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="px-4 pb-20 sm:px-6" aria-labelledby="contact">
          <div className="mx-auto max-w-5xl rounded-3xl bg-[#1c1840] p-8 text-[#f4ead3] sm:p-12">
            <Stripes className="mb-6 w-14" />
            <h2 id="contact" className="max-w-[24ch] text-[clamp(1.5rem,3vw,2.2rem)] leading-tight font-bold !text-white">
              Want to work together, or talk about the games?
            </h2>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={`mailto:${profile.email}`} className="rounded-full bg-[#ffc62e] px-5 py-3 text-sm font-bold text-[#1c1840] hover:bg-white">
                {profile.email}
              </a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className="rounded-full border border-white/25 px-5 py-3 text-sm font-semibold hover:border-white">
                LinkedIn
              </a>
              <a href={profile.github} target="_blank" rel="noreferrer" className="rounded-full border border-white/25 px-5 py-3 text-sm font-semibold hover:border-white">
                GitHub
              </a>
              <a href={studio.url} target="_blank" rel="noreferrer" className="rounded-full border border-white/25 px-5 py-3 text-sm font-semibold hover:border-white">
                {studio.urlLabel}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#1c1840]/10 px-4 py-8 text-sm sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-wrap justify-between gap-4">
          <span>
            {profile.name} · {profile.location}
          </span>
          <a href={studio.url} target="_blank" rel="noreferrer" className="hover:text-[#ff3d6e]">
            {studio.name}
          </a>
        </div>
      </footer>
    </div>
  )
}
