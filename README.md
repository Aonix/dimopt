# Surrey Elite Performance

A bespoke, direct-response landing page and portfolio for a private personal-training
practice serving Guildford, Cobham, Weybridge and Esher. Built to replace
funnel-builder pages (GoHighLevel and similar) — no iframes, no third-party form
embeds, no tracking bloat.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Astro 7, `output: 'static'` (fully prerendered) |
| Deploy target | Cloudflare Workers via `@astrojs/cloudflare` 14 |
| Language | TypeScript, `astro/tsconfigs/strict` + `noUncheckedIndexedAccess` |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`), tokens in `src/styles/global.css` |
| Islands | React 19 — only three, each hydrated on its own trigger |
| Icons | `@lucide/astro` (static markup) and `lucide-react` (islands) |
| Scrolling | `lenis` — the maintained successor to `@studio-freight/lenis` |

## Commands

```bash
npm run dev            # dev server (add -- --port 4321 --host 0.0.0.0)
npm run build          # production build
npm run preview        # serve the built worker under real workerd
npm run check          # astro check — 0 errors, 0 warnings, 0 hints
npm run typecheck      # tsc --noEmit
npm run verify:images  # re-verify every Unsplash id still returns an image
npm run deploy         # wrangler deploy (after build)
```

## Two things worth knowing

**Dev runs on Node, build and preview run on workerd.** `@cloudflare/vite-plugin`
loads the React renderer and the islands through separate module runners, which
gives two React instances and makes every hook throw "invalid hook call" during
the dev server render. The site declares no Cloudflare bindings, so nothing is
lost by using Astro's Node dev server; `astro build` and `astro preview` still
exercise the real workerd runtime, which is the path that ships. See the comment
in `astro.config.mjs`.

**There are two lead handlers, sharing one validator.**
`src/lib/lead.ts` holds all validation and response shaping. It is consumed by:

- `src/pages/api/lead.ts` — the Astro endpoint (`prerender = false`). Serves
  `/api/lead` in dev, preview, and on Workers.
- `functions/api/lead.ts` — the Cloudflare **Pages Function**, for deployments
  that use the `functions/` convention.

Behaviour cannot drift because neither contains logic of its own.

### `POST /api/lead`

```jsonc
// 201
{ "success": true, "message": "Application received", "reference": "SEP-L4QAXE" }
// 422 — per-field errors, keyed to form fields
{ "success": false, "message": "Some answers need attention.", "errors": [...] }
```

Also returns 405 (wrong method), 415 (wrong content-type) and 400 (malformed JSON).
A honeypot field rejects bots without telling them why. The handler currently logs
the validated payload — swap that one `console.log` for a CRM or webhook call.

## Content

All copy, clients, quotes, metrics and WhatsApp threads in `src/data/site.ts` are
**fictional demonstration content**, disclaimed in the results section and the
footer. Replace before launch.

Photographs are Unsplash. Every id in `src/data/images.ts` is HTTP-verified —
roughly a quarter of Unsplash ids are paywalled Unsplash+ and 404 on the public
CDN, so run `npm run verify:images` after changing any of them.

## Design

Dark-luxury editorial, grounded in **bespoke tailoring** — the trade that measures
a body and reshapes it across successive fittings.

- **Palette** — worsted navy-black ground, tailor's chalk text, oxblood lining
  silk as the accent, antique brass as hardware.
- **Type** — Newsreader (display), Instrument Sans (body), Martian Mono
  (measurements, eyebrows, labels).
- **Signature** — a tape-measure rule, used three ways: the page spine on wide
  screens, the qualifier's progress track, and the before/after slider handle.
