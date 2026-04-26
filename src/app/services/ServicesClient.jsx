'use client'
import { useState } from 'react'
import Link from 'next/link'
import SiteHeader from '../../components/SiteHeader'
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

const SERVICE_KEYS = ['fencing', 'borewell', 'drip', 'farming_plan', 'plants']

export default function ServicesPage() {
  const { lang } = useLang()
  const t = content[lang].services
  const [notifyEmail, setNotifyEmail]   = useState('')
  const [notifyDone, setNotifyDone]     = useState(false)
  const [bookingFor, setBookingFor]     = useState(null)  // service_type key or null
  const [bookForm, setBookForm]         = useState({ full_name: '', email: '', phone: '', property_location: '', area_acres: '', notes: '' })
  const [bookLoading, setBookLoading]   = useState(false)
  const [bookSuccess, setBookSuccess]   = useState(false)
  const [bookError, setBookError]       = useState('')

  function handleNotify(e) {
    e.preventDefault()
    setNotifyDone(true)
  }

  function openBooking(serviceKey) {
    setBookingFor(serviceKey)
    setBookForm({ full_name: '', email: '', phone: '', property_location: '', area_acres: '', notes: '' })
    setBookSuccess(false)
    setBookError('')
  }

  async function handleBookSubmit(e) {
    e.preventDefault()
    setBookLoading(true)
    setBookError('')
    try {
      const res = await fetch('/api/service-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...bookForm, service_type: bookingFor }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit')
      setBookSuccess(true)
    } catch (err) {
      setBookError(err.message)
    } finally {
      setBookLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #071709 0%, #0e2c13 50%, #071709 100%)' }}>
      <SiteHeader active="services" />

      {/* Hero */}
      <div className="border-b border-white/8 px-4 sm:px-6 py-12 text-center">
        <p className="text-white/40 text-xs mb-3">
          <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
          <span className="mx-1.5">·</span>
          <span className="text-white/55">Services</span>
        </p>
        <h1 className="text-white font-display text-3xl sm:text-4xl font-bold mt-0 mb-3">{t.heading}</h1>
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
                <button
                  onClick={() => openBooking(SERVICE_KEYS[PHASE2_SERVICES.indexOf(svc)])}
                  className="text-xs bg-white/10 hover:bg-turmeric-500/20 hover:border-turmeric-400/30 border border-white/10 text-white/80 hover:text-white font-medium py-1.5 px-3 rounded-xl transition-all"
                >
                  Enquire →
                </button>
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

      {/* ── Service Booking Modal ── */}
      {bookingFor && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-900 text-base">Book Service Enquiry</h3>
                <p className="text-xs text-gray-400 mt-0.5 capitalize">
                  {bookingFor.replace('_', ' ')} — we'll call you within 24 hours
                </p>
              </div>
              <button onClick={() => setBookingFor(null)} className="text-gray-400 hover:text-gray-600 text-xl font-light">✕</button>
            </div>

            <div className="px-6 py-5">
              {bookSuccess ? (
                <div className="text-center py-6">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-paddy-800 font-semibold mb-1">Enquiry submitted!</p>
                  <p className="text-gray-500 text-sm mb-4">We'll call you within 24 hours to discuss details and pricing.</p>
                  <button onClick={() => setBookingFor(null)}
                    className="bg-paddy-700 text-white text-sm font-medium px-6 py-2.5 rounded-xl hover:bg-paddy-800 transition-colors">
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookSubmit} className="space-y-3">
                  {bookError && (
                    <div className="bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl px-3 py-2">{bookError}</div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                      <input required value={bookForm.full_name}
                        onChange={e => setBookForm(f => ({ ...f, full_name: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-paddy-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
                      <input required type="tel" value={bookForm.phone}
                        onChange={e => setBookForm(f => ({ ...f, phone: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-paddy-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                      <input required type="email" value={bookForm.email}
                        onChange={e => setBookForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-paddy-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Property Location</label>
                      <input placeholder="Village, District" value={bookForm.property_location}
                        onChange={e => setBookForm(f => ({ ...f, property_location: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-paddy-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Area (Acres)</label>
                      <input type="number" min="0.5" step="0.5" placeholder="e.g. 2.5" value={bookForm.area_acres}
                        onChange={e => setBookForm(f => ({ ...f, area_acres: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-paddy-500" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
                      <textarea rows={2} value={bookForm.notes}
                        onChange={e => setBookForm(f => ({ ...f, notes: e.target.value }))}
                        placeholder="Any specific requirements…"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-paddy-500 resize-none" />
                    </div>
                  </div>
                  <button type="submit" disabled={bookLoading}
                    className="w-full bg-paddy-700 hover:bg-paddy-800 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm mt-1">
                    {bookLoading ? 'Submitting…' : 'Submit Enquiry →'}
                  </button>
                  <p className="text-center text-xs text-gray-400">Free consultation — no commitment needed</p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
