/**
 * Verifies every Unsplash id in src/data/images.ts still resolves.
 * Run: npm run verify:images
 */
const src = await import('../src/data/images.ts').catch(async () => {
  // images.ts is plain TS with no imports, so a crude extract is enough here.
  const text = await (await import('node:fs/promises')).readFile(
    new URL('../src/data/images.ts', import.meta.url),
    'utf8',
  );
  const ids = [...text.matchAll(/id:\s*'(photo-[^']+)'/g)].map((m) => m[1]);
  return { IMAGES: null, ids };
});

const ids =
  src.ids ??
  [
    src.IMAGES.hero.id,
    src.IMAGES.coach.id,
    ...src.IMAGES.transformations.map((i) => i.id),
    ...src.IMAGES.texture.map((i) => i.id),
  ];

let failed = 0;
await Promise.all(
  ids.map(async (id) => {
    const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=70`;
    try {
      const res = await fetch(url, { method: 'GET', headers: { range: 'bytes=0-64' } });
      const type = res.headers.get('content-type') ?? '';
      const ok = res.status < 400 && type.startsWith('image/');
      if (!ok) failed++;
      console.log(`${ok ? 'ok  ' : 'FAIL'} ${res.status} ${type.padEnd(12)} ${id}`);
    } catch (err) {
      failed++;
      console.log(`FAIL  err  ${id} — ${err.message}`);
    }
  }),
);

console.log(`\n${ids.length - failed}/${ids.length} verified`);
process.exit(failed === 0 ? 0 : 1);
