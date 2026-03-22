import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase-server'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'My Dashboard — SDV Farms' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Fetch this user's enquiries
  const { data: enquiries } = await supabase
    .from('enquiries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch this user's plot interests
  const { data: interests } = await supabase
    .from('plot_interests')
    .select('*, plots(plot_number, area_sqyds, price_per_sqyd, status)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <DashboardClient
      user={{ id: user.id, email: user.email, ...user.user_metadata }}
      enquiries={enquiries ?? []}
      interests={interests ?? []}
    />
  )
}
