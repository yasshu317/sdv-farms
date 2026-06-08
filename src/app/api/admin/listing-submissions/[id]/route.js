import { NextResponse } from 'next/server'
import { createClient } from '../../../../../lib/supabase-server'
import { isAdminOrStaff } from '../../../../../lib/roles'

export async function PATCH(req, { params }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdminOrStaff(user.user_metadata?.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const allowed = ['status', 'admin_notes', 'converted_listing_id']
  const patch = {}
  for (const k of allowed) {
    if (Object.prototype.hasOwnProperty.call(body, k)) {
      patch[k] = body[k] ?? null
    }
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('listing_submissions')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[admin/listing-submissions] patch error:', error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  return NextResponse.json(data)
}
