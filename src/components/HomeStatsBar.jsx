'use client'

import { useEffect, useState } from 'react'
import { useLang } from '../context/LanguageContext'
import { content } from '../data/content'

function formatCount(n, lang) {
  if (n == null || Number.isNaN(n)) return '—'
  return Number(n).toLocaleString(lang === 'te' ? 'te-IN' : 'en-IN')
}

export default function HomeStatsBar({ scrolled }) {
  const { lang } = useLang()
  const t = content[lang].stats
  const [visible, setVisible] = useState(true)
  const [data, setData] = useState({
    propertyEnquiries: null,
    subscribedMembers: null,
    propertiesListed: null,
    propertiesSold: null,
  })

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
        /* keep default visible */
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
    { label: t.propertyEnquiries, value: data.propertyEnquiries },
    { label: t.subscribedMembers, value: data.subscribedMembers },
    { label: t.propertiesListed, value: data.propertiesListed },
    { label: t.propertiesSold, value: data.propertiesSold },
  ]

  if (!visible) return null

  return (
    <div
      className={`border-t text-[11px] sm:text-xs md:text-sm ${
        scrolled
          ? 'border-paddy-100 bg-white'
          : 'border-white/15 bg-paddy-950/55 backdrop-blur-md'
      }`}
      role="region"
      aria-label={lang === 'en' ? 'Platform statistics' : 'ప్లాట్‌ఫారమ్ గణాంకాలు'}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3 py-2.5 md:py-3 items-center max-w-5xl mx-auto">
        {items.map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center justify-center text-center min-w-0 gap-0.5">
            <p
              className={`font-medium leading-tight mb-0.5 truncate px-0.5 ${
                scrolled ? 'text-paddy-600' : 'text-white/80'
              } ${lang === 'te' ? 'telugu' : ''}`}
            >
              {label}
            </p>
            <p
              className={`font-display font-bold tabular-nums text-sm sm:text-base md:text-lg ${
                scrolled ? 'text-paddy-900' : 'text-white'
              }`}
            >
              {formatCount(value, lang)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
