import { redirect } from 'next/navigation'
import { createClient } from '../../../../lib/supabase-server'
import { isAdminOnly } from '../../../../lib/roles'
import AdminPropertyForm from '../../../../components/admin/AdminPropertyForm'

export const dynamic = 'force-dynamic'

export default async function AdminNewPropertyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminOnly(user.user_metadata?.role)) {
    redirect('/admin')
  }

  return <AdminPropertyForm mode="create" />
}
