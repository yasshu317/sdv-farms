import { useLang } from '../context/LanguageContext'
import { content } from '../data/content'

function KalamkariAccent() {
  return (
    <svg
      viewBox="0 0 120 24"
      className="w-32 opacity-30"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Simplified Kalamkari-inspired border motif */}
      {[0, 1, 2, 3, 4].map(i => (
        <g key={i} transform={`translate(${i * 24}, 0)`}>
          <path d="M12,2 Q18,8 12,14 Q6,8 12,2Z" fill="#d4a017" />
          <circle cx="12" cy="2" r="1.5" fill="#c1380e" />
          <circle cx="12" cy="14" r="1.5" fill="#c1380e" />
        </g>
      ))}
    </svg>
  )
}

export default function About() {
  const { lang } = useLang()
  const t = content[lang].about

  return (
    <section id="about" className="relative py-20 bg-cream">
      {/* Subtle leaf pattern */}
      <div className="absolute inset-0 bg-leaf-pattern opacity-40 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-14 items-center">

          {/* Text */}
          <div>
            <span className="inline-block text-terracotta-600 font-semibold text-xs uppercase tracking-[0.2em] mb-3">
              Government Approved • Phase 1
            </span>
            <h2 className={`section-heading ${lang === 'te' ? 'telugu' : ''}`}>
              {t.heading}
            </h2>
            <KalamkariAccent />
            <p className={`text-paddy-700 font-medium text-lg mt-5 mb-4 ${lang === 'te' ? 'telugu' : ''}`}>
              {t.subheading}
            </p>
            <p className={`text-gray-600 leading-relaxed ${lang === 'te' ? 'telugu' : ''}`}>
              {t.body}
            </p>

            {/* Trust row */}
            <div className="flex items-center gap-3 mt-6 text-sm text-paddy-700 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="text-turmeric-500 text-base">✓</span> Clear Title
              </span>
              <span className="text-turmeric-300">|</span>
              <span className="flex items-center gap-1.5">
                <span className="text-turmeric-500 text-base">✓</span> Govt. Approved
              </span>
              <span className="text-turmeric-300">|</span>
              <span className="flex items-center gap-1.5">
                <span className="text-turmeric-500 text-base">✓</span> Registered Deed
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {t.stats.map((s, i) => (
              <div
                key={i}
                className="relative bg-white rounded-2xl p-6 text-center border border-turmeric-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow"
              >
                {/* Accent stripe */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-turmeric-400 to-marigold-400" />
                <p className="font-display text-4xl font-bold text-paddy-800 mb-1">{s.value}</p>
                <p className={`text-paddy-600 font-medium text-sm ${lang === 'te' ? 'telugu' : ''}`}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wave to next section */}
      <div className="wave-bottom">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0,0 C360,60 1080,0 1440,50 L1440,60 L0,60 Z"
            fill="#f0f7f1"
          />
        </svg>
      </div>
    </section>
  )
}
