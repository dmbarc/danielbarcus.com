# danielbarcus.com

Portfolio site for Daniel Barcus. React 19 + Vite + Tailwind 4, deployed as a
Cloudflare Worker serving static assets.

## Design

One visual direction — "Instrument Panel" — merging an oscilloscope's CRT
palette with a glass-cockpit panel's structure. Both come from real work: a
waveform generator and scope built at Carley, and CH-53K MFD/CDU interfaces.
Colors and type live as tokens in `src/index.css` under `@theme`.

The site is deliberately single-theme. An instrument panel is dark; a light
mode would be a different object, not the same one recolored.

## Content

Every word on the site is in `src/content/site.ts`. Edit copy there — no
component changes needed.

## Commands

```bash
npm run dev       # dev server on :5173
npm run build     # typecheck + production build to dist/
npm run preview   # build, then serve through the real Workers runtime
npm run deploy    # build + wrangler deploy
npm run lint      # oxlint
```

## Deploying

One-time, in a terminal:

```bash
npx wrangler login
```

Then `npm run deploy`. The custom domain `danielbarcus.com` is attached in the
Cloudflare dashboard under the Worker's Settings → Domains & Routes; that
replaces the stale DNS records currently returning 522.

`not_found_handling: "single-page-application"` in `wrangler.jsonc` is what
makes client-side routes resolve instead of 404ing.
