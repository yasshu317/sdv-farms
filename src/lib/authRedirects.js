/** Default app home for a Supabase user_metadata.role (buyer if missing). */
export function homePathForRole(role) {
  if (role === 'admin') return '/admin'
  if (role === 'seller') return '/seller'
  return '/dashboard'
}
