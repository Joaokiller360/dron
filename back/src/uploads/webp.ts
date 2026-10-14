import type { Metadata, Sharp } from 'sharp';

// Lossy WebP: around 25–35% lighter than an equivalent JPEG, keeps
// transparency (PNG) and animation (animated WebP)
const WEBP_OPTIONS = { quality: 82, effort: 5, smartSubsample: true };

/** Re-encodes a decoded image as WebP, baking the EXIF orientation in. */
export function toWebp(image: Sharp, meta: Metadata) {
  // rotate() only on stills: sharp can't auto-orient animations
  const oriented = (meta.pages ?? 1) > 1 ? image : image.rotate();
  return oriented.webp(WEBP_OPTIONS).toBuffer();
}

/** projects/2026/09/3f2a9c1e-foto.jpg → projects/2026/09/3f2a9c1e-foto.webp */
export function webpKey(key: string) {
  return key.replace(/\.[a-z0-9]+$/i, '') + '.webp';
}
