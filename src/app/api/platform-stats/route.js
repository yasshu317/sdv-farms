import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

function adminOrNull() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function GET() {
  try {
    const supabase = await createClient()
    const admin = adminOrNull()

    const [{ count: listed }, { count: members }] = await Promise.all([
      supabase
        .from('seller_properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
    ])

    let propertyEnquiries = 0
    let propertiesSold = 0
    if (admin) {
      const [e, s] = await Promise.all([
        admin.from('enquiries').select('*', { count: 'exact', head: true }),
        admin
          .from('seller_properties')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'sold'),
      ])
      propertyEnquiries = e.count ?? 0
      propertiesSold = s.count ?? 0
    }

    return Response.json({
      propertyEnquiries,
      subscribedMembers: members ?? 0,
      propertiesListed: listed ?? 0,
      propertiesSold,
    })
  } catch {
    return Response.json({
      propertyEnquiries: 0,
      subscribedMembers: 0,
      propertiesListed: 0,
      propertiesSold: 0,
    })
  }
}
