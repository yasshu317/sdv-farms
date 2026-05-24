import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase-server'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'My Dashboard — SDV Farms' }

export default async function DashboardPage(props) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const role = user.user_metadata?.role
  if (role === 'admin' || role === 'staff') redirect('/admin?redirected=1')

  const [
    { data: enquiries },
    { data: interests },
    { data: landRequests },
    { data: wishlistRows },
  ] = await Promise.all([
    supabase
      .from('enquiries')
      .select('*, properties(id, title, location)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('plot_interests')
      .select('*, plots(plot_number, area_sqyds, price_per_sqyd, status)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('buyer_requests')
      .select('*')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('buyer_wishlist')
      .select(`
        id,
        created_at,
        seller_properties (
          id,
          property_id,
          state,
          district,
          mandal,
          village,
          area_acres,
          expected_price,
          photo_urls,
          land_soil_type,
          land_used_type,
          status
        )
      `)
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  const landShortlist = (wishlistRows ?? [])
    .map(row => ({
      wishlistRowId: row.id,
      created_at: row.created_at,
      property: row.seller_properties,
    }))
    .filter(row => row.property != null)

  const qp = searchParams?.tab
  const initialTab =
    qp === 'land-requests' ? 'land-requests'
    : qp === 'land-shortlist' ? 'land-shortlist'
    : 'overview'

  return (
    <DashboardClient
      user={{ id: user.id, email: user.email, ...user.user_metadata }}
      enquiries={enquiries ?? []}
      interests={interests ?? []}
      landRequests={landRequests ?? []}
      landShortlist={landShortlist}
      initialTab={initialTab}
    />
  )
}
