import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase-server'
import { isAdminOrStaff } from '../../lib/roles'
import AdminClient from './AdminClient'
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin — SDV Farms' }

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdminOrStaff(user.user_metadata?.role)) redirect('/dashboard')

  const [
    { data: enquiries },
    { data: plots },
    { data: sellerProperties },
    { data: appointments },
    { data: buyerRequests },
    brnRes,
    ffRes,
    lsRes,
  ] = await Promise.all([
    supabase.from('enquiries').select('*').order('created_at', { ascending: false }),
    supabase.from('plots').select('*').order('plot_number'),
    supabase.from('seller_properties').select('*').order('created_at', { ascending: false }),
    supabase.from('appointments').select('*').order('appointment_date', { ascending: true }),
    supabase.from('buyer_requests').select('*').order('created_at', { ascending: false }),
    supabase.from('buyer_request_notes').select('*').order('created_at', { ascending: false }),
    supabase.from('feature_flags').select('*').order('sort_order', { ascending: true }).order('key', { ascending: true }),
    supabase.from('listing_submissions').select('*').order('created_at', { ascending: false }),
  ])

  const buyerRequestNotes = brnRes.error ? [] : (brnRes.data ?? [])
  const featureFlags = ffRes.error ? [] : (ffRes.data ?? [])
  const listingSubmissions = lsRes.error ? [] : (lsRes.data ?? [])

  const notesByRequestId = {}
  for (const n of buyerRequestNotes) {
    if (!notesByRequestId[n.buyer_request_id]) notesByRequestId[n.buyer_request_id] = []
    notesByRequestId[n.buyer_request_id].push(n)
  }

  return (
    <AdminClient
      viewerRole={user.user_metadata?.role ?? 'buyer'}
      enquiries={enquiries ?? []}
      plots={plots ?? []}
      sellerProperties={sellerProperties ?? []}
      appointments={appointments ?? []}
      buyerRequests={buyerRequests ?? []}
      buyerRequestNotesById={notesByRequestId}
      featureFlags={featureFlags}
      listingSubmissions={listingSubmissions}
    />
  )
}
