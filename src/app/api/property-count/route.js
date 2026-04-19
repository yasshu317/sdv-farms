import { createClient } from '../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { count } = await supabase
      .from('seller_properties')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
    return Response.json({ count: count ?? 0 })
  } catch {
    return Response.json({ count: 0 })
  }
}
