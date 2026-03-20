import { FileCheck, Map, Navigation, Sprout, BarChart2 } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { content } from '../data/content'

const ICONS = { FileCheck, Map, Navigation, Sprout, BarChart2 }

export default function ProjectHighlights() {
  const { lang } = useLang()
  const t = content[lang].highlights

  return (
    <section id="highlights" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <h2 className={`section-heading ${lang === 'te' ? 'telugu' : ''}`}>{t.heading}</h2>
        <p className={`section-subheading ${lang === 'te' ? 'telugu' : ''}`}>{t.subheading}</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.items.map((item, i) => {
            const Icon = ICONS[item.icon] || FileCheck
            return (
              <div key={i} className="card text-left group hover:border-forest-300">
                <div className="w-12 h-12 bg-gold-50 group-hover:bg-gold-100 border border-gold-200 rounded-xl flex items-center justify-center mb-4 transition-colors">
                  <Icon size={22} className="text-gold-600" />
                </div>
                <h3 className={`font-bold text-gray-800 text-base mb-1 ${lang === 'te' ? 'telugu' : ''}`}>
                  {item.title}
                </h3>
                <p className={`text-gray-500 text-sm leading-relaxed ${lang === 'te' ? 'telugu' : ''}`}>
                  {item.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
