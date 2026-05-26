import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase-server'
import SellerClient from './SellerClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Seller dashboard — SDV Farms' }

export default async function SellerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const role = user.user_metadata?.role
  if (role === 'staff') redirect('/admin?redirected=1')
  if (role !== 'seller' && role !== 'admin') redirect('/dashboard?redirected=1')

  const [{ data: properties }, { data: appointments }] = await Promise.all([
    supabase
      .from('seller_properties')
      .select('*')
      .eq('seller_id', user.id)
      .in('status', ['pending', 'approved'])
      .order('created_at', { ascending: false }),
    supabase
      .from('appointments')
      .select('*')
      .eq('user_id', user.id)
      .order('appointment_date', { ascending: true }),
  ])

  const propsList = properties || []
  const listingIds = propsList.map(p => p.id)

  const wishlistCountById = {}
  const visitRequestCountById = {}

  if (listingIds.length > 0) {
    const [{ data: wlRows }, { data: visitRows }] = await Promise.all([
      supabase.from('buyer_wishlist').select('property_id').in('property_id', listingIds),
      supabase.from('appointments').select('property_id').in('property_id', listingIds),
    ])

    for (const row of wlRows || []) {
      wishlistCountById[row.property_id] = (wishlistCountById[row.property_id] || 0) + 1
    }
    for (const row of visitRows || []) {
      if (!row.property_id) continue
      visitRequestCountById[row.property_id] = (visitRequestCountById[row.property_id] || 0) + 1
    }
  }

  return (
    <SellerClient
      user={{ id: user.id, email: user.email, ...user.user_metadata }}
      properties={propsList}
      appointments={appointments || []}
      wishlistCountById={wishlistCountById}
      visitRequestCountById={visitRequestCountById}
    />
  )
}
