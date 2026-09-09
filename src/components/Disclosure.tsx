import { disclosure } from '../content/site'

/**
 * The AI-authorship notice.
 *
 * Deliberately not styled as a footnote. It sits above the demos it is
 * about, in caution amber, at the same weight as everything else on the
 * page — a disclosure a reader has to hunt for does not do the job it
 * exists to do.
 */
export function Disclosure({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="mb-6 border border-caution/40 bg-caution/5 px-4 py-3 text-[0.8125rem] leading-relaxed text-body">
        <span className="silkscreen mr-2 text-caution">{disclosure.short}</span>
        {disclosure.body}
      </p>
    )
  }

  return (
    <aside className="mb-8 border border-caution/40 bg-caution/5 p-5">
      <h3 className="silkscreen mb-3 text-caution">{disclosure.heading}</h3>
      <p className="mb-3 max-w-[68ch] text-[0.875rem] leading-relaxed text-body">
        {disclosure.body}
      </p>
      <p className="max-w-[68ch] text-[0.875rem] leading-relaxed text-body">{disclosure.why}</p>
    </aside>
  )
}
