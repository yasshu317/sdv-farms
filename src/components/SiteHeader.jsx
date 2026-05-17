'use client'

import { useState, useEffect } from 'react'
import NextLink from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { content } from '../data/content'
import { createClient } from '../lib/supabase'
import { REGISTER_LIST_LAND } from '../lib/routes'
import { isAdminOrStaff } from '../lib/roles'
import BrandHeadingAccent from './BrandHeadingAccent'

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

  const hashLinkClass = `text-sm font-medium transition-colors text-white/70 hover:text-white ${lang === 'te' ? 'telugu text-xs' : ''}`

  /** Same sections as marketing Navbar — jump to home anchor from inner pages */
  const homeSectionLinks = [
    { href: '/#about',       label: t.about },
    { href: '/#why-invest',  label: t.whyInvest },
    { href: '/#benefits',    label: t.benefits },
    { href: '/#highlights',  label: t.highlights },
    { href: '/#gallery',     label: t.gallery },
    { href: '/#location',    label: t.contact },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-paddy-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-w-0">
        {/* Row 1 — brand + account + book (desktop) */}
        <div className="flex items-center justify-between gap-3 min-h-[3.25rem] py-2 md:min-h-[3.75rem] md:py-2.5">
          <NextLink
            href="/"
            className="flex shrink-0 items-center gap-1.5 text-white font-display font-bold text-base sm:text-lg hover:opacity-90 transition-opacity leading-none"
            title="SDV Farms — Home"
          >
            <span aria-hidden className="text-lg">🌾</span>
            <span className="inline-flex flex-col items-stretch min-w-0">
              <span className="whitespace-nowrap leading-none">SDV Farms</span>
              <BrandHeadingAccent variant="navbar" />
            </span>
          </NextLink>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <NextLink
              href="/#contact"
              className="hidden md:inline-flex items-center justify-center btn-gold text-xs font-semibold py-2 px-4 rounded-full whitespace-nowrap leading-none"
            >
              {t.bookVisit}
            </NextLink>
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
                <div className="absolute right-0 top-11 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 w-52 z-50">
                  {/* Role identity header */}
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-xs text-gray-400 mb-0.5">Signed in as</p>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm text-gray-800 truncate">
                        {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                      </span>
                        {user.user_metadata?.role && (
                          <span className={`text-xs font-medium rounded-full px-2 py-0.5 capitalize shrink-0 ${
                            user.user_metadata.role === 'admin'  ? 'bg-purple-100 text-purple-700' :
                            user.user_metadata.role === 'staff'   ? 'bg-amber-100 text-amber-800' :
                            user.user_metadata.role === 'seller' ? 'bg-turmeric-100 text-turmeric-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {user.user_metadata.role === 'admin' ? '⚙️ Admin' :
                             user.user_metadata.role === 'staff' ? '📋 Staff' :
                             user.user_metadata.role === 'seller' ? '🌾 Seller' : '🏡 Buyer'}
                          </span>
                        )}
                    </div>
                  </div>
                  <NextLink
                    href={
                      isAdminOrStaff(user.user_metadata?.role) ? '/admin' :
                        user.user_metadata?.role === 'seller' ? '/seller' : '/dashboard'
                    }
                    onClick={() => setUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <LayoutDashboard size={14} />
                    {isAdminOrStaff(user.user_metadata?.role) ? t.adminPanel :
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

        {/* Row 2 — Phase 1 + routes (left) · home sections (right) */}
        <nav
          className="hidden md:flex md:flex-wrap md:items-center md:justify-between md:gap-x-6 md:gap-y-2 border-t border-white/10 py-2.5 px-0.5 bg-black/15 min-w-0"
          aria-label="Main"
        >
          <div className="flex flex-wrap items-center gap-x-3 lg:gap-x-4 min-w-0">
            <span className="inline-flex items-center rounded-full border border-turmeric-400/35 bg-turmeric-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-turmeric-200 shrink-0 leading-none">
              {t.phase1}
            </span>
            <NextLink href="/properties" className={`whitespace-nowrap leading-none ${linkClass('properties')}`}>{t.properties}</NextLink>
            <NextLink href="/services" className={`whitespace-nowrap leading-none ${linkClass('services')}`}>{t.services}</NextLink>
            <NextLink href="/buyer-request" className={`whitespace-nowrap leading-none ${linkClass('buyer-request')}`}>{t.landRequest}</NextLink>
            {user ? (
              <NextLink
                href={
                  isAdminOrStaff(user.user_metadata?.role)  ? '/admin'     :
                  user.user_metadata?.role === 'seller' ? '/seller'    : '/dashboard'
                }
                className="whitespace-nowrap leading-none text-sm font-semibold bg-turmeric-500/20 border border-turmeric-400/30 text-turmeric-300 hover:bg-turmeric-500/30 px-3 py-1 rounded-full transition-colors"
              >
                {isAdminOrStaff(user.user_metadata?.role) ? (user.user_metadata?.role === 'staff' ? '📋 Ops' : '⚙️ Admin')         :
                 user.user_metadata?.role === 'seller' ? '🌾 My Listings'   : '🏡 My Dashboard'}
              </NextLink>
            ) : (
              <NextLink href={REGISTER_LIST_LAND} className="whitespace-nowrap leading-none text-sm font-medium text-white/75 hover:text-turmeric-300 transition-colors">
                {t.listLand}
              </NextLink>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-x-3 lg:gap-x-4 shrink-0">
            {homeSectionLinks.map(item => (
              <NextLink key={item.href} href={item.href} className={`whitespace-nowrap leading-none ${hashLinkClass}`}>
                {item.label}
              </NextLink>
            ))}
          </div>
        </nav>
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
          {user ? (
            <NextLink
              href={
                isAdminOrStaff(user.user_metadata?.role)  ? '/admin'  :
                user.user_metadata?.role === 'seller' ? '/seller' : '/dashboard'
              }
              onClick={() => setMobileOpen(false)}
              className="block py-2.5 px-1 text-sm font-semibold text-turmeric-300"
            >
              {isAdminOrStaff(user.user_metadata?.role) ? (user.user_metadata?.role === 'staff' ? '📋 Ops hub' : '⚙️ Admin')        :
               user.user_metadata?.role === 'seller' ? '🌾 My Listings'  : '🏡 My Dashboard'}
            </NextLink>
          ) : (
            <NextLink href={REGISTER_LIST_LAND} onClick={() => setMobileOpen(false)} className="block py-2.5 px-1 text-sm font-medium text-white/80 hover:text-turmeric-300">
              {t.listLand}
            </NextLink>
          )}

          <NextLink href="/feedback" onClick={() => setMobileOpen(false)} className="block py-2.5 px-1 text-sm font-medium text-turmeric-400/80 hover:text-turmeric-300">
            Give Feedback
          </NextLink>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35 pt-2 pb-0.5 px-1 border-t border-white/10 mt-2">Home page</p>
          {homeSectionLinks.map(item => (
            <NextLink
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`block py-2 px-1 text-sm text-white/70 hover:text-turmeric-300 ${lang === 'te' ? 'telugu' : ''}`}
            >
              {item.label}
            </NextLink>
          ))}
          <NextLink
            href="/#contact"
            onClick={() => setMobileOpen(false)}
            className="block mt-2 btn-gold text-sm text-center py-2.5 rounded-xl font-semibold"
          >
            {t.bookVisit}
          </NextLink>

          {user ? (
            <button type="button" onClick={() => { setMobileOpen(false); handleLogout() }} className="w-full text-left flex items-center gap-2 py-2.5 px-1 text-sm text-red-400 border-t border-white/10 mt-2 pt-3">
              <LogOut size={14} /> {t.signOut}
            </button>
          ) : (
            <NextLink href="/auth/login" onClick={() => setMobileOpen(false)} className="block py-2.5 px-1 text-sm font-semibold text-turmeric-300 border-t border-white/10 mt-2 pt-3">
              {t.signInRegister}
            </NextLink>
          )}
        </div>
      )}
    </header>
  )
}
