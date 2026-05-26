import { redirect } from 'next/navigation'
import ClientApp from '../components/ClientApp'
import { createClient } from '../lib/supabase-server'
import { homePathForRole } from '../lib/authRedirects'

/** Homepage uses auth to send signed-in users to their hub (/dashboard, /seller, /admin). */
export const dynamic = 'force-dynamic'

export default async function Page(props) {
  const searchParams = await props.searchParams
  const stayOnMarketing = searchParams?.stay === '1' || searchParams?.browse === '1'
  if (stayOnMarketing) return <ClientApp />

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect(homePathForRole(user.user_metadata?.role))

  return <ClientApp />
}
