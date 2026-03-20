import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase-server'
import AdminClient from './AdminClient'

export const metadata = { title: 'Admin — SDV Farms' }

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'admin') redirect('/dashboard')

  const [{ data: enquiries }, { data: profiles }, { data: plots }] = await Promise.all([
    supabase.from('enquiries').select('*').order('created_at', { ascending: false }),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('plots').select('*').order('plot_number'),
  ])

  return (
    <AdminClient
      enquiries={enquiries ?? []}
      profiles={profiles ?? []}
      plots={plots ?? []}
    />
  )
}
