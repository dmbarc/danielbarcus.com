import { Link } from 'react-router-dom'

import { ScopeTrace } from '../components/ScopeTrace'
import {
  about,
  demos,
  education,
  experience,
  hero,
  profile,
  projects,
  readout,
  skills,
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

export function Home() {
  return (
    <>
      {/* ---------- Hero: the display, with the thesis over it ---------- */}
      <section className="px-4 pt-6 sm:px-6">
        <div className="mx-auto max-w-5xl">
          {/* On a phone the trace is a band above the text; from `sm` up
              there is room for the text to sit on the display, over a
              scrim that keeps it legible against a moving waveform. */}
          <div className="relative overflow-hidden border-2 border-line bg-screen">
            <ScopeTrace className="h-[150px] sm:h-[340px]" />
            <div
              className="pointer-events-none absolute inset-0 hidden sm:block
                         bg-gradient-to-r from-screen via-screen/85 to-transparent"
              aria-hidden="true"
            />
            <div
              className="px-6 py-7 sm:absolute sm:inset-0 sm:flex sm:flex-col sm:justify-center
                         sm:px-10 sm:py-8"
            >
              <p className="silkscreen mb-4 text-cyan">{hero.eyebrow}</p>
              <h1
                className="max-w-[15ch] text-[clamp(1.9rem,5.2vw,3.6rem)] leading-[1.02]
                           font-bold tracking-tight"
              >
                {hero.headline}
              </h1>
              <p className="mt-3 max-w-[46ch] text-[0.95rem] leading-relaxed">{hero.lede}</p>
            </div>
          </div>

          {/* Readout strip below the display, as on a bench instrument. */}
          <div className="mt-px grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
            {readout.map((r) => (
              <div key={r.key} className="bg-panel px-4 py-3">
                <div className="silkscreen mb-2 text-muted">{r.key}</div>
                <div
                  className={`font-mono text-base font-bold tabular-nums ${
                    r.channel === 1 ? 'text-amber' : 'text-cyan'
                  }`}
                >
                  {r.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Instruments: the demos built for this site ---------- */}
      <section className="px-4 py-14 sm:px-6" aria-labelledby="instruments">
        <div className="mx-auto max-w-5xl">
          <SectionHead id="instruments" title="Instruments" count={`${demos.length} builds`} />
          <p className="mb-8 max-w-[65ch] text-[0.95rem] leading-relaxed text-body">{hero.cta}</p>

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

      {/* ---------- Projects ---------- */}
      <section className="px-4 pb-14 sm:px-6" aria-labelledby="work">
        <div className="mx-auto max-w-5xl">
          <SectionHead id="work" title="Projects" />
          <div className="grid gap-px bg-line sm:grid-cols-2">
            {projects.map((p) => (
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
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Experience ---------- */}
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

      {/* ---------- About, skills, education ---------- */}
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

      {/* ---------- Contact ---------- */}
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
          </div>
        </div>
      </section>
    </>
  )
}
