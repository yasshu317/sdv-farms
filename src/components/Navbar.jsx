'use client'
import { useState, useEffect } from 'react'
import { Link } from 'react-scroll'
import { Menu, X } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { content } from '../data/content'

export default function Navbar() {
  const { lang, toggle } = useLang()
  const t = content[lang].nav
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
        scrolled
          ? 'bg-white/96 backdrop-blur-md shadow-sm border-b border-turmeric-100'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="text-lg mr-0.5">🌾</span>
            <span
              className={`font-display font-bold text-xl transition-colors ${
                scrolled ? 'text-paddy-900' : 'text-white'
              }`}
            >
              SDV Farms
            </span>
          </div>

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
          <Link
            to="contact"
            smooth
            duration={500}
            offset={-64}
            onClick={() => setOpen(false)}
            className="btn-gold mt-4 text-sm text-center w-full block"
          >
            {t.bookVisit}
          </Link>
        </div>
      )}
    </nav>
  )
}
