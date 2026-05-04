import { createClient } from '../../../lib/supabase-server'
import { featureFlagsToMap } from '../../../lib/featureFlags'

export const dynamic = 'force-dynamic'

/** Public read of all flags (for client / edge). Payload must not contain secrets. */
export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('feature_flags')
    .select('key, enabled, payload')
    .order('sort_order', { ascending: true })
    .order('key', { ascending: true })

  if (error) {
    return Response.json({ error: error.message, flags: {} }, { status: 500 })
  }

  const flags = featureFlagsToMap(data ?? [])
  return Response.json(
    { flags },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
      },
    },
  )
}
