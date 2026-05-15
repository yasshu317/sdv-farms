import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase-server'
import SellerClient from './SellerClient'

export const dynamic = 'force-dynamic'

export default async function SellerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const role = user.user_metadata?.role
  if (role === 'staff') redirect('/admin?redirected=1')
  if (role !== 'seller' && role !== 'admin') redirect('/dashboard?redirected=1')

  // Seller dashboard shows only Pending and Approved listings (the 2 statuses sellers act on)
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

  // Fetch wishlist (interest) counts for each of the seller's approved properties
  const approvedIds = (properties || []).filter(p => p.status === 'approved').map(p => p.id)
  let wishlistCountById = {}
  if (approvedIds.length > 0) {
    const { data: wlRows } = await supabase
      .from('buyer_wishlist')
      .select('property_id')
      .in('property_id', approvedIds)
    for (const row of wlRows || []) {
      wishlistCountById[row.property_id] = (wishlistCountById[row.property_id] || 0) + 1
    }
  }

  return (
    <SellerClient
      user={{ id: user.id, email: user.email, ...user.user_metadata }}
      properties={properties || []}
      appointments={appointments || []}
      wishlistCountById={wishlistCountById}
    />
  )
}
