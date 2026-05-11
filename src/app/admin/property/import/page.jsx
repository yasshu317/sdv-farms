import { redirect } from 'next/navigation'
import { createClient } from '../../../../lib/supabase-server'
import { isAdminOnly } from '../../../../lib/roles'
import AdminPropertyBulkImport from '../../../../components/admin/AdminPropertyBulkImport'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Import properties — SDV Farms Admin',
}

export default async function AdminPropertyImportPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !isAdminOnly(user.user_metadata?.role)) {
    redirect('/admin')
  }

  return <AdminPropertyBulkImport />
}
