import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'

/**
 * Only in the review build (VITE_PREVIEW=1): a switcher between the
 * proposals, and in-page `#section` links rescued from the hash router,
 * which would otherwise read them as routes.
 */
const options = [
  { to: '/', label: 'Current site' },
  { to: '/proposal-a', label: 'A · Refreshed' },
  { to: '/proposal-b', label: 'B · Founder first' },
  { to: '/proposal-c', label: 'C · Light' },
]

export function PreviewBar() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const a = (e.target as HTMLElement).closest('a')
      const href = a?.getAttribute('href')
      if (!href || !href.startsWith('#') || href.startsWith('#/')) return
      e.preventDefault()
      const el = href === '#main' || href === '#top' ? document.body : document.getElementById(href.slice(1))
      el?.scrollIntoView({ behavior: 'smooth' })
    }
    document.addEventListener('click', onClick)
    // Room for the bar, so it never sits over the footer.
    document.body.style.paddingBottom = '56px'
    return () => document.removeEventListener('click', onClick)
  }, [])

  return (
    <nav
      aria-label="Design proposals"
      className="fixed inset-x-0 bottom-0 z-50 flex flex-wrap items-center justify-center gap-1.5
                 border-t border-[#3a3527] bg-[#0c0b07]/95 px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]
                 font-mono text-[11px] backdrop-blur"
    >
      <span className="mr-1 hidden tracking-[0.14em] text-[#7e7660] uppercase sm:inline">Preview</span>
      {options.map((o) => (
        <NavLink
          key={o.to}
          to={o.to}
          end
          onClick={() => window.scrollTo(0, 0)}
          className={({ isActive }) =>
            `rounded border px-2.5 py-1.5 ${
              isActive
                ? 'border-[#ffb000] bg-[#ffb000] text-[#0c0b07]'
                : 'border-[#3a3527] text-[#f4eedc] hover:border-[#ffb000]'
            }`
          }
        >
          {o.label}
        </NavLink>
      ))}
    </nav>
  )
}
