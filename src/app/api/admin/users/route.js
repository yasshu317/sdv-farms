import { createClient }      from '../../../../lib/supabase-server'
import { createAdminClient } from '../../../../lib/supabase-admin'

export const dynamic = 'force-dynamic'

// Guard: only admins can call these endpoints
async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    return null
  }
  return user
}

// GET /api/admin/users — list all users with role + last sign-in
export async function GET() {
  const caller = await requireAdmin()
  if (!caller) return Response.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const admin = createAdminClient()
    const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 })
    if (error) throw error

    const users = data.users.map(u => ({
      id:           u.id,
      email:        u.email,
      full_name:    u.user_metadata?.full_name  ?? '—',
      phone:        u.user_metadata?.phone      ?? '—',
      role:         u.user_metadata?.role       ?? 'buyer',
      seller_type:  u.user_metadata?.seller_type ?? null,
      confirmed:    !!u.email_confirmed_at,
      last_sign_in: u.last_sign_in_at,
      created_at:   u.created_at,
    }))

    return Response.json({ users })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

// PATCH /api/admin/users — update a user's role
export async function PATCH(req) {
  const caller = await requireAdmin()
  if (!caller) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { userId, role } = await req.json()
  const ALLOWED_ROLES = ['buyer', 'seller', 'admin']
  if (!userId || !ALLOWED_ROLES.includes(role)) {
    return Response.json({ error: 'Invalid userId or role' }, { status: 400 })
  }

  try {
    const admin = createAdminClient()
    const { error } = await admin.auth.admin.updateUserById(userId, {
      user_metadata: { role },
    })
    if (error) throw error
    return Response.json({ ok: true })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
