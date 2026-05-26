import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase-server'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'My Dashboard — SDV Farms' }

export default async function DashboardPage(props) {
  const searchParams = await props.searchParams
  const focusServicesSection = searchParams?.services === '1'

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
    { data: profile },
    { count: appointmentsCount },
    { data: sellerListings },
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
          views,
          land_soil_type,
          land_used_type,
          status
        )
      `)
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('seller_properties').select('id, status').eq('seller_id', user.id),
  ])

  const landShortlist = (wishlistRows ?? [])
    .map(row => ({
      wishlistRowId: row.id,
      created_at: row.created_at,
      property: row.seller_properties,
    }))
    .filter(row => row.property != null)

  const enquiryRows = enquiries ?? []
  const interestRows = interests ?? []
  const listingRows = sellerListings ?? []
  const listingIds = listingRows.map(l => l.id)

  let sellerShortlistSaves = 0
  let sellerVisitRequests = 0
  if (listingIds.length) {
    const [{ count: wlN }, { count: apN }] = await Promise.all([
      supabase.from('buyer_wishlist').select('id', { count: 'exact', head: true }).in('property_id', listingIds),
      supabase.from('appointments').select('id', { count: 'exact', head: true }).in('property_id', listingIds),
    ])
    sellerShortlistSaves = Number(wlN ?? 0)
    sellerVisitRequests = Number(apN ?? 0)
  }

  const propertiesPosted = listingRows.filter(r => r.status !== 'rejected').length
  const propertiesSoldAsSeller = listingRows.filter(r => r.status === 'sold').length
  const shortlistedCount = landShortlist.length

  const contactedLikeEnquiries = enquiryRows.filter(e =>
    ['contacted', 'visited', 'booked'].includes(e.status),
  ).length
  const contactedAppointmentCount =
    Number(appointmentsCount ?? 0) + contactedLikeEnquiries

  const propertiesBoughtApprox =
    interestRows.filter(pi => pi.status === 'booked').length +
    enquiryRows.filter(e => e.status === 'booked').length

  const shortlistedCombined = shortlistedCount + interestRows.length

  const dashboardStats = {
    propertiesPosted,
    shortlisted: shortlistedCombined,
    contactedAppointments: contactedAppointmentCount,
    soldAsSeller: propertiesSoldAsSeller,
    boughtApprox: propertiesBoughtApprox,
  }

  const sellerEngagement =
    listingIds.length > 0
      ? { visitRequests: sellerVisitRequests, shortlistSaves: sellerShortlistSaves }
      : { visitRequests: 0, shortlistSaves: 0 }

  return (
    <DashboardClient
      user={{ id: user.id, email: user.email, ...user.user_metadata }}
      profile={profile}
      enquiries={enquiryRows}
      interests={interestRows}
      landRequests={landRequests ?? []}
      landShortlist={landShortlist}
      dashboardStats={dashboardStats}
      sellerEngagement={sellerEngagement}
      focusServicesSection={focusServicesSection}
    />
  )
}
