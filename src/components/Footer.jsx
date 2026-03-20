import { Phone, Mail } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { content } from '../data/content'

export default function Footer() {
  const { lang } = useLang()
  const t = content[lang].footer

  return (
    <footer className="bg-forest-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        {/* Brand */}
        <h3 className="text-2xl font-extrabold text-gold-400 mb-1">SDV Farms</h3>
        <p className="text-forest-300 text-xs mb-6">Phase 1</p>

        {/* Tagline */}
        <p className={`text-forest-200 text-sm sm:text-base max-w-md mx-auto mb-8 italic leading-relaxed ${lang === 'te' ? 'telugu' : ''}`}>
          "{t.tagline}"
        </p>

        {/* Contact row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
          <a href={`tel:${t.phone}`} className="flex items-center gap-2 text-forest-300 hover:text-gold-400 transition-colors text-sm">
            <Phone size={16} />
            {t.phone}
          </a>
          <a href={`mailto:${t.email}`} className="flex items-center gap-2 text-forest-300 hover:text-gold-400 transition-colors text-sm">
            <Mail size={16} />
            {t.email}
          </a>
        </div>

        <div className="border-t border-white/10 pt-6">
          <p className={`text-forest-500 text-xs ${lang === 'te' ? 'telugu' : ''}`}>{t.rights}</p>
        </div>
      </div>
    </footer>
  )
}
