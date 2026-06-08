'use client'
import { useState, useEffect } from 'react'
import { Link } from 'react-scroll'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { content } from '../data/content'
import { createClient } from '../lib/supabase'
import { homePathForRole } from '../lib/authRedirects'
import { isAdminOrStaff } from '../lib/roles'
import { NAV_SCROLL_OFFSET } from '../lib/nav-scroll'
import BrandHeadingAccent from './BrandHeadingAccent'

const navLinkClass = (scrolled, telugu) =>
  `text-sm font-medium transition-colors hover:text-turmeric-500 ${
    scrolled ? 'text-paddy-900' : 'text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]'
  } ${telugu ? 'telugu text-xs' : ''}`

export default function Navbar() {
  const { lang, toggle } = useLang()
  const t = content[lang].nav
  const router = useRouter()
  const [open, setOpen]         = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser]         = useState(null)
  const [userMenu, setUserMenu] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setUserMenu(false)
    router.refresh()
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const telugu = lang === 'te'

  const scrollSectionLinks = [
    { to: 'about', label: t.about },
    { to: 'why-invest', label: t.whyInvest },
    { to: 'benefits', label: t.benefits },
    { to: 'highlights', label: t.highlights },
    { to: 'gallery', label: t.gallery },
    { to: 'location', label: t.contact },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'border-b border-paddy-200/90 shadow-[0_4px_20px_rgba(10,30,10,0.1)] !bg-white'
          : 'bg-gradient-to-b from-paddy-950/80 via-paddy-950/45 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[3.25rem] gap-2 sm:gap-3 min-w-0 py-2 md:py-2.5 md:min-h-0">
          <NextLink
            href={user ? homePathForRole(user.user_metadata?.role) : '/'}
            aria-label={user ? 'Go to my hub' : 'SDV Farms — Home'}
            title={user ? 'My hub' : 'Home'}
            className={`relative z-10 flex shrink-0 items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-opacity hover:opacity-90 ${
              scrolled
                ? 'text-paddy-900 focus-visible:ring-paddy-500 focus-visible:ring-offset-white'
                : 'text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.9)] focus-visible:ring-white/70'
            }`}
          >
            <span className="text-lg mr-0.5 leading-none" aria-hidden>🌾</span>
            <span className="inline-flex flex-col items-stretch gap-0 min-w-0">
              <span className="font-display font-bold text-lg sm:text-xl whitespace-nowrap leading-none">SDV Farms</span>
              <BrandHeadingAccent variant="navbar" />
            </span>
          </NextLink>

          <div className="hidden md:flex items-center gap-x-2 lg:gap-x-3 flex-1 min-w-0 justify-end flex-wrap gap-y-2">
            <NextLink
              href="/properties"
              className={`shrink-0 whitespace-nowrap leading-none text-sm font-medium transition-colors hover:text-turmeric-500 ${
                scrolled ? 'text-paddy-900' : 'text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]'
              } ${telugu ? 'telugu text-xs' : ''}`}
            >
              {t.properties}
            </NextLink>
            <NextLink
              href="/services"
              className={`shrink-0 whitespace-nowrap leading-none text-sm font-medium transition-colors hover:text-turmeric-500 ${
                scrolled ? 'text-paddy-900' : 'text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]'
              } ${telugu ? 'telugu text-xs' : ''}`}
            >
              {t.services}
            </NextLink>
            <NextLink
              href="/buyer-request"
              className={`shrink-0 whitespace-nowrap leading-none text-sm font-medium transition-colors hover:text-turmeric-500 ${
                scrolled ? 'text-paddy-900' : 'text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]'
              } ${telugu ? 'telugu text-xs' : ''}`}
            >
              {t.landRequest}
            </NextLink>
            <NextLink
              href="/list-your-land"
              className={`shrink-0 whitespace-nowrap leading-none text-sm font-medium transition-colors hover:text-turmeric-500 ${
                scrolled ? 'text-paddy-900' : 'text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]'
              } ${telugu ? 'telugu text-xs' : ''}`}
            >
              {t.listLand}
            </NextLink>

            <span
              className={`hidden lg:inline w-px h-4 shrink-0 mx-0.5 ${scrolled ? 'bg-paddy-200' : 'bg-white/35'}`}
              aria-hidden
            />

            {scrollSectionLinks.map(l => (
              <Link
                key={l.to}
                to={l.to}
                smooth
                duration={500}
                offset={NAV_SCROLL_OFFSET}
                className={`shrink-0 cursor-pointer whitespace-nowrap leading-none ${navLinkClass(scrolled, telugu)}`}
              >
                {l.label}
              </Link>
            ))}

            <button
              type="button"
              onClick={toggle}
              className={`text-xs font-semibold border-2 rounded-full px-2.5 py-1.5 lg:px-3 transition-all leading-none shrink-0 ${
                scrolled
                  ? 'border-paddy-600 bg-white text-paddy-800 shadow-sm hover:bg-paddy-700 hover:text-white hover:border-paddy-700'
                  : 'border-white/40 text-white/90 hover:bg-white/15'
              }`}
            >
              {lang === 'en' ? 'తెలుగు' : 'English'}
            </button>

            {user ? (
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setUserMenu(m => !m)}
                  className={`flex items-center gap-1.5 sm:gap-2 text-sm font-medium border rounded-full px-2.5 py-1.5 transition-all leading-none ${
                    scrolled ? 'border-paddy-400 bg-white text-paddy-900 shadow-sm hover:bg-paddy-50' : 'border-white/30 text-white hover:bg-white/10'
                  }`}
                >
                  <User size={14} className="shrink-0" />
                  <span className="max-w-[72px] lg:max-w-[80px] truncate">{user.user_metadata?.full_name?.split(' ')[0] || 'Account'}</span>
                </button>
                {userMenu && (
                  <div className="absolute right-0 top-10 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 w-52 z-50">
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
                      href={isAdminOrStaff(user.user_metadata?.role) ? '/admin' : user.user_metadata?.role === 'seller' ? '/seller' : '/dashboard'}
                      onClick={() => setUserMenu(false)}
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors ${telugu ? 'telugu' : ''}`}
                    >
                      <LayoutDashboard size={14} />
                      {isAdminOrStaff(user.user_metadata?.role) ? t.adminPanel :
                       user.user_metadata?.role === 'seller' ? t.myListings : t.myDashboard}
                    </NextLink>
                    {user.user_metadata?.role === 'seller' && (
                      <NextLink
                        href="/dashboard"
                        onClick={() => setUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LayoutDashboard size={14} />
                        🏡 Browse &amp; Buy
                      </NextLink>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors ${telugu ? 'telugu' : ''}`}
                    >
                      <LogOut size={14} /> {t.signOut}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <NextLink
                href="/auth/login"
                className={`shrink-0 text-sm font-semibold border-2 rounded-full px-2.5 py-1.5 lg:px-3 transition-all leading-none ${
                  scrolled ? 'border-paddy-600 bg-white text-paddy-800 shadow-sm hover:bg-paddy-600 hover:text-white' : 'border-white/40 text-white/90 hover:bg-white/15'
                } ${telugu ? 'telugu' : ''}`}
              >
                {t.signIn}
              </NextLink>
            )}

            <Link
              to="contact"
              smooth
              duration={500}
              offset={NAV_SCROLL_OFFSET}
              className="btn-gold py-1.5 px-3 lg:py-2 lg:px-4 text-xs lg:text-sm whitespace-nowrap leading-none shrink-0"
            >
              {t.talkToTeam}
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={toggle}
              className={`text-xs font-semibold border-2 rounded-full px-2.5 py-1.5 transition-all leading-none ${
                scrolled
                  ? 'border-paddy-600 bg-white text-paddy-800 shadow-sm hover:bg-paddy-700 hover:text-white hover:border-paddy-700'
                  : 'border-white/40 text-white/90 hover:bg-white/15'
              }`}
            >
              <span className="hidden sm:inline">{lang === 'en' ? 'తెలుగు' : 'English'}</span>
              <span className="sm:hidden">{lang === 'en' ? 'తె' : 'EN'}</span>
            </button>
            <button
              type="button"
              className="p-1 -mr-0.5 rounded-lg hover:bg-white/10"
              onClick={() => setOpen(o => !o)}
              aria-expanded={open}
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {open ? (
                <X className={scrolled ? 'text-paddy-900' : 'text-white'} size={24} />
              ) : (
                <Menu className={scrolled ? 'text-paddy-900' : 'text-white'} size={24} />
              )}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-turmeric-100 shadow-lg px-4 pb-5 pt-2">
          <NextLink
            href="/properties"
            onClick={() => setOpen(false)}
            className={`block py-3 text-paddy-800 font-medium border-b border-gray-50 hover:text-turmeric-600 transition-colors ${telugu ? 'telugu' : ''}`}
          >
            {t.properties}
          </NextLink>
          <NextLink
            href="/services"
            onClick={() => setOpen(false)}
            className={`block py-3 text-paddy-800 font-medium border-b border-gray-50 hover:text-turmeric-600 transition-colors ${telugu ? 'telugu' : ''}`}
          >
            {t.services}
          </NextLink>
          <NextLink
            href="/buyer-request"
            onClick={() => setOpen(false)}
            className={`block py-3 text-paddy-800 font-medium border-b border-gray-50 hover:text-turmeric-600 transition-colors ${telugu ? 'telugu' : ''}`}
          >
            {t.landRequest}
          </NextLink>
          <NextLink
            href="/list-your-land"
            onClick={() => setOpen(false)}
            className={`block py-3 text-paddy-800 font-medium border-b border-gray-50 hover:text-turmeric-600 transition-colors ${telugu ? 'telugu' : ''}`}
          >
            {t.listLand}
          </NextLink>
          <div className="my-2 border-t border-gray-100" role="separator" />
          <p className={`text-[10px] font-semibold uppercase tracking-widest text-paddy-400 pt-1 pb-0.5 px-1 ${telugu ? 'telugu' : ''}`}>
            {lang === 'en' ? 'On this page' : 'ఈ పేజీలో'}
          </p>
          {scrollSectionLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              smooth
              duration={500}
              offset={NAV_SCROLL_OFFSET}
              onClick={() => setOpen(false)}
              className={`block py-2.5 text-sm text-paddy-600 border-b border-gray-50 cursor-pointer hover:text-turmeric-600 transition-colors ${
                telugu ? 'telugu' : ''
              }`}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <div className="mt-4 space-y-2">
              <NextLink
                href={
                  isAdminOrStaff(user.user_metadata?.role) ? '/admin' :
                  user.user_metadata?.role === 'seller' ? '/seller' : '/dashboard'
                }
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 py-2.5 px-4 rounded-xl bg-paddy-50 text-paddy-800 font-medium text-sm ${telugu ? 'telugu' : ''}`}
              >
                <LayoutDashboard size={14} />
                {isAdminOrStaff(user.user_metadata?.role) ? t.adminPanel :
                 user.user_metadata?.role === 'seller' ? t.myListings : t.myDashboard}
              </NextLink>
              <button type="button" onClick={handleLogout} className={`w-full flex items-center gap-2 py-2.5 px-4 rounded-xl bg-red-50 text-red-600 font-medium text-sm ${telugu ? 'telugu' : ''}`}>
                <LogOut size={14} /> {t.signOut}
              </button>
            </div>
          ) : (
            <NextLink
              href="/auth/login"
              onClick={() => setOpen(false)}
              className={`block mt-3 py-2.5 px-4 rounded-xl border border-paddy-300 text-paddy-700 text-sm font-medium text-center ${telugu ? 'telugu' : ''}`}
            >
              {t.signInRegister}
            </NextLink>
          )}
          <Link
            to="contact"
            smooth
            duration={500}
            offset={NAV_SCROLL_OFFSET}
            onClick={() => setOpen(false)}
            className="btn-gold mt-3 text-sm text-center w-full block"
          >
            {t.talkToTeam}
          </Link>
        </div>
      )}
    </nav>
  )
}
