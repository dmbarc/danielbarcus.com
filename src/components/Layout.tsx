import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'

import { profile } from '../content/site'

/**
 * Softkeys address sections of the home page, not routes, so these are
 * plain anchors. Routing them through NavLink marks every one active,
 * because `/#work` resolves to the pathname `/`.
 *
 * They are also only shown on the home page. On a detail page there is no
 * `#instruments` section to scroll to, so every one of them was a control
 * that looked live and did nothing — worse than no control at all.
 */
const nav = [
  { key: 'L1', label: 'Home', hash: '' },
  { key: 'L2', label: 'Instruments', hash: '#instruments' },
  { key: 'L3', label: 'Work', hash: '#work' },
  { key: 'L4', label: 'About', hash: '#about' },
]

/** What a detail route is called, for the bezel's back key. */
const SECTION_OF: { prefix: string; label: string; backTo: string }[] = [
  { prefix: '/instruments/', label: 'Instrument', backTo: '/#instruments' },
  { prefix: '/projects/', label: 'Project', backTo: '/#work' },
]

function useCurrentHash() {
  const [hash, setHash] = useState(() =>
    typeof window === 'undefined' ? '' : window.location.hash,
  )
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

/**
 * The site chrome is a bezel: a status strip across the top and a row of
 * softkeys, the way a multi-function display is laid out.
 */
export function Layout() {
  const hash = useCurrentHash()
  const { pathname } = useLocation()
  const section = SECTION_OF.find((s) => pathname.startsWith(s.prefix))
  const onHome = !section

  return (
    <div className="min-h-screen bg-ground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50
                   focus:bg-amber focus:px-3 focus:py-2 focus:silkscreen focus:text-screen"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-line bg-rail/95 backdrop-blur">
        {/* Status strip — the line a real panel puts above the display. */}
        <div
          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b
                     border-line/60 px-4 py-1.5 silkscreen text-muted sm:px-6"
        >
          <span>{profile.shortName}</span>
          {profile.available && (
            <span className="flex items-center gap-1.5 text-status">
              <span className="size-1.5 rounded-full bg-status" aria-hidden="true" />
              {profile.availabilityNote}
            </span>
          )}
          <span className="hidden sm:inline">{profile.location}</span>
        </div>

        <nav
          aria-label="Primary"
          className="flex items-center gap-1 overflow-x-auto px-4 py-2 sm:px-6"
        >
          {onHome ? (
            nav.map((item) => {
              const active = hash === item.hash
              return (
                <a
                  key={item.key}
                  href={item.hash || '#main'}
                  aria-current={active ? 'true' : undefined}
                  className={[
                    'shrink-0 border px-3 py-2 text-center silkscreen transition-colors',
                    active
                      ? 'border-amber bg-amber text-screen'
                      : 'border-line bg-screen/60 text-muted hover:border-amber/60 hover:text-amber',
                  ].join(' ')}
                >
                  <span className="mr-1.5 opacity-60">{item.key}</span>
                  {item.label}
                </a>
              )
            })
          ) : (
            /* One live control instead of four dead ones. */
            <>
              <Link
                to={section.backTo}
                className="shrink-0 border border-amber bg-amber px-3 py-2 silkscreen
                           text-screen transition-colors hover:bg-transparent hover:text-amber"
              >
                <span className="mr-1.5 opacity-60">L1</span>
                Back
              </Link>
              <span className="silkscreen ml-2 truncate text-muted">{section.label} view</span>
            </>
          )}
        </nav>
      </header>

      <main id="main">
        <Outlet />
      </main>

      <footer className="border-t border-line px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
          <p className="silkscreen text-muted">
            {profile.name} · {profile.location}
          </p>
          <div className="flex flex-wrap gap-4">
            <a className="silkscreen text-cyan hover:text-amber" href={`mailto:${profile.email}`}>
              Email
            </a>
            <a
              className="silkscreen text-cyan hover:text-amber"
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
            <a
              className="silkscreen text-cyan hover:text-amber"
              href={profile.github}
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
