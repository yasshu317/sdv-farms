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

  // Redirect wrong-role users to their actual home with an explanation banner
  const role = user.user_metadata?.role
  if (role === 'seller') redirect('/seller?redirected=1')
  if (role === 'admin')  redirect('/admin?redirected=1')

  // Fetch this user's enquiries, join property title for context
  const { data: enquiries } = await supabase
    .from('enquiries')
    .select('*, properties(id, title, location)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch this user's plot interests
  const { data: interests } = await supabase
    .from('plot_interests')
    .select('*, plots(plot_number, area_sqyds, price_per_sqyd, status)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: landRequests } = await supabase
    .from('buyer_requests')
    .select('*')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  const initialTab = searchParams?.tab === 'land-requests' ? 'land-requests' : 'overview'

  return (
    <DashboardClient
      user={{ id: user.id, email: user.email, ...user.user_metadata }}
      enquiries={enquiries ?? []}
      interests={interests ?? []}
      landRequests={landRequests ?? []}
      initialTab={initialTab}
    />
  )
}
