'use client'
import { FileCheck, Map, Navigation, Sprout, BarChart2 } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { content } from '../data/content'

const ICONS = { FileCheck, Map, Navigation, Sprout, BarChart2 }

export default function ProjectHighlights() {
  const { lang } = useLang()
  const t = content[lang].highlights

  return (
    <section id="highlights" className="relative py-20 bg-linen">
      {/* Dot pattern */}
      <div className="absolute inset-0 bg-dot-pattern opacity-80 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <span className="inline-block text-terracotta-600 font-semibold text-xs uppercase tracking-[0.2em] mb-3">
          Project Features
        </span>
        <h2 className={`section-heading ${lang === 'te' ? 'telugu' : ''}`}>{t.heading}</h2>
        <div className="gold-divider" />
        <p className={`section-subheading -mt-4 ${lang === 'te' ? 'telugu' : ''}`}>{t.subheading}</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.items.map((item, i) => {
            const Icon = ICONS[item.icon] || FileCheck
            return (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 text-left shadow-sm border border-turmeric-100 hover:shadow-md hover:border-turmeric-300 transition-all duration-300 group"
              >
                {/* Left accent bar */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-turmeric-100 to-marigold-400/20 border border-turmeric-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-turmeric-200 group-hover:to-marigold-400/40 transition-colors">
                    <Icon size={22} className="text-turmeric-600" />
                  </div>
                  <div>
                    <h3 className={`font-display font-bold text-paddy-900 text-base mb-1 ${lang === 'te' ? 'telugu' : ''}`}>
                      {item.title}
                    </h3>
                    <p className={`text-gray-500 text-sm leading-relaxed ${lang === 'te' ? 'telugu' : ''}`}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Wave */}
      <div className="wave-bottom">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,20 C360,70 1080,10 1440,50 L1440,60 L0,60 Z" fill="#fdf8f0" />
        </svg>
      </div>
    </section>
  )
}
