import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <section className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-xl border border-line bg-panel p-8">
        <p className="silkscreen mb-3 text-caution">No signal</p>
        <h1 className="mb-3 text-2xl font-bold">That page is not on this panel.</h1>
        <p className="mb-6 text-sm leading-relaxed text-body">
          The address you asked for does not match a page on this site.
        </p>
        <Link
          className="inline-block border border-amber px-4 py-3 silkscreen text-amber
                     hover:bg-amber hover:text-screen"
          to="/"
        >
          Back to home
        </Link>
      </div>
    </section>
  )
}
