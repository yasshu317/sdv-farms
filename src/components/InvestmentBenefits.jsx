import { TrendingUp, Wheat, ShieldCheck, Users } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { content } from '../data/content'

const ICONS = { TrendingUp, Wheat, ShieldCheck, Users }

export default function InvestmentBenefits() {
  const { lang } = useLang()
  const t = content[lang].benefits

  return (
    <section id="benefits" className="relative py-24 overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #1a4520 0%, #0e2c13 50%, #071709 100%)',
      }}
    >
      {/* Dot grid overlay */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(212,160,23,0.4) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Decorative marigold glow blobs */}
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-turmeric-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-paddy-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <span className="inline-block text-turmeric-400 font-semibold text-xs uppercase tracking-[0.2em] mb-3">
          Your Investment
        </span>
        <h2 className={`font-display text-3xl md:text-4xl font-bold text-white mb-3 ${lang === 'te' ? 'telugu' : ''}`}>
          {t.heading}
        </h2>
        <div className="gold-divider" />
        <p className={`text-paddy-200/60 text-base mb-12 max-w-2xl mx-auto -mt-4 ${lang === 'te' ? 'telugu' : ''}`}>
          {t.subheading}
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.items.map((item, i) => {
            const Icon = ICONS[item.icon] || TrendingUp
            return (
              <div key={i} className="card-dark rounded-2xl group relative overflow-hidden">
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-turmeric-500/0 via-turmeric-400/70 to-turmeric-500/0" />

                <div className="w-14 h-14 bg-turmeric-500/15 border border-turmeric-400/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Icon size={26} className="text-turmeric-400" />
                </div>
                <h3 className={`font-display font-bold text-lg text-white mb-2 leading-snug ${lang === 'te' ? 'telugu' : ''}`}>
                  {item.title}
                </h3>
                <p className={`text-paddy-200/55 text-sm leading-relaxed ${lang === 'te' ? 'telugu' : ''}`}>
                  {item.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Wave */}
      <div className="wave-bottom">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,50 C360,0 1080,60 1440,20 L1440,60 L0,60 Z" fill="#faf3e0" />
        </svg>
      </div>
    </section>
  )
}
