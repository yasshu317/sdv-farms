import { createClient } from '../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

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
