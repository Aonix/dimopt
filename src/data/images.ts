/**
 * Unsplash photo IDs.
 *
 * Every id here was HTTP-verified (200 + image/jpeg) against images.unsplash.com
 * and visually checked, so the alt text describes what the photograph actually
 * shows. Re-verify at any time with `npm run verify:images`.
 *
 * Note: roughly a quarter of Unsplash ids are Unsplash+ (paid) and 404 on this
 * CDN host, so never add an id here without running the verifier.
 */

export interface Img {
  id: string;
  alt: string;
}

export const IMAGES = {
  hero: {
    id: 'photo-1605296867724-fa87a8ef53fd',
    alt: 'Lone athlete standing behind a loaded barbell in a darkened gym',
  },
  coach: {
    id: 'photo-1704223523303-a5ed14561b1f',
    alt: 'Dominic Hale, founder and head coach, photographed against a dark studio backdrop',
  },
  /**
   * Consumed in pairs by the transformation wall: [0,1] is the first case
   * study's before/after, [2,3] the second, and so on. Pairs are kept
   * gender-consistent with the case study they illustrate.
   */
  transformations: [
    { id: 'photo-1744551472900-d23f4997e1cd', alt: 'Client photographed at the start of his programme' },
    { id: 'photo-1600026453346-a44501602a02', alt: 'Client photographed at the end of his programme' },
    { id: 'photo-1689897229406-0f600543bb8d', alt: 'Client photographed at the start of her programme' },
    { id: 'photo-1708011108776-45ad9e625269', alt: 'Client photographed at the end of her programme' },
    { id: 'photo-1730732862439-93a30eca19b8', alt: 'Client photographed at the start of his programme' },
    { id: 'photo-1696005264519-4117082d2923', alt: 'Client photographed at the end of his programme' },
  ],
  texture: [
    { id: 'photo-1764065339829-b2bba9ca509c', alt: '' },
    { id: 'photo-1685633224688-6a77675eb119', alt: '' },
  ],
} as const satisfies {
  hero: Img;
  coach: Img;
  transformations: readonly Img[];
  texture: readonly Img[];
};
