import { useLang } from '../context/LanguageContext'
import { content } from '../data/content'

const TILES = [
  {
    label: { en: 'Paddy Fields', te: 'వరి పొలాలు' },
    gradient: 'from-paddy-700 via-paddy-500 to-paddy-400',
    icon: '🌾',
    desc: { en: 'Lush green paddy fields', te: 'పచ్చని వరి పొలాలు' },
    size: 'col-span-1 row-span-2',
  },
  {
    label: { en: 'Golden Harvest', te: 'బంగారు పంట' },
    gradient: 'from-turmeric-600 via-turmeric-400 to-marigold-400',
    icon: '🌻',
    desc: { en: 'Season of abundance', te: 'సమృద్ధి కాలం' },
    size: 'col-span-1',
  },
  {
    label: { en: 'Sunrise View', te: 'సూర్యోదయ దృశ్యం' },
    gradient: 'from-paddy-900 via-paddy-700 to-turmeric-500',
    icon: '🌅',
    desc: { en: 'Dawn over the farmland', te: 'వ్యవసాయ భూమిపై తెల్లవారు' },
    size: 'col-span-1',
  },
  {
    label: { en: 'Plot Layout', te: 'ప్లాట్ లేఅవుట్' },
    gradient: 'from-terracotta-700 via-terracotta-500 to-turmeric-400',
    icon: '🗺️',
    desc: { en: 'Planned demarcations', te: 'ప్రణాళికాబద్ధ హద్దులు' },
    size: 'col-span-1',
  },
  {
    label: { en: 'Road Access', te: 'రహదారి ప్రాప్యత' },
    gradient: 'from-gray-700 via-gray-500 to-paddy-500',
    icon: '🛣️',
    desc: { en: 'Connected to highways', te: 'రహదారులకు అనుసంధానం' },
    size: 'col-span-1',
  },
  {
    label: { en: 'Fertile Soil', te: 'సారవంతమైన నేల' },
    gradient: 'from-soil via-terracotta-700 to-paddy-600',
    icon: '🌱',
    desc: { en: 'Rich red Telangana soil', te: 'సమృద్ధమైన తెలంగాణ నేల' },
    size: 'col-span-1',
  },
]

export default function Gallery() {
  const { lang } = useLang()
  const t = content[lang].gallery

  return (
    <section id="gallery" className="relative py-20 bg-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <span className="inline-block text-terracotta-600 font-semibold text-xs uppercase tracking-[0.2em] mb-3">
          Gallery
        </span>
        <h2 className={`section-heading ${lang === 'te' ? 'telugu' : ''}`}>{t.heading}</h2>
        <div className="gold-divider" />
        <p className={`section-subheading -mt-4 ${lang === 'te' ? 'telugu' : ''}`}>{t.subheading}</p>

        {/* Masonry-style grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[180px]">
          {TILES.map((tile, i) => (
            <div
              key={i}
              className={`relative bg-gradient-to-br ${tile.gradient} rounded-2xl overflow-hidden group cursor-pointer ${tile.size}`}
            >
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-400 rounded-2xl" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <span className="text-5xl mb-2 drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {tile.icon}
                </span>
                <p className="text-white font-display font-bold text-base drop-shadow">
                  {tile.label[lang] || tile.label.en}
                </p>
                <p className={`text-white/60 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${lang === 'te' ? 'telugu' : ''}`}>
                  {tile.desc[lang] || tile.desc.en}
                </p>
              </div>

              {/* Corner badge */}
              <div className="absolute top-3 right-3 w-7 h-7 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-5 text-gray-400 text-sm italic">
          Replace placeholder tiles with actual farm photographs.
        </p>
      </div>

      {/* Wave */}
      <div className="wave-bottom">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,40 C480,0 960,70 1440,30 L1440,60 L0,60 Z" fill="#5c2d0a" opacity="0.9" />
        </svg>
      </div>
    </section>
  )
}
