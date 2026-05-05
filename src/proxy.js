import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { isAdminOrStaff } from './lib/roles'
import { homePathForRole } from './lib/authRedirects'

export async function proxy(request) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll()          { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Protect /dashboard — must be logged in
  if (pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Protect /admin — must be logged in with admin or staff role
  if (pathname.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/auth/login', request.url))
    if (!isAdminOrStaff(user.user_metadata?.role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Protect /seller — must be logged in with seller or admin role (staff uses /admin only)
  if (pathname.startsWith('/seller')) {
    if (!user) return NextResponse.redirect(new URL('/auth/login', request.url))
    const role = user.user_metadata?.role
    if (role === 'staff') return NextResponse.redirect(new URL('/admin', request.url))
    if (role !== 'seller' && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Redirect logged-in users away from auth pages
  if (user && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register'))) {
    const role = user.user_metadata?.role
    const dest = homePathForRole(role)
    return NextResponse.redirect(new URL(dest, request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/seller/:path*', '/auth/login', '/auth/register'],
}
