'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLang } from '../context/LanguageContext'

const STEPS = [
  {
    icon: '🔍',
    en: { title: 'Browse Properties',   desc: 'Filter by state, soil type, area and price to find your perfect agricultural land.' },
    te: { title: 'ప్రాపర్టీలు చూడండి', desc: 'రాష్ట్రం, నేల రకం, విస్తీర్ణం మరియు ధర ప్రకారం వడపోత చేయండి.' },
  },
  {
    icon: '📅',
    en: { title: 'Book a Site Visit',   desc: 'Pick a date and time slot. Our team confirms within 2 hours and meets you on-site.' },
    te: { title: 'సైట్ విజిట్ బుక్ చేయండి', desc: 'తేదీ మరియు సమయం ఎంచుకోండి. మా బృందం 2 గంటల్లో నిర్ధారిస్తుంది.' },
  },
  {
    icon: '🤝',
    en: { title: 'Register & Own',      desc: 'Complete legal paperwork with clear title deed registered directly in your name.' },
    te: { title: 'నమోదు చేసుకోండి & సొంతం చేసుకోండి', desc: 'క్లియర్ టైటిల్ డీడ్‌తో మీ పేరున నేరుగా నమోదు చేసుకోండి.' },
  },
]

export default function HowItWorks() {
  const { lang } = useLang()
  const [stats, setStats] = useState({ properties: 0, states: 3 })

  useEffect(() => {
    fetch('/api/property-count')
      .then(r => r.json())
      .then(d => setStats(s => ({ ...s, properties: d.count ?? 0 })))
      .catch(() => {})
  }, [])

  return (
    <section className="py-16 px-4 sm:px-6" style={{ background: 'linear-gradient(180deg, #0a1f0c 0%, #0d2510 100%)' }}>
      <div className="max-w-5xl mx-auto">

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-14">
          {[
            { value: stats.properties > 0 ? `${stats.properties}+` : 'Free', label: stats.properties > 0 ? 'Properties Listed' : 'Registration' },
            { value: stats.states,   label: 'States Covered' },
            { value: '100%',         label: 'Clear Title' },
          ].map((s, i) => (
            <div key={i} className="text-center py-5 rounded-2xl bg-white/4 border border-white/8">
              <p className="text-turmeric-400 font-display font-bold text-3xl sm:text-4xl mb-1">{s.value}</p>
              <p className="text-white/50 text-xs sm:text-sm">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Section heading */}
        <div className="text-center mb-10">
          <span className="bg-turmeric-500/15 border border-turmeric-400/25 text-turmeric-300 text-xs font-semibold px-3 py-1 rounded-full">
            How It Works
          </span>
          <h2 className={`text-white font-display text-2xl sm:text-3xl font-bold mt-4 ${lang === 'te' ? 'telugu' : ''}`}>
            {lang === 'en' ? 'Three simple steps to own agricultural land' : 'వ్యవసాయ భూమి సొంతం చేసుకోవడానికి మూడు సులభ దశలు'}
          </h2>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line — desktop only */}
          <div className="hidden sm:block absolute top-10 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-turmeric-500/20 via-turmeric-400/50 to-turmeric-500/20 pointer-events-none" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                {/* Icon circle */}
                <div className="relative mb-5">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-paddy-700/60 to-paddy-900/60 border border-turmeric-400/20 flex items-center justify-center text-3xl group-hover:border-turmeric-400/50 transition-colors shadow-lg">
                    {step.icon}
                  </div>
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-turmeric-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow">
                    {i + 1}
                  </span>
                </div>
                <h3 className={`text-white font-semibold text-base mb-2 ${lang === 'te' ? 'telugu' : ''}`}>
                  {step[lang].title}
                </h3>
                <p className={`text-white/50 text-sm leading-relaxed ${lang === 'te' ? 'telugu' : ''}`}>
                  {step[lang].desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <Link
            href="/properties"
            className="btn-gold px-8 py-3 text-sm font-semibold rounded-xl"
          >
            Browse Properties →
          </Link>
          <Link
            href="/auth/register"
            className="border border-white/20 text-white/80 hover:text-white hover:border-white/40 px-8 py-3 text-sm font-medium rounded-xl transition-colors"
          >
            Sell Your Land
          </Link>
        </div>

      </div>
    </section>
  )
}
