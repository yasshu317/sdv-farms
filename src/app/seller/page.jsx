import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase-server'
import SellerClient from './SellerClient'

export const dynamic = 'force-dynamic'

export default async function SellerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const role = user.user_metadata?.role
  if (role !== 'seller' && role !== 'admin') redirect('/dashboard')

  const { data: properties } = await supabase
    .from('seller_properties')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', user.id)
    .order('appointment_date', { ascending: true })

  return (
    <SellerClient
      user={{ id: user.id, email: user.email, ...user.user_metadata }}
      properties={properties || []}
      appointments={appointments || []}
    />
  )
}
