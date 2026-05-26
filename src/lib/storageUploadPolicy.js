export const STORAGE_ALLOWED_BUCKETS = new Set(['property-docs', 'property-photos'])
/** Per-file ceiling for seller/admin uploads (`FileUpload.jsx` mirrors this). */
export const STORAGE_MAX_BYTES = 10 * 1024 * 1024

/** Guidance only — not enforced server-side */
export const PROPERTY_PHOTO_GUIDANCE =
  'JPG, PNG or WebP. Max 10 MB each, up to 5 images per listing. Recommended: clear landscape shots about 1600–2400 px wide for best results on desktop and phones.'

/** Prevent path traversal; match seller (docs|photos)/timestamp and admin uploads */
export function isValidStoragePrefix(bucket, prefix) {
  if (!prefix || prefix.includes('..') || prefix.startsWith('/') || /\\/.test(prefix)) return false
  if (bucket === 'property-docs') {
    return prefix === 'admin' || /^docs\/[0-9]+$/.test(prefix)
  }
  if (bucket === 'property-photos') {
    return prefix === 'admin' || prefix === 'testimonials' || /^photos\/[0-9]+$/.test(prefix)
  }
  return false
}
