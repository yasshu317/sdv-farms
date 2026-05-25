import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '../../../lib/supabase-server'
import { normalizeMarketingRpc, normalizeMarketingFallback } from '../../../lib/marketing-stats'

export const dynamic = 'force-dynamic'

function adminOrNull() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/**
 * Used when Postgres RPC `public_marketing_stats` is not deployed yet.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {import('@supabase/supabase-js').SupabaseClient | null} admin
 */
async function fallbackFetch(supabase, admin) {
  const [{ count: listed }, { count: members }] = await Promise.all([
    supabase
      .from('seller_properties')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  ])

  let propertyEnquiries = 0
  let propertiesSold = 0

  let propsClearDocs = 0
  let listingPartners = 0

  try {
    const [{ count: clearC }, sellersData] = await Promise.all([
      supabase
        .from('seller_properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .eq('doc_verified', true),
      supabase.from('seller_properties').select('seller_id').eq('status', 'approved'),
    ])
    propsClearDocs = clearC ?? 0
    if (sellersData?.data?.length) {
      listingPartners = new Set(sellersData.data.map(r => r.seller_id).filter(Boolean)).size
    }
  } catch {
    /* optional */
  }

  if (admin) {
    const [e, s] = await Promise.all([
      admin.from('enquiries').select('*', { count: 'exact', head: true }),
      admin.from('seller_properties').select('*', { count: 'exact', head: true }).eq('status', 'sold'),
    ])
    propertyEnquiries = e.count ?? 0
    propertiesSold = s.count ?? 0
  }

  return normalizeMarketingFallback({
    listings: listed ?? 0,
    membersCount: members ?? 0,
    soldFallback: propertiesSold,
    enquiriesFallback: propertyEnquiries,
    clearDocumentation: propsClearDocs,
    listingPartners,
    fallbackSource: admin ? 'fallback_admin' : 'fallback_anon',
  })
}

export async function GET() {
  try {
    const supabase = await createClient()
    const admin = adminOrNull()

    const { data: rpcRow, error: rpcErr } = await supabase.rpc('public_marketing_stats')

    if (!rpcErr && rpcRow && typeof rpcRow === 'object') {
      try {
        return Response.json(normalizeMarketingRpc(/** @type {Record<string, unknown>} */ (rpcRow)), {
          headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
        })
      } catch {
        /* continue to fallback */
      }
    }

    const body = await fallbackFetch(supabase, admin)

    return Response.json(body, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch {
    return Response.json(
      normalizeMarketingFallback({
        listings: 0,
        membersCount: 0,
        soldFallback: 0,
        enquiriesFallback: 0,
        clearDocumentation: 0,
        listingPartners: 0,
        fallbackSource: 'error',
      }),
    )
  }
}
