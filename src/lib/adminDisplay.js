/** Display helpers for admin tables (seller properties, etc.) */

export function adminField(v) {
  if (v === null || v === undefined || v === '') return '—'
  return String(v)
}

export function storageLinkLabel(url, i) {
  try {
    const seg = decodeURIComponent(String(url).split('/').pop() || '')
    return seg.length > 52 ? `${seg.slice(0, 49)}…` : seg || `File ${i + 1}`
  } catch {
    return `File ${i + 1}`
  }
}
