import {
  ShieldCheck, BadgeCheck, FileText, Tag, TrendingUp,
  Sprout, Lock, ArrowLeftRight, Heart,
} from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { content } from '../data/content'

const ICONS = { ShieldCheck, BadgeCheck, FileText, Tag, TrendingUp, Sprout, Lock, ArrowLeftRight, Heart }

const ICON_COLORS = [
  'bg-paddy-100 text-paddy-700',
  'bg-turmeric-100 text-turmeric-700',
  'bg-terracotta-100 text-terracotta-700',
  'bg-paddy-100 text-paddy-700',
  'bg-turmeric-100 text-turmeric-700',
  'bg-paddy-100 text-paddy-700',
  'bg-terracotta-100 text-terracotta-700',
  'bg-turmeric-100 text-turmeric-700',
  'bg-paddy-100 text-paddy-700',
]

export default function WhyInvest() {
  const { lang } = useLang()
  const t = content[lang].whyInvest

  return (
    <section id="why-invest" className="relative py-20 bg-paddy-50">
      {/* Leaf pattern overlay */}
      <div className="absolute inset-0 bg-leaf-pattern opacity-60 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <span className="inline-block text-terracotta-600 font-semibold text-xs uppercase tracking-[0.2em] mb-3">
          Why Choose SDV Farms
        </span>
        <h2 className={`section-heading ${lang === 'te' ? 'telugu' : ''}`}>{t.heading}</h2>
        <div className="gold-divider" />
        <p className={`section-subheading -mt-4 ${lang === 'te' ? 'telugu' : ''}`}>{t.subheading}</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {t.reasons.map((r, i) => {
            const Icon = ICONS[r.icon] || ShieldCheck
            const colorClass = ICON_COLORS[i % ICON_COLORS.length]
            return (
              <div key={i} className="card flex items-start gap-4 text-left bg-white/80 backdrop-blur-sm">
                <div className={`icon-circle ${colorClass}`}>
                  <Icon size={20} />
                </div>
                <p className={`text-paddy-900 font-medium leading-snug pt-1 ${lang === 'te' ? 'telugu' : ''}`}>
                  {r.title}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Wave */}
      <div className="wave-bottom">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,30 C480,80 960,0 1440,40 L1440,60 L0,60 Z" fill="#1a4520" />
        </svg>
      </div>
    </section>
  )
}
