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

    const userIds = data.users.map(u => u.id)
    const { data: profRows } = await admin.from('profiles').select('id, occupation').in('id', userIds)
    const occById = Object.fromEntries((profRows ?? []).map(p => [p.id, p.occupation ?? null]))

    const users = data.users.map(u => ({
      id:           u.id,
      email:        u.email,
      full_name:    u.user_metadata?.full_name  ?? '—',
      phone:        u.user_metadata?.phone      ?? '—',
      role:         u.user_metadata?.role       ?? 'buyer',
      seller_type:  u.user_metadata?.seller_type ?? null,
      occupation:   occById[u.id] ?? null,
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
  const ALLOWED_ROLES = ['buyer', 'seller', 'admin', 'staff']
  if (!userId || !ALLOWED_ROLES.includes(role)) {
    return Response.json({ error: 'Invalid userId or role' }, { status: 400 })
  }

  try {
    const admin = createAdminClient()
    const { data: got, error: getErr } = await admin.auth.admin.getUserById(userId)
    if (getErr) throw getErr
    const u = got?.user
    if (!u) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const prevMeta = u.user_metadata && typeof u.user_metadata === 'object'
      ? u.user_metadata
      : {}

    const { error } = await admin.auth.admin.updateUserById(userId, {
      user_metadata: { ...prevMeta, role },
    })
    if (error) throw error
    return Response.json({ ok: true })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
