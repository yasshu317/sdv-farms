/** Default app home for a Supabase user_metadata.role (buyer if missing). */
export function homePathForRole(role) {
  if (role === 'admin' || role === 'staff') return '/admin'
  if (role === 'seller') return '/seller'
  return '/dashboard'
}

/** Only allow relative in-app redirects (pathname + optional query/hash). No protocol-relative URLs. */
export function safeInternalNextPath(candidate) {
  if (!candidate || typeof candidate !== 'string') return null
  const trimmed = candidate.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return null
  const q = trimmed.indexOf('?')
  const hash = trimmed.indexOf('#')
  const endPath = Math.min(q >= 0 ? q : trimmed.length, hash >= 0 ? hash : trimmed.length)
  const pathOnly = trimmed.slice(0, endPath)
  if (pathOnly === '/auth/callback') return null
  return trimmed.slice(0, 2048)
}
