import { useLang } from '../context/LanguageContext'
import { content } from '../data/content'

export default function About() {
  const { lang } = useLang()
  const t = content[lang].about

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <span className="text-gold-500 font-semibold text-sm uppercase tracking-widest">
              Phase 1
            </span>
            <h2 className={`section-heading mt-2 ${lang === 'te' ? 'telugu' : ''}`}>
              {t.heading}
            </h2>
            <p className={`text-forest-600 font-medium text-lg mb-4 ${lang === 'te' ? 'telugu' : ''}`}>
              {t.subheading}
            </p>
            <p className={`text-gray-600 leading-relaxed ${lang === 'te' ? 'telugu' : ''}`}>
              {t.body}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {t.stats.map((s, i) => (
              <div
                key={i}
                className="bg-forest-50 border border-forest-100 rounded-2xl p-6 text-center"
              >
                <p className="text-4xl font-extrabold text-forest-700">{s.value}</p>
                <p className={`text-forest-600 font-medium mt-1 text-sm ${lang === 'te' ? 'telugu' : ''}`}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
