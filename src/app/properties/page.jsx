import { createClient } from '../../lib/supabase-server'
import PropertiesClient from './PropertiesClient'

export const dynamic = 'force-dynamic'

export default async function PropertiesPage() {
  const supabase = await createClient()

  const [propertiesRes, authRes] = await Promise.all([
    supabase
      .from('seller_properties')
      .select('id, property_id, state, district, mandal, village, land_used_type, land_soil_type, road_access, area_acres, expected_price, photo_urls, views, created_at, seller_id')
      .eq('status', 'approved')
      .order('created_at', { ascending: false }),
    supabase.auth.getUser(),
  ])

  const properties = propertiesRes.data || []
  const user = authRes.data?.user ?? null

  let wishlistIds = []
  if (user) {
    const { data: wl } = await supabase
      .from('buyer_wishlist')
      .select('property_id')
      .eq('buyer_id', user.id)
    wishlistIds = (wl || []).map(w => w.property_id)
  }

  const clientUser = user ? { id: user.id } : null

  return (
    <PropertiesClient
      properties={properties}
      user={clientUser}
      wishlistIds={wishlistIds}
    />
  )
}
