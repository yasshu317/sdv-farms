'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useLang } from '../../context/LanguageContext'
import { content } from '../../data/content'

const PHASE2_SERVICES = [
  {
    icon: '🔒',
    titleKey: 'fencingTitle',
    descKey: 'fencingDesc',
    tag: 'One-time',
  },
  {
    icon: '⚡',
    titleKey: 'electricityTitle',
    descKey: 'electricityDesc',
    tag: 'On-demand',
  },
  {
    icon: '💧',
    titleKey: 'dripTitle',
    descKey: 'dripDesc',
    tag: 'Subsidy available',
  },
  {
    icon: '🌱',
    titleKey: 'farmingPlanTitle',
    descKey: 'farmingPlanDesc',
    tag: 'Customised',
  },
  {
    icon: '🌳',
    titleKey: 'plantsTitle',
    descKey: 'plantsDesc',
    tag: '1-year replacement',
  },
]

const PHASE3_ITEMS = [
  { icon: '🛡️', key: 'securityTitle' },
  { icon: '🏠', key: 'farmhouseTitle' },
  { icon: '🌾', key: 'cropTitle' },
  { icon: '📈', key: 'marketingTitle' },
]

export default function ServicesPage() {
  const { lang } = useLang()
  const t = content[lang].services
  const [notifyEmail, setNotifyEmail] = useState('')
  const [notifyDone, setNotifyDone]   = useState(false)

  function handleNotify(e) {
    e.preventDefault()
    setNotifyDone(true)
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #071709 0%, #0e2c13 50%, #071709 100%)' }}>

      {/* Hero */}
      <div className="border-b border-white/8 px-4 sm:px-6 py-12 text-center">
        <Link href="/" className="text-white/50 hover:text-white/70 text-sm transition-colors">← SDV Farms</Link>
        <h1 className="text-white font-display text-3xl sm:text-4xl font-bold mt-4 mb-3">{t.heading}</h1>
        <p className={`text-white/60 max-w-xl mx-auto ${lang === 'te' ? 'telugu' : ''}`}>{t.subheading}</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">

        {/* Phase II badge */}
        <div className="flex items-center gap-3 mb-8">
          <span className="bg-turmeric-500/20 border border-turmeric-400/30 text-turmeric-300 text-xs font-semibold px-3 py-1 rounded-full">
            Phase II — One-Time Services
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {PHASE2_SERVICES.map((svc) => (
            <div key={svc.titleKey} className="bg-white/5 border border-white/10 hover:border-turmeric-400/20 rounded-2xl p-6 transition-all group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{svc.icon}</div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className={`text-white font-semibold text-base ${lang === 'te' ? 'telugu' : ''}`}>
                  {t[svc.titleKey]}
                </h3>
                <span className="shrink-0 text-xs text-paddy-400/70 bg-paddy-500/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {svc.tag}
                </span>
              </div>
              <p className={`text-white/55 text-sm leading-relaxed mb-5 ${lang === 'te' ? 'telugu' : ''}`}>
                {t[svc.descKey]}
              </p>
              <Link
                href="/#contact"
                className="block text-center bg-white/10 hover:bg-turmeric-500/20 hover:border-turmeric-400/40 border border-white/10 text-white text-sm font-medium py-2.5 rounded-xl transition-all"
              >
                Book Enquiry →
              </Link>
            </div>
          ))}
        </div>

        {/* Phase III teaser */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-paddy-900/60 to-paddy-800/30 p-8 sm:p-10">
          {/* Background pattern */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(212,160,23,0.6) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
          />

          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-white/10 border border-white/15 text-white/60 text-xs font-semibold px-3 py-1 rounded-full">
                Phase III — Coming Soon
              </span>
            </div>
            <h2 className={`text-white font-display text-2xl sm:text-3xl font-bold mb-3 ${lang === 'te' ? 'telugu' : ''}`}>
              {t.phase3Heading}
            </h2>
            <p className={`text-white/55 mb-6 max-w-lg ${lang === 'te' ? 'telugu' : ''}`}>{t.phase3Sub}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {PHASE3_ITEMS.map(item => (
                <div key={item.key} className="bg-white/5 border border-white/8 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1.5">{item.icon}</div>
                  <p className={`text-white/60 text-xs ${lang === 'te' ? 'telugu' : ''}`}>{t[item.key]}</p>
                </div>
              ))}
            </div>

            {/* Notify form */}
            {notifyDone ? (
              <p className="text-paddy-400 text-sm">✓ We'll notify you when Phase III launches!</p>
            ) : (
              <form onSubmit={handleNotify} className="flex gap-3 max-w-sm">
                <input
                  type="email" required value={notifyEmail}
                  onChange={e => setNotifyEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/35 focus:outline-none focus:border-turmeric-400 transition-colors text-sm"
                />
                <button
                  type="submit"
                  className="bg-turmeric-500 hover:bg-turmeric-600 text-white font-medium px-4 py-2.5 rounded-xl transition-colors text-sm whitespace-nowrap"
                >
                  Notify me
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
