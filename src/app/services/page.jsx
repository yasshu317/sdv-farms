import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase-server'
import { isAdminOrStaff } from '../../lib/roles'
import ServicesClient from './ServicesClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Services — SDV Farms' }

/** Buyers manage Phase 2 services from the dashboard; keep this page for anon, sellers sharing link, admins. */
export default async function ServicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const role = user.user_metadata?.role
    if (!isAdminOrStaff(role) && role !== 'seller') {
      redirect('/dashboard?services=1')
    }
  }
  return <ServicesClient />
}
