import { createClient } from '../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, role, location, message, rating } = body

    if (!name?.trim())    return Response.json({ error: 'Name is required' }, { status: 400 })
    if (!message?.trim()) return Response.json({ error: 'Message is required' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Sign in to share your experience' }, { status: 401 })

    const { error } = await supabase.from('testimonials').insert({
      type:       'testimonial',
      name:       name.trim(),
      role:       role?.trim() || null,
      location:   location?.trim() || null,
      message:    message.trim(),
      rating:     rating ? Math.min(5, Math.max(1, Number(rating))) : null,
      status:     'pending',
      sort_order: 0,
    })

    if (error) throw error
    return Response.json({ success: true }, { status: 201 })
  } catch (err) {
    return Response.json({ error: err?.message ?? 'Submission failed' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('testimonials')
      .select('id, type, name, role, location, message, rating, avatar_url, win_icon, win_stat, sort_order')
      .eq('status', 'approved')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) throw error

    return Response.json(
      { testimonials: data ?? [] },
      { headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600' } },
    )
  } catch {
    return Response.json({ testimonials: [] })
  }
}
