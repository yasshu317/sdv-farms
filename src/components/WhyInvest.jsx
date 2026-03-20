import {
  ShieldCheck, BadgeCheck, FileText, Tag, TrendingUp,
  Sprout, Lock, ArrowLeftRight, Heart,
} from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { content } from '../data/content'

const ICONS = { ShieldCheck, BadgeCheck, FileText, Tag, TrendingUp, Sprout, Lock, ArrowLeftRight, Heart }

export default function WhyInvest() {
  const { lang } = useLang()
  const t = content[lang].whyInvest

  return (
    <section id="why-invest" className="py-20 bg-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <h2 className={`section-heading ${lang === 'te' ? 'telugu' : ''}`}>{t.heading}</h2>
        <p className={`section-subheading ${lang === 'te' ? 'telugu' : ''}`}>{t.subheading}</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
          {t.reasons.map((r, i) => {
            const Icon = ICONS[r.icon] || ShieldCheck
            return (
              <div key={i} className="card flex items-start gap-4 text-left">
                <div className="flex-shrink-0 w-10 h-10 bg-forest-100 rounded-xl flex items-center justify-center">
                  <Icon size={20} className="text-forest-600" />
                </div>
                <p className={`text-gray-700 font-medium leading-snug ${lang === 'te' ? 'telugu' : ''}`}>
                  {r.title}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
