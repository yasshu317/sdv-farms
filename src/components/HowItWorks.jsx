'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLang } from '../context/LanguageContext'
import { createClient } from '../lib/supabase'
import { REGISTER_LIST_LAND } from '../lib/routes'
import { content } from '../data/content'

const STEPS = [
  {
    icon: '🔍',
    en: { title: 'View properties', desc: 'Filter by state, soil type, area and price to find your agricultural land.' },
    te: { title: 'ఆస్తులను చూడండి', desc: 'రాష్ట్రం, నేల రకం, విస్తీర్ణం మరియు ధర ప్రకారం వడపోత చేయండి.' },
  },
  {
    icon: '✨',
    en: { title: 'Interested — book a visit', desc: 'Show interest on a listing, pick a slot, and our team confirms with you.' },
    te: { title: 'ఆసక్తి — సందర్శన', desc: 'జాబితాలో ఆసక్తి తెలిపి, స్లాట్ ఎంచుకోండి.' },
  },
  {
    icon: '🤝',
    en: { title: 'Register & Own',      desc: 'Complete legal paperwork with clear title deed registered directly in your name.' },
    te: { title: 'నమోదు చేసుకోండి & సొంతం చేసుకోండి', desc: 'క్లియర్ టైటిల్ డీడ్‌తో మీ పేరున నేరుగా నమోదు చేసుకోండి.' },
  },
]

export default function HowItWorks() {
  const { lang } = useLang()
  const [stats, setStats]       = useState({ properties: 0 })
  const [sellerUser, setSellerUser] = useState(false)

  useEffect(() => {
    fetch('/api/property-count')
      .then(r => r.json())
      .then(d => setStats(s => ({ ...s, properties: d.count ?? 0 })))
      .catch(() => {})
    // Check if logged-in user is already a seller so we can swap the CTA
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.user_metadata?.role === 'seller') setSellerUser(true)
    })
  }, [])

  return (
    <section className="py-16 px-4 sm:px-6" style={{ background: 'linear-gradient(180deg, #061208 0%, #0d2510 55%, #0a1f0c 100%)' }}>
      <div className="max-w-5xl mx-auto">

        {/* Stats bar */}
        <div className="grid grid-cols-2 gap-4 mb-14">
          {[
            { value: stats.properties > 0 ? `${stats.properties}+` : 'Free', label: stats.properties > 0 ? 'Properties Listed' : 'to List & Buy' },
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
            {lang === 'en' ? 'How It Works — For Buyers' : 'కొనుగోలుదారులకు — ఎలా పని చేస్తుంది'}
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

        {/* Buyer CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 mb-14">
          <Link
            href="/properties"
            className="btn-gold px-8 py-3 text-sm font-semibold rounded-xl"
          >
            {content[lang].cta.viewProperties} →
          </Link>
          <Link
            href="/buyer-request"
            className="border border-white/20 text-white/80 hover:text-white hover:border-white/40 px-8 py-3 text-sm font-medium rounded-xl transition-colors"
          >
            {lang === 'en' ? 'Post a Land Request' : 'భూమి అభ్యర్థన పంపండి'}
          </Link>
        </div>

        {/* ─── Seller path ─── */}
        <div className="border-t border-white/10 pt-10">
          <div className="text-center mb-8">
            <span className="bg-paddy-500/15 border border-paddy-400/25 text-paddy-300 text-xs font-semibold px-3 py-1 rounded-full">
              {lang === 'en' ? 'Have land to sell? — For Sellers' : 'భూమి అమ్మాలా? — విక్రేతలకు'}
            </span>
            <h2 className={`text-white font-display text-xl sm:text-2xl font-bold mt-4 ${lang === 'te' ? 'telugu' : ''}`}>
              {lang === 'en' ? 'List your land in 3 steps — free, fast, verified' : '3 దశల్లో మీ భూమిని జాబితా చేయండి — ఉచితం, వేగంగా'}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {[
              { icon: '📋', en: { title: 'Register as Seller', desc: 'Create a free account. Takes under 2 minutes.' }, te: { title: 'విక్రేతగా నమోదు', desc: '2 నిమిషాల్లో ఉచిత ఖాతా సృష్టించండి.' } },
              { icon: '🌾', en: { title: 'Fill Land Details', desc: 'Location, area, price per acre, upload Pahani / ROR-1B doc.' }, te: { title: 'భూమి వివరాలు నమోదు', desc: 'స్థానం, విస్తీర్ణం, ధర, పహానీ/ROR-1B అప్‌లోడ్ చేయండి.' } },
              { icon: '✅', en: { title: 'Go Live After Review', desc: 'We verify your listing within 24 hours. Then buyers can find you.' }, te: { title: 'సమీక్ష తర్వాత లైవ్', desc: '24 గంటల్లోపు మేము తనిఖీ చేస్తాము. తర్వాత కొనుగోలుదారులు మిమ్మల్ని కనుగొంటారు.' } },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-paddy-700/40 border border-paddy-400/20 flex items-center justify-center text-2xl mb-4">
                  {s.icon}
                </div>
                <h3 className={`text-white font-semibold text-sm mb-1.5 ${lang === 'te' ? 'telugu' : ''}`}>{s[lang].title}</h3>
                <p className={`text-white/45 text-xs leading-relaxed ${lang === 'te' ? 'telugu' : ''}`}>{s[lang].desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            {sellerUser ? (
              <Link
                href="/seller"
                className="inline-block border border-turmeric-400/40 text-turmeric-300 hover:bg-turmeric-500/15 hover:border-turmeric-300 px-8 py-3 text-sm font-medium rounded-xl transition-colors"
              >
                {lang === 'en' ? 'Go to My Listings →' : 'నా జాబితాలకు వెళ్ళు →'}
              </Link>
            ) : (
              <Link
                href={REGISTER_LIST_LAND}
                className="inline-block border border-paddy-400/40 text-paddy-300 hover:bg-paddy-500/15 hover:border-paddy-300 px-8 py-3 text-sm font-medium rounded-xl transition-colors"
              >
                {lang === 'en' ? 'List Your Land — Free →' : 'మీ భూమి జాబితా చేయండి — ఉచితం →'}
              </Link>
            )}
          </div>
        </div>

      </div>
    </section>
  )
}
