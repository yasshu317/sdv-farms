import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase-server'
import AdminClient from './AdminClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin — SDV Farms' }

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'admin') redirect('/dashboard')

  const [
    { data: enquiries },
    { data: profiles },
    { data: plots },
    { data: sellerProperties },
    { data: appointments },
    { data: buyerRequests },
  ] = await Promise.all([
    supabase.from('enquiries').select('*').order('created_at', { ascending: false }),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('plots').select('*').order('plot_number'),
    supabase.from('seller_properties').select('*').order('created_at', { ascending: false }),
    supabase.from('appointments').select('*').order('appointment_date', { ascending: true }),
    supabase.from('buyer_requests').select('*').order('created_at', { ascending: false }),
  ])

  return (
    <AdminClient
      enquiries={enquiries ?? []}
      profiles={profiles ?? []}
      plots={plots ?? []}
      sellerProperties={sellerProperties ?? []}
      appointments={appointments ?? []}
      buyerRequests={buyerRequests ?? []}
    />
  )
}
