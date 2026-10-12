/**
 * Unsplash URL builder. IDs live in src/data/images.ts; this module only shapes
 * the delivery URL so format/quality/sizing is decided in exactly one place.
 */
const BASE = 'https://images.unsplash.com';

export interface ImageOpts {
  w: number;
  /** Aspect ratio as width/height, e.g. 4/5. Omit to keep the source ratio. */
  ratio?: number;
  q?: number;
}

export function unsplash(id: string, { w, ratio, q = 74 }: ImageOpts): string {
  const params = new URLSearchParams({
    auto: 'format',        // serves WebP/AVIF to browsers that accept it
    fit: 'crop',
    w: String(w),
    q: String(q),
  });
  if (ratio) params.set('h', String(Math.round(w / ratio)));
  return `${BASE}/${id}?${params.toString()}`;
}

/** Responsive srcset across the widths that actually matter for this layout. */
export function unsplashSrcSet(
  id: string,
  widths: number[],
  ratio?: number,
): string {
  return widths
    .map((w) => `${unsplash(id, ratio ? { w, ratio } : { w })} ${w}w`)
    .join(', ');
}
