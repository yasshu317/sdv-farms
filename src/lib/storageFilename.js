/**
 * Build a Supabase Storage–safe object name from an original filename.
 * Unicode punctuation (e.g. en-dash U+2013), spaces, and path segments
 * can trigger "Invalid key" errors from the Storage API.
 */
export function sanitizeStorageFileName(originalName) {
  const raw = String(originalName ?? 'file').replace(/^.*[/\\]/, '').trim() || 'file'
  const lastDot = raw.lastIndexOf('.')
  const extRaw = lastDot > 0 ? raw.slice(lastDot + 1) : ''
  const stemRaw = lastDot > 0 ? raw.slice(0, lastDot) : raw

  const ext = extRaw
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase()
    .slice(0, 8)

  const stem = stemRaw
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^[-_.]+|[-_.]+$/g, '')
    .replace(/-+/g, '-')
    .slice(0, 128) || 'file'

  return ext ? `${stem}.${ext}` : stem
}
