import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Admin client — uses the service_role key which bypasses RLS.
 * Only ever call this from server-side API routes. NEVER expose to the browser.
 */
export function createAdminClient() {
  const url     = process.env.NEXT_PUBLIC_SUPABASE_URL
  const svcKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !svcKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
      'Add SUPABASE_SERVICE_ROLE_KEY to your .env.local and Vercel environment variables. ' +
      'Find it in: Supabase Dashboard → Project Settings → API → service_role key.'
    )
  }
  return createClient(url, svcKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
