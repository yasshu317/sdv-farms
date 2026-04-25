'use client'
import { useState, useEffect } from 'react'
import { Link } from 'react-scroll'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { content } from '../data/content'
import { createClient } from '../lib/supabase'

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
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll() // run once on mount in case page loads mid-scroll
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { to: 'about', label: t.about },
    { to: 'why-invest', label: t.whyInvest },
    { to: 'benefits', label: t.benefits },
    { to: 'highlights', label: t.highlights },
    { to: 'gallery', label: t.gallery },
    { to: 'location', label: t.contact },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/96 backdrop-blur-md shadow-sm border-b border-turmeric-100'
          : 'bg-gradient-to-b from-black/50 to-transparent backdrop-blur-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand — always goes to home */}
          <NextLink
            href="/"
            aria-label="SDV Farms — Home"
            title="Home"
            className={`flex items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-opacity hover:opacity-90 ${
              scrolled ? 'text-paddy-900 focus-visible:ring-paddy-500 focus-visible:ring-offset-white' : 'text-white focus-visible:ring-white/70 focus-visible:ring-offset-transparent'
            }`}
          >
            <span className="text-lg mr-0.5" aria-hidden>🌾</span>
            <span className="font-display font-bold text-xl">SDV Farms</span>
          </NextLink>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-5">
            {links.map(l => (
              <Link
                key={l.to}
                to={l.to}
                smooth
                duration={500}
                offset={-64}
                className={`cursor-pointer text-sm font-medium transition-colors hover:text-turmeric-500 ${
                  scrolled ? 'text-gray-700' : 'text-white/85'
                } ${lang === 'te' ? 'telugu text-xs' : ''}`}
              >
                {l.label}
              </Link>
            ))}

            {/* Language toggle */}
            <button
              onClick={toggle}
              className={`text-xs font-semibold border rounded-full px-3 py-1.5 transition-all ${
                scrolled
                  ? 'border-paddy-600 text-paddy-700 hover:bg-paddy-600 hover:text-white'
                  : 'border-white/40 text-white/90 hover:bg-white/15'
              }`}
            >
              {lang === 'en' ? 'తెలుగు' : 'English'}
            </button>

            {/* Properties & Services links */}
            <NextLink
              href="/properties"
              className={`text-sm font-medium transition-colors hover:text-turmeric-500 ${scrolled ? 'text-gray-700' : 'text-white/85'} ${lang === 'te' ? 'telugu text-xs' : ''}`}
            >
              {t.properties}
            </NextLink>
            <NextLink
              href="/services"
              className={`text-sm font-medium transition-colors hover:text-turmeric-500 ${scrolled ? 'text-gray-700' : 'text-white/85'} ${lang === 'te' ? 'telugu text-xs' : ''}`}
            >
              {t.services}
            </NextLink>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenu(m => !m)}
                  className={`flex items-center gap-2 text-sm font-medium border rounded-full px-3 py-1.5 transition-all ${
                    scrolled ? 'border-paddy-300 text-paddy-800 hover:bg-paddy-50' : 'border-white/30 text-white hover:bg-white/10'
                  }`}
                >
                  <User size={14} />
                  <span className="max-w-[80px] truncate">{user.user_metadata?.full_name?.split(' ')[0] || 'Account'}</span>
                </button>
                {userMenu && (
                  <div className="absolute right-0 top-10 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 w-48 z-50">
                    <NextLink
                      href={
                        user.user_metadata?.role === 'admin' ? '/admin' :
                        user.user_metadata?.role === 'seller' ? '/seller' : '/dashboard'
                      }
                      onClick={() => setUserMenu(false)}
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors ${lang === 'te' ? 'telugu' : ''}`}
                    >
                      <LayoutDashboard size={14} />
                      {user.user_metadata?.role === 'admin' ? t.adminPanel :
                       user.user_metadata?.role === 'seller' ? t.myListings : t.myDashboard}
                    </NextLink>
                    <button
                      onClick={handleLogout}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors ${lang === 'te' ? 'telugu' : ''}`}
                    >
                      <LogOut size={14} /> {t.signOut}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <NextLink href="/auth/login" className={`text-sm font-semibold border rounded-full px-3 py-1.5 transition-all ${
                scrolled ? 'border-paddy-600 text-paddy-700 hover:bg-paddy-600 hover:text-white' : 'border-white/40 text-white/90 hover:bg-white/15'
              } ${lang === 'te' ? 'telugu' : ''}`}>
                {t.signIn}
              </NextLink>
            )}

            <Link
              to="contact"
              smooth
              duration={500}
              offset={-64}
              className="btn-gold py-2 px-5 text-sm"
            >
              {t.bookVisit}
            </Link>
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggle}
              className={`text-xs font-semibold border rounded-full px-2.5 py-1 ${
                scrolled ? 'border-paddy-600 text-paddy-700' : 'border-white/40 text-white'
              }`}
            >
              {lang === 'en' ? 'తె' : 'EN'}
            </button>
            <button onClick={() => setOpen(o => !o)}>
              {open ? (
                <X className={scrolled ? 'text-gray-700' : 'text-white'} size={24} />
              ) : (
                <Menu className={scrolled ? 'text-gray-700' : 'text-white'} size={24} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-white border-t border-turmeric-100 shadow-lg px-4 pb-5 pt-2">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              smooth
              duration={500}
              offset={-64}
              onClick={() => setOpen(false)}
              className={`block py-3 text-paddy-800 font-medium border-b border-gray-50 cursor-pointer hover:text-turmeric-600 transition-colors ${
                lang === 'te' ? 'telugu' : ''
              }`}
            >
              {l.label}
            </Link>
          ))}
          <NextLink
            href="/properties"
            onClick={() => setOpen(false)}
            className={`block py-3 text-paddy-800 font-medium border-b border-gray-50 hover:text-turmeric-600 transition-colors ${lang === 'te' ? 'telugu' : ''}`}
          >
            {t.properties}
          </NextLink>
          <NextLink
            href="/services"
            onClick={() => setOpen(false)}
            className={`block py-3 text-paddy-800 font-medium border-b border-gray-50 hover:text-turmeric-600 transition-colors ${lang === 'te' ? 'telugu' : ''}`}
          >
            {t.services}
          </NextLink>
          {user ? (
            <div className="mt-4 space-y-2">
              <NextLink
                href={
                  user.user_metadata?.role === 'admin' ? '/admin' :
                  user.user_metadata?.role === 'seller' ? '/seller' : '/dashboard'
                }
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 py-2.5 px-4 rounded-xl bg-paddy-50 text-paddy-800 font-medium text-sm ${lang === 'te' ? 'telugu' : ''}`}
              >
                <LayoutDashboard size={14} />
                {user.user_metadata?.role === 'admin' ? t.adminPanel :
                 user.user_metadata?.role === 'seller' ? t.myListings : t.myDashboard}
              </NextLink>
              <button onClick={handleLogout} className={`w-full flex items-center gap-2 py-2.5 px-4 rounded-xl bg-red-50 text-red-600 font-medium text-sm ${lang === 'te' ? 'telugu' : ''}`}>
                <LogOut size={14} /> {t.signOut}
              </button>
            </div>
          ) : (
            <NextLink
              href="/auth/login"
              onClick={() => setOpen(false)}
              className={`block mt-3 py-2.5 px-4 rounded-xl border border-paddy-300 text-paddy-700 text-sm font-medium text-center ${lang === 'te' ? 'telugu' : ''}`}
            >
              {t.signInRegister}
            </NextLink>
          )}
          <Link
            to="contact"
            smooth
            duration={500}
            offset={-64}
            onClick={() => setOpen(false)}
            className="btn-gold mt-3 text-sm text-center w-full block"
          >
            {t.bookVisit}
          </Link>
        </div>
      )}
    </nav>
  )
}
