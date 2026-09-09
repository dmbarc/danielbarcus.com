import { useRef, useState } from 'react'

type Props = {
  /** Path to the build's index.html, served from the site's own origin. */
  src: string
  title: string
  /** Roughly what the first load costs, shown before anyone commits to it. */
  downloadHint: string
  poster?: string
}

/**
 * A click-to-load frame for a Unity WebGL build.
 *
 * The gate is the point. A Unity build is tens of megabytes, and loading
 * it on page visit spends a stranger's bandwidth on something they never
 * asked for — on a phone, possibly their data. So the frame shows what it
 * will cost and waits to be asked.
 */
export function GameEmbed({ src, title, downloadHint, poster }: Props) {
  const [started, setStarted] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  function goFullscreen() {
    const el = wrapRef.current
    if (!el) return
    if (document.fullscreenElement) void document.exitFullscreen()
    else void el.requestFullscreen?.()
  }

  return (
    <div className="flex flex-col gap-px bg-line">
      <div className="bg-panel p-3">
        <div
          ref={wrapRef}
          className="relative aspect-[16/10] w-full overflow-hidden border-2 border-line bg-screen"
        >
          {started ? (
            <iframe
              src={src}
              title={title}
              className="absolute inset-0 h-full w-full border-0"
              // The build is served from this same origin, so it needs no
              // cross-origin privileges. Keeping the sandbox tight means a
              // third-party dependency inside the build cannot navigate the
              // page around the player.
              allow="autoplay; fullscreen; gamepad"
              sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-fullscreen"
            />
          ) : (
            <button
              type="button"
              onClick={() => setStarted(true)}
              className="group absolute inset-0 flex flex-col items-center justify-center gap-4
                         bg-screen text-center"
              style={
                poster
                  ? {
                      backgroundImage: `linear-gradient(rgba(12,11,7,0.72),rgba(12,11,7,0.86)), url(${poster})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }
                  : undefined
              }
            >
              <span
                className="flex size-16 items-center justify-center rounded-full border-2
                           border-amber text-amber transition-colors group-hover:bg-amber
                           group-hover:text-screen"
              >
                <svg viewBox="0 0 24 24" className="size-7" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span className="silkscreen text-bright">Load {title}</span>
              <span className="silkscreen max-w-[34ch] text-muted">
                {downloadHint} · runs in the browser · nothing to install
              </span>
            </button>
          )}
        </div>

        <div className="mt-px flex flex-wrap items-center justify-between gap-2 bg-panel px-1 pt-3">
          <p className="silkscreen text-muted">
            {started ? 'Running' : 'Not loaded'} · WebGL
          </p>
          <div className="flex gap-2">
            {started && (
              <button
                type="button"
                onClick={goFullscreen}
                className="border border-line px-3 py-2 silkscreen text-cyan hover:border-cyan"
              >
                Fullscreen
              </button>
            )}
            <a
              href={src}
              target="_blank"
              rel="noreferrer"
              className="border border-line px-3 py-2 silkscreen text-cyan hover:border-cyan"
            >
              Open in a tab
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
