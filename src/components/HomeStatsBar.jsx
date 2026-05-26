'use client'

import { useEffect, useState } from 'react'
import { useLang } from '../context/LanguageContext'
import { content } from '../data/content'

function formatCount(n, lang) {
  if (n == null || Number.isNaN(n)) return '—'
  return Number(n).toLocaleString(lang === 'te' ? 'te-IN' : 'en-IN')
}

/**
 * Homepage KPI strip (stakeholder main screen). Gated behind `feature-flags.home_stats_bar`
 * unless undefined (defaults visible).
 */
export default function HomeStatsBar() {
  const { lang } = useLang()
  const t = content[lang].stats
  const [visible, setVisible] = useState(true)
  const [data, setData] = useState(() => ({
    propertiesListed: null,
    propertiesClearDocumentation: null,
    propertiesSold: null,
    subscribedMembers: null,
    listingPartnersDistinct: null,
    totalEnquiries: null,
    propertyEnquiries: null,
  }))

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      let vis = true
      try {
        const fr = await fetch('/api/feature-flags')
        const fj = fr.ok ? await fr.json() : null
        if (!cancelled && fj?.flags?.home_stats_bar !== undefined) {
          vis = !!fj.flags.home_stats_bar.enabled
        }
      } catch {
        /* visible */
      }
      if (cancelled) return
      setVisible(vis)
      if (!vis) return
      try {
        const pr = await fetch('/api/platform-stats')
        const pj = pr.ok ? await pr.json() : null
        if (!cancelled && pj && typeof pj === 'object') setData(pj)
      } catch {
        /* stats optional */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const items = [
    { label: t.homeAvailable, value: data.propertiesListed, hint: null },
    { label: t.homeClearDocs, value: data.propertiesClearDocumentation, hint: null },
    { label: t.homeSold, value: data.propertiesSold, hint: null },
    {
      label: t.homeBeneficiaries,
      value: data.subscribedMembers,
      hint: t.homeBeneficiariesHint ?? null,
    },
    {
      label: t.homeFarmersAgents,
      value: data.listingPartnersDistinct,
      hint: lang === 'en' ? 'Active listing sellers' : 'ప్రస్తుత జాబితా ఉన్న అమ్మకందారులు',
    },
  ]

  if (!visible) return null

  const enquiryTotal = Number(data.totalEnquiries ?? data.propertyEnquiries ?? NaN)

  return (
    <section
      id="marketing-stats"
      className="relative border-y border-white/10 border-t-turmeric-500/25 bg-gradient-to-b from-[#0a2812]/92 via-[#0e3518]/88 to-[#071709]/95 backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(234,179,8,0.1)]"
      role="region"
      aria-label={lang === 'en' ? 'SDV Farms public statistics' : 'SDV ఫామ్స్ ప్రజా గణాంకాలు'}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: 'radial-gradient(circle at 40% 0%, rgb(217 119 6) 0, transparent 55%)' }}
      />
      <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-5 py-5 sm:py-7 px-4 sm:px-6 items-stretch max-w-6xl mx-auto">
        {items.map(({ label, value, hint }) => (
          <div key={label} className="flex flex-col items-center justify-center text-center min-w-0 gap-1">
            <p
              className={`font-medium leading-tight text-[11px] sm:text-xs text-white/70 ${lang === 'te' ? 'telugu' : ''}`}
            >
              {label}
            </p>
            <p className={`font-display font-bold tabular-nums text-xl sm:text-2xl md:text-[1.65rem] text-turmeric-200`}>
              {formatCount(value, lang)}
            </p>
            {hint ? (
              <p
                className={`text-[10px] sm:text-[11px] text-white/48 max-w-[9.5rem] leading-snug ${lang === 'te' ? 'telugu' : ''}`}
              >
                {hint}
              </p>
            ) : null}
          </div>
        ))}
      </div>
      {Number.isFinite(enquiryTotal) && enquiryTotal > 0 && (
        <p
          className={`relative text-center text-[11px] sm:text-xs text-turmeric-300/90 font-medium pb-4 sm:pb-5 px-3 ${lang === 'te' ? 'telugu' : ''}`}
        >
          + {formatCount(enquiryTotal, lang)} {t.homeStripEnquiriesChip}
          {typeof data.source === 'string' ? (
            <span className="sr-only">{' '}(stats source {data.source})</span>
          ) : null}
        </p>
      )}
    </section>
  )
}
