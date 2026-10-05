import { Link } from 'react-router-dom'

import { Disclosure } from '../components/Disclosure'
import { ScopeTrace } from '../components/ScopeTrace'
import { BoomsweeperShowcase, PlayButton, StudioButton } from '../components/Showcase'
import {
  about,
  boomsweeper,
  demos,
  education,
  experience,
  hero,
  profile,
  projects,
  skills,
  studio,
} from '../content/site'

const toneClass: Record<string, string> = {
  live: 'text-status border-status/40',
  caution: 'text-caution border-caution/40',
  idle: 'text-muted border-line',
}

function SectionHead({ id, title, count }: { id: string; title: string; count?: string }) {
  return (
    <div className="mb-6 flex items-baseline gap-4">
      <h2 id={id} className="silkscreen text-[0.8125rem] text-bright">
        {title}
      </h2>
      <span className="h-px flex-1 bg-line" aria-hidden="true" />
      {count && <span className="silkscreen text-muted">{count}</span>}
    </div>
  )
}

/** A name-first hero: who Daniel is, what he runs, and the game, before anything else. */
export function HeroSection() {
  return (
    <section className="px-4 pt-6 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden border-2 border-line bg-screen">
          <ScopeTrace className="absolute inset-0 h-full opacity-50" />
      {/* A scrim keeps the text legible over the moving trace. */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-screen via-screen/80
                   to-screen/20"
        aria-hidden="true"
      />
          <div className="relative grid gap-8 px-6 py-8 sm:px-10 md:grid-cols-[1.25fr_1fr] md:items-center">
            <div>
              <p className="silkscreen mb-4 text-cyan">{hero.eyebrow}</p>
              <h1 className="text-[clamp(2.4rem,6.5vw,4.4rem)] leading-[0.98] font-bold tracking-tight">
                {profile.name.replace(' M.', '')}
              </h1>
              <p className="mt-4 max-w-[34ch] text-lg leading-snug font-semibold text-bright">
                {hero.headline}
              </p>
              <p className="mt-3 max-w-[50ch] text-[0.9rem] leading-relaxed">{hero.lede}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <PlayButton />
                <StudioButton />
              </div>
            </div>
            <div className="relative mx-auto flex w-full max-w-[340px] justify-center">
              <img
                src={boomsweeper.features[2].image}
                alt=""
                className="absolute top-8 left-0 w-[52%] -rotate-6 rounded-[1.1rem] border-4 border-rail opacity-80 shadow-xl"
              />
              <img
                src={boomsweeper.features[0].image}
                alt="Boomsweeper on Android"
                className="relative z-10 ml-[30%] w-[58%] rotate-3 rounded-[1.1rem] border-4 border-rail shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function InstrumentsSection() {
  return (
  <section className="px-4 py-14 sm:px-6" aria-labelledby="instruments">
    <div className="mx-auto max-w-5xl">
      <SectionHead id="instruments" title="Instruments" count={`${demos.length} builds`} />
      <p className="mb-6 max-w-[65ch] text-[0.95rem] leading-relaxed text-body">{hero.cta}</p>
      <Disclosure />

      <div className="grid gap-px bg-line sm:grid-cols-3">
        {demos.map((d) => (
          <article key={d.id} className="flex flex-col gap-3 bg-panel p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-caution">{d.index}</span>
              <span
                className={`silkscreen border px-2 py-1 ${
                  d.status === 'live'
                    ? 'border-status/50 text-status'
                    : 'border-line text-muted'
                }`}
              >
                {d.status === 'live' ? 'Running' : 'Building'}
              </span>
            </div>
            <h3 className="text-lg leading-snug font-semibold">
              {d.to ? (
                <Link to={d.to} className="hover:text-amber">
                  {d.name}
                </Link>
              ) : (
                d.name
              )}
            </h3>
            <p className="text-sm leading-relaxed text-body">{d.blurb}</p>
            <p className="text-[0.8125rem] leading-relaxed text-muted">{d.detail}</p>
            <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
              {d.tags.map((t) => (
                <span key={t} className="silkscreen border border-line px-2 py-1 text-muted">
                  {t}
                </span>
              ))}
            </div>
            {d.to && (
              <Link className="silkscreen text-cyan hover:text-amber" to={d.to}>
                Open the instrument →
              </Link>
            )}
          </article>
        ))}
      </div>
    </div>
  </section>
  )
}

function ProjectsSection({ items = projects }: { items?: typeof projects }) {
  return (
  <section className="px-4 pb-14 sm:px-6" aria-labelledby="work">
    <div className="mx-auto max-w-5xl">
      <SectionHead id="work" title="Projects" />
      <div className={`grid gap-px bg-line ${items.length > 1 ? 'sm:grid-cols-2' : ''}`}>
        {items.map((p) => (
          <article key={p.id} className="flex flex-col gap-3 bg-panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg leading-snug font-semibold">{p.name}</h3>
              <span className={`silkscreen border px-2 py-1 ${toneClass[p.statusTone]}`}>
                {p.status}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-body">{p.blurb}</p>
            <p className="text-[0.8125rem] leading-relaxed text-muted">{p.detail}</p>
            <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
              {p.tags.map((t) => (
                <span key={t} className="silkscreen border border-line px-2 py-1 text-muted">
                  {t}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {p.to && (
                <Link className="silkscreen text-amber hover:text-bright" to={p.to}>
                  {p.toLabel} →
                </Link>
              )}
              {p.href && (
                <a
                  className="silkscreen text-cyan hover:text-amber"
                  href={p.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {p.hrefLabel} →
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
  )
}

function ExperienceSection() {
  return (
  <section className="px-4 pb-14 sm:px-6" aria-labelledby="experience">
    <div className="mx-auto max-w-5xl">
      <SectionHead id="experience" title="Experience" />
      <div className="flex flex-col">
        {experience.map((role) => (
          <article
            key={`${role.org}-${role.dates}`}
            className="grid gap-4 border-t border-line py-6 sm:grid-cols-[minmax(0,14rem)_1fr]"
          >
            <div>
              <h3 className="text-base font-semibold">{role.title}</h3>
              <p className="text-sm text-body">{role.org}</p>
              <p className="silkscreen mt-2 text-muted">{role.dates}</p>
              <p className="silkscreen mt-1 text-muted">{role.location}</p>
            </div>
            <ul className="flex flex-col gap-2">
              {role.bullets.map((b, i) => (
                <li
                  key={i}
                  className="relative pl-4 text-[0.875rem] leading-relaxed text-body
                             before:absolute before:top-2.5 before:left-0 before:h-px
                             before:w-2 before:bg-amber"
                >
                  {b}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  </section>
  )
}

function AboutSection() {
  return (
  <section className="px-4 pb-14 sm:px-6" aria-labelledby="about">
    <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.15fr_1fr]">
      <div>
        <SectionHead id="about" title={about.heading} />
        <div className="flex flex-col gap-4">
          {about.body.map((p, i) => (
            <p key={i} className="max-w-[65ch] text-[0.95rem] leading-relaxed text-body">
              {p}
            </p>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div>
          <SectionHead id="skills" title="Skills" />
          <dl className="flex flex-col gap-4">
            {skills.map((s) => (
              <div key={s.group}>
                <dt className="silkscreen mb-2 text-muted">{s.group}</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {s.items.map((i) => (
                    <span key={i} className="silkscreen border border-line px-2 py-1 text-body">
                      {i}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <SectionHead id="education" title="Education" />
          <ul className="flex flex-col gap-3">
            {education.map((e) => (
              <li key={e.what} className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-bright">{e.what}</p>
                  <p className="text-[0.8125rem] text-muted">{e.where}</p>
                </div>
                <span className="silkscreen text-muted tabular-nums">{e.when}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
  )
}

function ContactSection() {
  return (
  <section className="px-4 pb-16 sm:px-6" aria-labelledby="contact">
    <div className="mx-auto max-w-5xl border border-line bg-panel p-8">
      <SectionHead id="contact" title="Contact" />
      <p className="mb-6 max-w-[52ch] text-lg leading-snug font-semibold text-bright">
        I am looking for my next role. If you are hiring for simulation, .NET, or full-stack
        work, I would like to hear about it.
      </p>
      <div className="flex flex-wrap gap-3">
        <a
          className="border border-amber bg-amber px-4 py-3 silkscreen text-screen
                     hover:bg-transparent hover:text-amber"
          href={`mailto:${profile.email}`}
        >
          {profile.email}
        </a>
        <a
          className="border border-line px-4 py-3 silkscreen text-cyan hover:border-cyan"
          href={profile.linkedin}
          target="_blank"
          rel="noreferrer"
        >
          LinkedIn
        </a>
        <a
          className="border border-line px-4 py-3 silkscreen text-cyan hover:border-cyan"
          href={profile.github}
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
        <a
          className="border border-line px-4 py-3 silkscreen text-cyan hover:border-cyan"
          href={studio.url}
          target="_blank"
          rel="noreferrer"
        >
          {studio.name}
        </a>
      </div>
    </div>
  </section>
  )
}

export function Home() {
  return (
    <>
      <HeroSection />
      <BoomsweeperShowcase />
      <InstrumentsSection />
      {/* Boomsweeper has its own section above, so the grid lists the rest. */}
      <ProjectsSection items={projects.filter((p) => p.id !== 'boomsweeper')} />
      <ExperienceSection />
      <AboutSection />
      <ContactSection />
    </>
  )
}
