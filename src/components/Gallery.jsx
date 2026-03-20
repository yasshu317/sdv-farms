import { useLang } from '../context/LanguageContext'
import { content } from '../data/content'

const PLACEHOLDERS = [
  { label: 'Farm View', bg: 'from-forest-700 to-forest-500', emoji: '🌾' },
  { label: 'Green Fields', bg: 'from-forest-600 to-green-400', emoji: '🌿' },
  { label: 'Sunrise at SDV', bg: 'from-gold-600 to-gold-400', emoji: '🌅' },
  { label: 'Layout Plan', bg: 'from-forest-800 to-forest-600', emoji: '🗺️' },
  { label: 'Road Access', bg: 'from-gray-600 to-gray-400', emoji: '🛣️' },
  { label: 'Harvest Season', bg: 'from-gold-700 to-forest-500', emoji: '🌻' },
]

export default function Gallery() {
  const { lang } = useLang()
  const t = content[lang].gallery

  return (
    <section id="gallery" className="py-20 bg-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <h2 className={`section-heading ${lang === 'te' ? 'telugu' : ''}`}>{t.heading}</h2>
        <p className={`section-subheading ${lang === 'te' ? 'telugu' : ''}`}>{t.subheading}</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {PLACEHOLDERS.map((p, i) => (
            <div
              key={i}
              className={`relative bg-gradient-to-br ${p.bg} rounded-2xl overflow-hidden aspect-video flex flex-col items-center justify-center group cursor-pointer`}
            >
              <span className="text-5xl mb-2 group-hover:scale-110 transition-transform duration-300">
                {p.emoji}
              </span>
              <span className="text-white/90 font-semibold text-sm">{p.label}</span>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-2xl" />
            </div>
          ))}
        </div>

        <p className="mt-6 text-gray-400 text-sm italic">
          Real photos coming soon — replace placeholders with actual farm images.
        </p>
      </div>
    </section>
  )
}
