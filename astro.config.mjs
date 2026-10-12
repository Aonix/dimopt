// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
/**
 * `astro dev` runs SSR inside workerd via @cloudflare/vite-plugin, and that
 * runtime loads the React renderer and the islands through separate module
 * runners — two React instances, so every hook throws "invalid hook call" on
 * the server render. The site declares no Cloudflare bindings, so there is
 * nothing for workerd to emulate in dev; we use Astro's Node dev server there
 * and keep the adapter for `build`/`preview`, which is the path that ships and
 * which does run under real workerd.
 */
const command = process.argv[2];
const needsAdapter = command !== 'dev';

// Every marketing surface is prerendered for instant edge delivery. The single
// dynamic route is /api/lead (`prerender = false`), so the adapter emits a worker
// that handles it in `astro dev`, `astro preview` and on Cloudflare alike. The
// standalone Pages Function in /functions/api/lead.ts shares the same validator
// (src/lib/lead.ts) for deployments that prefer the functions/ convention.
export default defineConfig({
  site: 'https://surreyeliteperformance.co.uk',
  output: 'static',
  ...(needsAdapter ? { adapter: cloudflare({ imageService: 'compile' }) } : {}),
  // The site holds no per-visitor state, so skip the adapter's KV-backed session
  // store — it would otherwise demand a KV namespace binding at deploy time.
  session: false,
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    resolve: { dedupe: ['react', 'react-dom'] },
  },
});
