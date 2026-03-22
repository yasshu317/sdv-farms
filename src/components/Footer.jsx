'use client'
import { Phone, Mail, MapPin } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { content } from '../data/content'

function PaddyDivider() {
  return (
    <div className="flex items-center justify-center gap-4 my-6">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-turmeric-600/40" />
      <div className="flex gap-2 text-turmeric-500 text-lg">
        <span>🌾</span>
        <span>✦</span>
        <span>🌾</span>
      </div>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-turmeric-600/40" />
    </div>
  )
}

export default function Footer() {
  const { lang } = useLang()
  const t = content[lang].footer

  return (
    <footer
      className="relative text-white overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #071709 0%, #0e2c13 50%, #071709 100%)' }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(212,160,23,0.4) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-14">
        {/* Brand */}
        <div className="text-center">
          <h3 className="font-display text-4xl font-bold text-turmeric-400 mb-1">SDV Farms</h3>
          <p className="text-paddy-400 text-sm tracking-[0.25em] uppercase font-medium">Phase 1</p>
        </div>

        <PaddyDivider />

        {/* Tagline */}
        <p className={`text-paddy-300/70 text-center text-base max-w-lg mx-auto italic leading-relaxed mb-8 font-display ${lang === 'te' ? 'telugu' : ''}`}>
          "{t.tagline}"
        </p>

        {/* Contact row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-10">
          <a href={`tel:${t.phone}`} className="flex items-center gap-2.5 text-paddy-300 hover:text-turmeric-400 transition-colors">
            <div className="w-8 h-8 bg-turmeric-500/15 rounded-full flex items-center justify-center">
              <Phone size={14} />
            </div>
            <span className="font-medium">{t.phone}</span>
          </a>
          <div className="hidden sm:block w-px h-5 bg-white/10" />
          <a href={`mailto:${t.email}`} className="flex items-center gap-2.5 text-paddy-300 hover:text-turmeric-400 transition-colors">
            <div className="w-8 h-8 bg-turmeric-500/15 rounded-full flex items-center justify-center">
              <Mail size={14} />
            </div>
            <span className="font-medium">{t.email}</span>
          </a>
          <div className="hidden sm:block w-px h-5 bg-white/10" />
          <div className="flex items-center gap-2.5 text-paddy-300">
            <div className="w-8 h-8 bg-turmeric-500/15 rounded-full flex items-center justify-center">
              <MapPin size={14} />
            </div>
            <span className="font-medium text-sm">Hyderabad, Telangana</span>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className={`text-paddy-600 text-xs ${lang === 'te' ? 'telugu' : ''}`}>{t.rights}</p>
          {process.env.NEXT_PUBLIC_APP_VERSION && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-paddy-600 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-paddy-500/60 inline-block" />
              v{process.env.NEXT_PUBLIC_APP_VERSION}
            </span>
          )}
        </div>
      </div>
    </footer>
  )
}
