import { Link } from 'react-scroll'
import { Phone } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { content } from '../data/content'

export default function Hero() {
  const { lang } = useLang()
  const t = content[lang].hero

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-forest-900 via-forest-700 to-forest-500" />

      {/* Decorative circles */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-gold-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-forest-400/20 rounded-full blur-3xl" />

      {/* Grain texture overlay */}
      <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48ZmVDb2xvck1hdHJpeCB0eXBlPSJzYXR1cmF0ZSIgdmFsdWVzPSIwIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjEiLz48L3N2Zz4=')]" />

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
        {/* Badge */}
        <span className="inline-block bg-gold-500/20 border border-gold-400/40 text-gold-300 text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide">
          {t.badge}
        </span>

        {/* Title */}
        <h1 className="text-5xl sm:text-7xl font-extrabold text-white mb-2 tracking-tight">
          {t.title}
        </h1>
        <p className="text-gold-400 text-xl sm:text-2xl font-semibold mb-6">{t.phase}</p>

        {/* Tagline */}
        <p className={`text-white/80 text-base sm:text-lg mb-4 font-medium ${lang === 'te' ? 'telugu' : ''}`}>
          {t.tagline}
        </p>

        {/* Description */}
        <p className={`text-white/60 text-sm sm:text-base max-w-2xl mx-auto mb-10 leading-relaxed ${lang === 'te' ? 'telugu' : ''}`}>
          {t.description}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="contact"
            smooth
            duration={600}
            offset={-64}
            className={`btn-gold text-base shadow-lg shadow-gold-500/30 ${lang === 'te' ? 'telugu' : ''}`}
          >
            {t.ctaVisit}
          </Link>

          <a
            href={`tel:${t.phone}`}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold py-3 px-8 rounded-full transition-colors duration-200"
          >
            <Phone size={18} />
            <span>{t.ctaCall}: {t.phone}</span>
          </a>
        </div>

        {/* Scroll cue */}
        <div className="mt-16 animate-bounce text-white/40 text-sm">
          <svg className="mx-auto w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </section>
  )
}
