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
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { to: 'about', label: t.about },
    { to: 'why-invest', label: t.whyInvest },
    { to: 'benefits', label: t.benefits },
    { to: 'highlights', label: t.highlights },
    { to: 'gallery', label: t.gallery },
    { to: 'contact', label: t.contact },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <span className={`font-bold text-xl ${scrolled ? 'text-forest-800' : 'text-white'}`}>
            SDV Farms
          </span>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map(l => (
              <Link
                key={l.to}
                to={l.to}
                smooth
                duration={500}
                offset={-64}
                className={`cursor-pointer text-sm font-medium hover:text-gold-500 transition-colors ${
                  scrolled ? 'text-gray-700' : 'text-white/90'
                } ${lang === 'te' ? 'telugu' : ''}`}
              >
                {l.label}
              </Link>
            ))}

            <button
              onClick={toggle}
              className={`text-sm font-semibold border rounded-full px-3 py-1 transition-colors ${
                scrolled
                  ? 'border-forest-600 text-forest-600 hover:bg-forest-600 hover:text-white'
                  : 'border-white text-white hover:bg-white hover:text-forest-700'
              }`}
            >
              {lang === 'en' ? 'తెలుగు' : 'English'}
            </button>

            <Link
              to="contact"
              smooth
              duration={500}
              offset={-64}
              className="btn-gold text-sm py-2 px-5"
            >
              {t.bookVisit}
            </Link>
          </div>

          {/* Mobile: lang toggle + hamburger */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={toggle}
              className={`text-xs font-semibold border rounded-full px-2.5 py-1 ${
                scrolled ? 'border-forest-600 text-forest-600' : 'border-white text-white'
              }`}
            >
              {lang === 'en' ? 'తెలుగు' : 'EN'}
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

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white shadow-lg border-t border-gray-100 px-4 pb-4 pt-2">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              smooth
              duration={500}
              offset={-64}
              onClick={() => setOpen(false)}
              className={`block py-2.5 text-gray-700 font-medium border-b border-gray-100 cursor-pointer hover:text-forest-700 ${
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
            className="btn-gold mt-3 text-sm text-center w-full block"
          >
            {t.bookVisit}
          </Link>
        </div>
      )}
    </nav>
  )
}
