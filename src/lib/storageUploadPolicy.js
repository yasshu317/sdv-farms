export const STORAGE_ALLOWED_BUCKETS = new Set(['property-docs', 'property-photos'])
export const STORAGE_MAX_BYTES = 10 * 1024 * 1024

/** Prevent path traversal; match seller (docs|photos)/timestamp and admin uploads */
export function isValidStoragePrefix(bucket, prefix) {
  if (!prefix || prefix.includes('..') || prefix.startsWith('/') || /\\/.test(prefix)) return false
  if (bucket === 'property-docs') {
    return prefix === 'admin' || /^docs\/[0-9]+$/.test(prefix)
  }
  if (bucket === 'property-photos') {
    return prefix === 'admin' || /^photos\/[0-9]+$/.test(prefix)
  }
  return false
}
