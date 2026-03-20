import { TrendingUp, Wheat, ShieldCheck, Users } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { content } from '../data/content'

const ICONS = { TrendingUp, Wheat, ShieldCheck, Users }

export default function InvestmentBenefits() {
  const { lang } = useLang()
  const t = content[lang].benefits

  return (
    <section id="benefits" className="py-20 bg-forest-800 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <h2 className={`text-3xl md:text-4xl font-bold text-white mb-3 ${lang === 'te' ? 'telugu' : ''}`}>
          {t.heading}
        </h2>
        <p className={`text-forest-200 text-lg mb-12 max-w-2xl mx-auto ${lang === 'te' ? 'telugu' : ''}`}>
          {t.subheading}
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.items.map((item, i) => {
            const Icon = ICONS[item.icon] || TrendingUp
            return (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
              >
                <div className="w-12 h-12 bg-gold-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} className="text-gold-400" />
                </div>
                <h3 className={`font-bold text-lg mb-2 ${lang === 'te' ? 'telugu' : ''}`}>{item.title}</h3>
                <p className={`text-forest-200 text-sm leading-relaxed ${lang === 'te' ? 'telugu' : ''}`}>
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
