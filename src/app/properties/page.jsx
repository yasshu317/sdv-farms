import { createClient } from '../../lib/supabase-server'
import PropertiesClient from './PropertiesClient'

export const dynamic = 'force-dynamic'

export default async function PropertiesPage() {
  const supabase = await createClient()

  const { data: properties } = await supabase
    .from('seller_properties')
    .select('id, property_id, state, district, mandal, village, land_used_type, land_soil_type, road_access, area_acres, expected_price, photo_urls, views, created_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  return <PropertiesClient properties={properties || []} />
}
