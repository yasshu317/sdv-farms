/** Admin dashboard + elevated RLS (see phase8 migration). */
export function isAdminOrStaff(role) {
  return role === 'admin' || role === 'staff'
}

/** User management and destructive listing actions. */
export function isAdminOnly(role) {
  return role === 'admin'
}
