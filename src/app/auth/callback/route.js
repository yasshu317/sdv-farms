import { NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase-server'
import { homePathForRole } from '../../../lib/authRedirects.js'

function safeInternalPath(p) {
  if (!p || typeof p !== 'string') return null
  if (!p.startsWith('/') || p.startsWith('//')) return null
  return p
}

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const nextParam = safeInternalPath(searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      if (nextParam) {
        return NextResponse.redirect(`${origin}${nextParam}`)
      }
      const { data: { user } } = await supabase.auth.getUser()
      const role = user?.user_metadata?.role
      const dest = homePathForRole(role)
      return NextResponse.redirect(`${origin}${dest}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`)
}
