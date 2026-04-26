'use client'

import { useState, useEffect } from 'react'
import NextLink from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { content } from '../data/content'
import { createClient } from '../lib/supabase'

/**
 * Sticky top bar for inner pages: consistent paths to Properties, Services,
 * Land request, List your land, and account — matches home nav priorities.
 *
 * @param {{ active?: 'properties' | 'services' | 'buyer-request' | null }} props
 */
export default function SiteHeader({ active: activeProp = null }) {
  const pathname = usePathname()
  const { lang } = useLang()
  const t = content[lang].nav
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [userMenu, setUserMenu] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setUserMenu(false)
    router.refresh()
  }

  const active = activeProp ?? (pathname === '/properties' || pathname?.startsWith('/properties/')
    ? 'properties'
    : pathname === '/services' || pathname?.startsWith('/services/')
      ? 'services'
      : pathname === '/buyer-request' || pathname?.startsWith('/buyer-request/')
        ? 'buyer-request'
        : null)

  const linkClass = (key) =>
    `text-sm font-medium transition-colors ${
      active === key
        ? 'text-turmeric-400'
        : 'text-white/75 hover:text-white'
    } ${lang === 'te' && key !== 'properties' && key !== 'services' ? 'telugu text-xs' : ''}`

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-paddy-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-3 sm:gap-5 min-w-0">
          <NextLink
            href="/"
            className="flex shrink-0 items-center gap-1.5 text-white font-display font-bold text-base sm:text-lg hover:opacity-90 transition-opacity"
            title="SDV Farms — Home"
          >
            <span aria-hidden>🌾</span>
            <span className="whitespace-nowrap">SDV Farms</span>
          </NextLink>
          <nav className="hidden md:flex items-center gap-3 lg:gap-4" aria-label="Main">
            <NextLink href="/properties" className={linkClass('properties')}>{t.properties}</NextLink>
            <NextLink href="/services" className={linkClass('services')}>{t.services}</NextLink>
            <NextLink href="/buyer-request" className={linkClass('buyer-request')}>{t.landRequest}</NextLink>
            <NextLink href="/auth/register" className="text-sm font-medium text-white/75 hover:text-turmeric-300 transition-colors">
              {t.listLand}
            </NextLink>
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {user ? (
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setUserMenu(m => !m)}
                className="flex items-center gap-1.5 text-sm font-medium border border-white/20 rounded-full px-2.5 py-1.5 text-white/90 hover:bg-white/10 transition-colors"
              >
                <User size={14} className="opacity-80" />
                <span className="max-w-[88px] truncate">
                  {user.user_metadata?.full_name?.split(' ')[0] || 'Account'}
                </span>
              </button>
              {userMenu && (
                <div className="absolute right-0 top-11 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 w-48 z-50">
                  <NextLink
                    href={
                      user.user_metadata?.role === 'admin' ? '/admin' :
                        user.user_metadata?.role === 'seller' ? '/seller' : '/dashboard'
                    }
                    onClick={() => setUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <LayoutDashboard size={14} />
                    {user.user_metadata?.role === 'admin' ? t.adminPanel :
                      user.user_metadata?.role === 'seller' ? t.myListings : t.myDashboard}
                  </NextLink>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
                  >
                    <LogOut size={14} /> {t.signOut}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NextLink
              href="/auth/login"
              className="hidden sm:inline-block text-sm font-semibold border border-white/25 text-white/90 rounded-full px-3 py-1.5 hover:bg-white/10 transition-colors"
            >
              {t.signIn}
            </NextLink>
          )}

          <button
            type="button"
            className="md:hidden p-2 text-white/90 rounded-lg border border-white/15 hover:bg-white/10"
            onClick={() => setMobileOpen(o => !o)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-paddy-950/98 px-4 py-3 space-y-1">
          <NextLink href="/properties" onClick={() => setMobileOpen(false)} className={`block py-2.5 px-1 ${linkClass('properties')}`}>
            {t.properties}
          </NextLink>
          <NextLink href="/services" onClick={() => setMobileOpen(false)} className={`block py-2.5 px-1 ${linkClass('services')}`}>
            {t.services}
          </NextLink>
          <NextLink href="/buyer-request" onClick={() => setMobileOpen(false)} className={`block py-2.5 px-1 ${linkClass('buyer-request')}`}>
            {t.landRequest}
          </NextLink>
          <NextLink href="/auth/register" onClick={() => setMobileOpen(false)} className="block py-2.5 px-1 text-sm font-medium text-white/80 hover:text-turmeric-300">
            {t.listLand}
          </NextLink>
          {user ? (
            <>
              <NextLink
                href={
                  user.user_metadata?.role === 'admin' ? '/admin' :
                    user.user_metadata?.role === 'seller' ? '/seller' : '/dashboard'
                }
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 py-2.5 px-1 text-sm text-white/90"
              >
                <LayoutDashboard size={14} />
                {user.user_metadata?.role === 'admin' ? t.adminPanel :
                  user.user_metadata?.role === 'seller' ? t.myListings : t.myDashboard}
              </NextLink>
              <button type="button" onClick={() => { setMobileOpen(false); handleLogout() }} className="w-full text-left flex items-center gap-2 py-2.5 px-1 text-sm text-red-400">
                <LogOut size={14} /> {t.signOut}
              </button>
            </>
          ) : (
            <NextLink href="/auth/login" onClick={() => setMobileOpen(false)} className="block py-2.5 px-1 text-sm font-semibold text-turmeric-300">
              {t.signInRegister}
            </NextLink>
          )}
        </div>
      )}
    </header>
  )
}
