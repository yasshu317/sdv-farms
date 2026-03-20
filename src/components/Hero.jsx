import { Link } from 'react-scroll'
import { Phone } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { content } from '../data/content'

function PaddyField() {
  return (
    <svg
      viewBox="0 0 1440 160"
      preserveAspectRatio="none"
      className="w-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Paddy stalks silhouette */}
      {Array.from({ length: 48 }).map((_, i) => {
        const x = (i / 48) * 1440 + 10
        const h = 40 + Math.sin(i * 1.7) * 20 + Math.cos(i * 0.9) * 15
        const sway = Math.sin(i * 1.2) * 6
        return (
          <g key={i} opacity={0.18 + (i % 3) * 0.06}>
            <path
              d={`M${x},160 C${x + sway},${160 - h * 0.5} ${x + sway * 0.5},${160 - h * 0.8} ${x + sway * 0.3},${160 - h}`}
              stroke="#f6de55"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* grain head */}
            <ellipse
              cx={x + sway * 0.3}
              cy={160 - h - 5}
              rx="3"
              ry="7"
              fill="#f1c929"
              opacity="0.7"
            />
          </g>
        )
      })}
      {/* Wave transition to cream */}
      <path
        d="M0,120 C200,80 400,145 600,110 C800,75 1000,140 1200,100 C1300,82 1380,110 1440,95 L1440,160 L0,160 Z"
        fill="#fdf8f0"
      />
    </svg>
  )
}

function MangoLeafBorder() {
  return (
    <svg
      viewBox="0 0 40 200"
      className="absolute left-0 top-24 h-48 opacity-20"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {[0, 1, 2, 3, 4].map(i => (
        <g key={i} transform={`translate(0, ${i * 38})`}>
          <path
            d="M20,0 Q35,8 30,18 Q25,28 20,20 Q15,28 10,18 Q5,8 20,0Z"
            fill="#54a459"
            opacity="0.8"
          />
          <line x1="20" y1="4" x2="20" y2="18" stroke="#84c188" strokeWidth="0.8" />
        </g>
      ))}
    </svg>
  )
}

export default function Hero() {
  const { lang } = useLang()
  const t = content[lang].hero

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Sunrise-over-paddy-fields gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 75% 0%, rgba(212,160,23,0.45) 0%, transparent 55%), ' +
            'radial-gradient(ellipse 60% 70% at 0% 100%, rgba(7,23,9,0.9) 0%, transparent 60%), ' +
            'linear-gradient(160deg, #071709 0%, #0e2c13 25%, #1a4520 55%, #286d2f 80%, #378a3d 100%)',
        }}
      />

      {/* Subtle dot grid overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(241,201,41,0.3) 1px, transparent 1px)",
          backgroundSize: '40px 40px',
        }}
      />

      {/* Mango leaf decorative borders */}
      <MangoLeafBorder />
      <svg
        viewBox="0 0 40 200"
        className="absolute right-0 top-24 h-48 opacity-20 scale-x-[-1]"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {[0, 1, 2, 3, 4].map(i => (
          <g key={i} transform={`translate(0, ${i * 38})`}>
            <path d="M20,0 Q35,8 30,18 Q25,28 20,20 Q15,28 10,18 Q5,8 20,0Z" fill="#54a459" opacity="0.8" />
            <line x1="20" y1="4" x2="20" y2="18" stroke="#84c188" strokeWidth="0.8" />
          </g>
        ))}
      </svg>

      {/* Marigold glow top-right */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-marigold-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto pt-20">
        {/* Badge */}
        <span className="inline-flex items-center gap-2 bg-turmeric-500/20 border border-turmeric-400/40 text-turmeric-200 text-xs sm:text-sm font-semibold px-5 py-2 rounded-full mb-8 tracking-wide">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {t.badge}
        </span>

        {/* Title */}
        <h1 className="font-display text-6xl sm:text-8xl font-bold text-white mb-1 tracking-tight leading-none">
          {t.title}
        </h1>
        <p className="text-turmeric-400 text-lg sm:text-xl font-semibold mb-2 tracking-widest uppercase">
          ✦ {t.phase} ✦
        </p>

        {/* Ornamental divider */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-turmeric-400/60" />
          <svg className="w-5 h-5 text-turmeric-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 2a6 6 0 110 12A6 6 0 0110 4z" opacity="0.4"/>
            <path d="M10 6a4 4 0 100 8 4 4 0 000-8z" opacity="0.6"/>
            <circle cx="10" cy="10" r="2" />
          </svg>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-turmeric-400/60" />
        </div>

        {/* Tagline */}
        <p className={`text-white/75 text-base sm:text-lg mb-4 font-medium ${lang === 'te' ? 'telugu' : ''}`}>
          {t.tagline}
        </p>

        {/* Description */}
        <p className={`text-white/50 text-sm sm:text-base max-w-2xl mx-auto mb-10 leading-relaxed ${lang === 'te' ? 'telugu' : ''}`}>
          {t.description}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="contact"
            smooth
            duration={600}
            offset={-64}
            className={`btn-gold shadow-turmeric-500/30 ${lang === 'te' ? 'telugu' : ''}`}
          >
            🌾 {t.ctaVisit}
          </Link>
          <a
            href={`tel:${t.phone}`}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold py-3 px-8 rounded-full transition-all duration-200 backdrop-blur-sm"
          >
            <Phone size={17} />
            {t.ctaCall}: {t.phone}
          </a>
        </div>

        {/* Scroll cue */}
        <div className="mt-14 flex flex-col items-center gap-1 text-white/30 text-xs">
          <span>scroll</span>
          <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Paddy field wave at bottom */}
      <div className="wave-bottom">
        <PaddyField />
      </div>
    </section>
  )
}
