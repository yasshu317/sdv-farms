import { createClient } from '../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { count } = await supabase
      .from('seller_properties')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
    return Response.json(
      { count: count ?? 0 },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } },
    )
  } catch {
    return Response.json({ count: 0 })
  }
}
