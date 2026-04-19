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
    accent: 'from-paddy-800/40 to-paddy-900/40',
    tagColor: 'bg-paddy-500/20 text-paddy-300 border-paddy-500/20',
  },
  {
    icon: '⚡',
    titleKey: 'electricityTitle',
    descKey: 'electricityDesc',
    tag: 'On-demand',
    accent: 'from-turmeric-900/30 to-paddy-900/40',
    tagColor: 'bg-turmeric-500/20 text-turmeric-300 border-turmeric-500/20',
  },
  {
    icon: '💧',
    titleKey: 'dripTitle',
    descKey: 'dripDesc',
    tag: 'Subsidy available',
    accent: 'from-blue-900/30 to-paddy-900/40',
    tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/20',
  },
  {
    icon: '🌱',
    titleKey: 'farmingPlanTitle',
    descKey: 'farmingPlanDesc',
    tag: 'Customised',
    accent: 'from-green-900/30 to-paddy-900/40',
    tagColor: 'bg-green-500/20 text-green-300 border-green-500/20',
  },
  {
    icon: '🌳',
    titleKey: 'plantsTitle',
    descKey: 'plantsDesc',
    tag: '1-yr replacement',
    accent: 'from-emerald-900/30 to-paddy-900/40',
    tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/20',
  },
]

const PHASE3_ITEMS = [
  { icon: '🛡️', key: 'securityTitle',  desc: 'Physical security & farm monitoring' },
  { icon: '🏠', key: 'farmhouseTitle', desc: 'Design & build your dream farmhouse' },
  { icon: '🌾', key: 'cropTitle',       desc: 'End-to-end crop maintenance plans' },
  { icon: '📈', key: 'marketingTitle',  desc: 'Market your produce at best prices' },
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

        {/* Pricing note */}
        <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-turmeric-500/8 border border-turmeric-400/15">
          <span className="text-turmeric-400 text-lg">💰</span>
          <p className="text-white/65 text-sm">
            All services are <strong className="text-white/85">priced on enquiry</strong> — no hidden charges. Call{' '}
            <a href="tel:7780312525" className="text-turmeric-400 hover:text-turmeric-300 font-semibold">7780312525</a>{' '}
            for a customised quote.
          </p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {PHASE2_SERVICES.map((svc) => (
            <div
              key={svc.titleKey}
              className={`relative bg-gradient-to-br ${svc.accent} border border-white/10 hover:border-turmeric-400/30 rounded-2xl p-6 transition-all group flex flex-col`}
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-white/8 border border-white/10 flex items-center justify-center text-3xl mb-4 group-hover:scale-105 transition-transform">
                {svc.icon}
              </div>

              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className={`text-white font-semibold text-base leading-snug ${lang === 'te' ? 'telugu' : ''}`}>
                  {t[svc.titleKey]}
                </h3>
              </div>

              <p className={`text-white/55 text-sm leading-relaxed mb-4 flex-1 ${lang === 'te' ? 'telugu' : ''}`}>
                {t[svc.descKey]}
              </p>

              <div className="flex items-center justify-between gap-2 mt-auto">
                <span className={`text-xs border px-2.5 py-1 rounded-full font-medium ${svc.tagColor}`}>
                  {svc.tag}
                </span>
                <Link
                  href="/#contact"
                  className="text-xs bg-white/10 hover:bg-turmeric-500/20 hover:border-turmeric-400/30 border border-white/10 text-white/80 hover:text-white font-medium py-1.5 px-3 rounded-xl transition-all"
                >
                  Enquire →
                </Link>
              </div>
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
                <div key={item.key} className="relative bg-white/5 border border-white/8 hover:border-white/15 rounded-xl p-4 text-center transition-all group overflow-hidden">
                  {/* Coming soon ribbon */}
                  <div className="absolute -top-0.5 -right-0.5">
                    <span className="bg-white/15 text-white/50 text-[9px] font-semibold px-2 py-0.5 rounded-bl-lg rounded-tr-xl border-l border-b border-white/10">
                      Soon
                    </span>
                  </div>
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{item.icon}</div>
                  <p className={`text-white/70 text-xs font-medium mb-1 ${lang === 'te' ? 'telugu' : ''}`}>{t[item.key]}</p>
                  <p className="text-white/30 text-[10px] leading-snug hidden sm:block">{item.desc}</p>
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
