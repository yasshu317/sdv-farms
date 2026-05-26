'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLang } from '../../context/LanguageContext'
import { content } from '../../data/content'
import { PHASE2_SERVICES, PHASE3_ITEMS, SERVICE_KEYS } from './phase2ServicesData'

const emptyBookForm = () => ({
  full_name: '',
  email: '',
  phone: '',
  property_location: '',
  area_acres: '',
  notes: '',
})

/**
 * Phase II listing cards + enquiry modal (+ optional Phase III teaser).
 * Used on `/services` and embedded in buyer dashboard.
 *
 * @param {{ prefillContact?: { full_name?: string, email?: string, phone?: string }, showPhase3Teaser?: boolean, footerLinkHref?: string, footerLinkLabel?: string }} props
 */
export default function Phase2ServicesPanel({
  prefillContact = null,
  showPhase3Teaser = true,
  footerLinkHref = '/services',
  footerLinkLabel = 'Open full Services page →',
}) {
  const { lang } = useLang()
  const t = content[lang].services

  const [notifyEmail, setNotifyEmail] = useState(prefillContact?.email || '')
  const [notifyDone, setNotifyDone] = useState(false)
  const [bookingFor, setBookingFor] = useState(null)
  const [bookForm, setBookForm] = useState(emptyBookForm)
  const [bookLoading, setBookLoading] = useState(false)
  const [bookSuccess, setBookSuccess] = useState(false)
  const [bookError, setBookError] = useState('')

  /** Keep notify field in sync once profile email arrives */
  useEffect(() => {
    if (prefillContact?.email && !notifyEmail)
      setNotifyEmail(prefillContact.email)
  }, [prefillContact?.email, notifyEmail])

  function applyPrefillToForm(base = emptyBookForm()) {
    if (!prefillContact) return base
    return {
      ...base,
      full_name: prefillContact.full_name || base.full_name,
      email: prefillContact.email || base.email,
      phone: prefillContact.phone || base.phone,
    }
  }

  async function handleNotify(e) {
    e.preventDefault()
    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'info@sdvfarms.in',
          subject: 'Phase III Notify Me — SDV Farms',
          html: `<p>A visitor wants to be notified when Phase III launches:</p><p><strong>${notifyEmail}</strong></p>`,
        }),
      })
    } catch (_) {
      // best-effort
    }
    setNotifyDone(true)
  }

  function openBooking(serviceKey) {
    setBookingFor(serviceKey)
    setBookForm(applyPrefillToForm(emptyBookForm()))
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="bg-turmeric-500/20 border border-turmeric-400/30 text-turmeric-300 text-xs font-semibold px-3 py-1 rounded-full">
          Phase II — One-Time Services
        </span>
        {footerLinkHref ? (
          <Link
            href={footerLinkHref}
            className="text-xs text-white/45 hover:text-turmeric-300 transition-colors whitespace-nowrap"
          >
            {footerLinkLabel}
          </Link>
        ) : null}
      </div>

      <div className="flex items-center gap-3 p-4 rounded-xl bg-turmeric-500/8 border border-turmeric-400/15">
        <span className="text-turmeric-400 text-lg">💰</span>
        <p className="text-white/65 text-sm">
          All services are <strong className="text-white/85">priced on enquiry</strong> — no hidden charges. Call{' '}
          <a href="tel:7780312525" className="text-turmeric-400 hover:text-turmeric-300 font-semibold">7780312525</a>{' '}
          for a customised quote.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {PHASE2_SERVICES.map(svc => (
          <div
            key={svc.titleKey}
            className={`relative bg-gradient-to-br ${svc.accent} border border-white/10 hover:border-turmeric-400/30 rounded-2xl p-5 transition-all group flex flex-col`}
          >
            <div className="w-12 h-12 rounded-2xl bg-white/8 border border-white/10 flex items-center justify-center text-2xl mb-3 group-hover:scale-105 transition-transform">
              {svc.icon}
            </div>
            <h3 className={`text-white font-semibold text-sm leading-snug mb-2 ${lang === 'te' ? 'telugu' : ''}`}>
              {t[svc.titleKey]}
            </h3>
            <p className={`text-white/55 text-xs leading-relaxed mb-3 flex-1 ${lang === 'te' ? 'telugu' : ''}`}>
              {t[svc.descKey]}
            </p>
            <div className="flex items-center justify-between gap-2 mt-auto flex-wrap">
              <span className={`text-[10px] border px-2 py-0.5 rounded-full font-medium ${svc.tagColor}`}>
                {svc.tag}
              </span>
              <button
                type="button"
                onClick={() => openBooking(SERVICE_KEYS[PHASE2_SERVICES.indexOf(svc)])}
                className="text-[11px] bg-white/10 hover:bg-turmeric-500/20 hover:border-turmeric-400/30 border border-white/10 text-white/80 hover:text-white font-medium py-1.5 px-2.5 rounded-xl transition-all"
              >
                Enquire →
              </button>
            </div>
          </div>
        ))}
      </div>

      {showPhase3Teaser && (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-paddy-900/60 to-paddy-800/30 p-6 sm:p-8">
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(212,160,23,0.6) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
          />
          <div className="relative">
            <span className="inline-block bg-white/10 border border-white/15 text-white/60 text-[10px] font-semibold px-2.5 py-1 rounded-full mb-3">
              Phase III — Coming Soon
            </span>
            <h3 className={`text-white font-display text-lg font-bold mb-2 ${lang === 'te' ? 'telugu' : ''}`}>
              {t.phase3Heading}
            </h3>
            <p className={`text-white/55 text-sm mb-4 max-w-lg ${lang === 'te' ? 'telugu' : ''}`}>{t.phase3Sub}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
              {PHASE3_ITEMS.map(item => (
                <div key={item.key} className="relative bg-white/5 border border-white/8 rounded-xl p-3 text-center overflow-hidden">
                  <span className="absolute top-0 right-0 bg-white/15 text-white/50 text-[8px] font-semibold px-1.5 py-0.5 rounded-bl-lg rounded-tr-lg border-l border-b border-white/10">
                    Soon
                  </span>
                  <div className="text-xl mb-1">{item.icon}</div>
                  <p className={`text-white/65 text-[11px] font-medium mb-0.5 ${lang === 'te' ? 'telugu' : ''}`}>{t[item.key]}</p>
                  <p className="text-white/30 text-[9px] leading-snug hidden sm:block">{item.desc}</p>
                </div>
              ))}
            </div>
            {notifyDone ? (
              <p className="text-paddy-400 text-xs">✓ We&apos;ll notify you when Phase III launches!</p>
            ) : (
              <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-2 max-w-md">
                <input
                  type="email"
                  required
                  value={notifyEmail}
                  onChange={e => setNotifyEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-white/35 focus:outline-none focus:border-turmeric-400 transition-colors text-sm"
                />
                <button
                  type="submit"
                  className="bg-turmeric-500 hover:bg-turmeric-600 text-white font-medium px-4 py-2 rounded-xl transition-colors text-sm whitespace-nowrap"
                >
                  Notify me
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal — above dashboard sticky headers */}
      {bookingFor && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Book Service Enquiry</h3>
                <p className="text-xs text-gray-400 mt-0.5 capitalize">
                  {bookingFor.replace('_', ' ')} — we&apos;ll call you within 24 hours
                </p>
              </div>
              <button type="button" onClick={() => setBookingFor(null)} className="text-gray-400 hover:text-gray-600 text-xl font-light shrink-0" aria-label="Close">
                ✕
              </button>
            </div>

            <div className="px-5 py-4">
              {bookSuccess ? (
                <div className="text-center py-5">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-paddy-800 font-semibold mb-1 text-sm">Enquiry submitted!</p>
                  <p className="text-gray-500 text-xs mb-4">We&apos;ll call you within 24 hours to discuss details and pricing.</p>
                  <button type="button" onClick={() => setBookingFor(null)}
                    className="bg-paddy-700 text-white text-sm font-medium px-5 py-2 rounded-xl hover:bg-paddy-800 transition-colors">
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookSubmit} className="space-y-2.5">
                  {bookError && (
                    <div className="bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl px-3 py-2">{bookError}</div>
                  )}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Full Name *</label>
                      <input required value={bookForm.full_name}
                        onChange={e => setBookForm(f => ({ ...f, full_name: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-paddy-500" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Phone *</label>
                      <input required type="tel" value={bookForm.phone}
                        onChange={e => setBookForm(f => ({ ...f, phone: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-paddy-500" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Email *</label>
                      <input required type="email" value={bookForm.email}
                        onChange={e => setBookForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-paddy-500" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Property Location</label>
                      <input placeholder="Village, District" value={bookForm.property_location}
                        onChange={e => setBookForm(f => ({ ...f, property_location: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-paddy-500" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Area (Acres)</label>
                      <input type="number" min="0.5" step="0.5" placeholder="e.g. 2.5" value={bookForm.area_acres}
                        onChange={e => setBookForm(f => ({ ...f, area_acres: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-paddy-500" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Notes (optional)</label>
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
                  <p className="text-center text-[10px] text-gray-400">Free consultation — no commitment needed</p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
