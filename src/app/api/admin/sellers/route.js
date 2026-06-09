import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase-server'
import { createAdminClient } from '../../../../lib/supabase-admin'
import { isAdminOrStaff } from '../../../../lib/roles'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminOrStaff(user.user_metadata?.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (error) {
    console.error('[admin/sellers]', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }

  const sellers = (data.users ?? [])
    .filter(u => u.user_metadata?.role === 'seller')
    .map(u => ({
      id: u.id,
      email: u.email,
      full_name: u.user_metadata?.full_name ?? u.email,
      phone: u.user_metadata?.phone ?? null,
    }))
    .sort((a, b) => (a.full_name ?? '').localeCompare(b.full_name ?? ''))

  return NextResponse.json({ sellers })
}
