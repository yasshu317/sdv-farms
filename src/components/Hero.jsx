'use client'
import { useState, useEffect } from 'react'
import { Link } from 'react-scroll'
import { Phone } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { content } from '../data/content'

// ─── Decoration data — ALL values pre-computed at module level ───────────────
const MANGO_DATA = [
  { pos: { left: '6%',  top: '20%' }, rotate: -15, scale: 0.9,  opacity: 0.16, dur: '6s',   delay: '0s',   size: 38 },
  { pos: { right: '9%', top: '17%' }, rotate:  20, scale: 1.0,  opacity: 0.14, dur: '7s',   delay: '1s',   size: 44 },
  { pos: { right: '6%', top: '54%' }, rotate: -25, scale: 0.75, opacity: 0.12, dur: '8s',   delay: '2s',   size: 34 },
  { pos: { left: '5%',  top: '60%' }, rotate:  30, scale: 0.85, opacity: 0.15, dur: '9s',   delay: '0.5s', size: 36 },
  { pos: { left: '17%', top: '12%' }, rotate:  -8, scale: 0.8,  opacity: 0.10, dur: '7.5s', delay: '3s',   size: 32 },
]
const BANANA_DATA = [
  { pos: { left: '11%',  top: '36%' }, rotate: -20, opacity: 0.13, dur: '9s',  delay: '1.5s', size: 32 },
  { pos: { right: '12%', top: '43%' }, rotate:  15, opacity: 0.11, dur: '10s', delay: '3.5s', size: 28 },
]
const COCONUT_DATA = [
  { pos: { right: '0%', top: '2%' }, flip: false, opacity: 0.12, dur: '12s', delay: '0s',  size: 72 },
  { pos: { left: '0%',  top: '4%' }, flip: true,  opacity: 0.10, dur: '14s', delay: '2s',  size: 62 },
]
const CART_DATA = [
  { pos: { right: '4%', top: '38%' }, opacity: 0.11, dur: '16s', delay: '1s', size: 185 },
]

// ─── Agricultural SVG sub-components ─────────────────────────────────────────
function MangoSVG({ size = 40 }) {
  return (
    <svg width={size} height={Math.round(size * 1.4)} viewBox="0 0 40 56" fill="none" aria-hidden="true">
      <path d="M20,52 C10,52 3,42 3,30 C3,14 10,4 20,4 C30,4 37,14 37,30 C37,42 30,52 20,52Z" fill="#f59e0b"/>
      <path d="M12,16 C13,13 16,10 20,10" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20,4 C17,-2 10,-6 7,-2 C10,4 16,4 20,4Z" fill="#16a34a"/>
      <line x1="20" y1="4" x2="22" y2="-1" stroke="#78350f" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function BananaBunchSVG({ size = 35 }) {
  return (
    <svg width={size} height={Math.round(size * 1.4)} viewBox="0 0 35 49" fill="none" aria-hidden="true">
      <path d="M17,4 C12,-4 4,-6 2,-2 C6,4 13,4 17,4Z" fill="#16a34a"/>
      <path d="M17,4 C10,6 5,14 8,20 C12,15 15,9 17,4Z" fill="#fbbf24"/>
      <path d="M17,4 C24,6 29,14 26,20 C22,15 19,9 17,4Z" fill="#f59e0b"/>
      <path d="M17,12 C10,14 5,22 8,28 C12,23 15,17 17,12Z" fill="#fbbf24"/>
      <path d="M17,12 C24,14 28,22 25,28 C21,23 18,17 17,12Z" fill="#f59e0b"/>
      <path d="M17,21 C10,23 6,31 9,37 C13,32 16,26 17,21Z" fill="#fbbf24"/>
      <path d="M17,21 C24,23 28,31 25,37 C21,32 18,26 17,21Z" fill="#f59e0b"/>
      <path d="M17,4 C17,4 19,10 20,16 C21,22 20,30 18,38" stroke="#78350f" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

function CoconutTreeSVG({ size = 80, flip = false }) {
  return (
    <svg
      width={size} height={Math.round(size * 2)}
      viewBox="0 0 80 160" fill="none"
      aria-hidden="true"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path d="M40,158 C38,132 35,106 37,82 C39,58 41,38 45,12" stroke="#92400e" strokeWidth="7" strokeLinecap="round"/>
      <path d="M45,12 C60,-8 78,-14 80,-4 C68,6 54,10 45,12Z" fill="#16a34a"/>
      <path d="M45,12 C28,-10 10,-15 6,-5 C18,6 33,10 45,12Z" fill="#16a34a"/>
      <path d="M45,12 C62,4 74,18 72,27 C60,20 52,16 45,12Z" fill="#22c55e"/>
      <path d="M45,12 C26,5 16,20 18,30 C30,22 39,16 45,12Z" fill="#22c55e"/>
      <path d="M45,12 C52,-6 60,-18 66,-14 C60,-4 53,4 45,12Z" fill="#15803d"/>
      <circle cx="43" cy="22" r="6" fill="#92400e"/>
      <circle cx="50" cy="18" r="5" fill="#a16207"/>
      <circle cx="38" cy="25" r="4" fill="#78350f"/>
    </svg>
  )
}

function BullockCartSVG({ size = 185 }) {
  return (
    <svg width={size} height={Math.round(size * 120 / 260)} viewBox="0 0 260 120" fill="none" aria-hidden="true">
      {/* Bullock body */}
      <ellipse cx="30" cy="65" rx="18" ry="11" fill="#d97706"/>
      {/* Head */}
      <path d="M14,60 Q5,50 9,46 Q18,55 24,60Z" fill="#d97706"/>
      {/* Horns */}
      <line x1="9" y1="48" x2="5" y2="38" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="14" y1="46" x2="14" y2="36" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Hump */}
      <path d="M34,54 Q40,46 46,54" stroke="#b45309" strokeWidth="2" fill="none"/>
      {/* Legs */}
      <line x1="17" y1="75" x2="15" y2="95" stroke="#92400e" strokeWidth="2" strokeLinecap="round"/>
      <line x1="23" y1="76" x2="22" y2="95" stroke="#92400e" strokeWidth="2" strokeLinecap="round"/>
      <line x1="35" y1="76" x2="34" y2="95" stroke="#92400e" strokeWidth="2" strokeLinecap="round"/>
      <line x1="43" y1="75" x2="42" y2="95" stroke="#92400e" strokeWidth="2" strokeLinecap="round"/>
      {/* Tail */}
      <path d="M48,65 Q57,55 55,44" stroke="#92400e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Yoke pole */}
      <line x1="48" y1="62" x2="80" y2="60" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round"/>
      {/* Left wheel */}
      <circle cx="90" cy="85" r="24" stroke="#d97706" strokeWidth="4" fill="rgba(217,119,6,0.08)"/>
      <line x1="90" y1="61" x2="90" y2="109" stroke="#d97706" strokeWidth="2"/>
      <line x1="66" y1="85" x2="114" y2="85" stroke="#d97706" strokeWidth="2"/>
      <line x1="73" y1="68" x2="107" y2="102" stroke="#d97706" strokeWidth="2"/>
      <line x1="107" y1="68" x2="73" y2="102" stroke="#d97706" strokeWidth="2"/>
      <circle cx="90" cy="85" r="4" fill="#d97706"/>
      {/* Right wheel */}
      <circle cx="180" cy="85" r="24" stroke="#d97706" strokeWidth="4" fill="rgba(217,119,6,0.08)"/>
      <line x1="180" y1="61" x2="180" y2="109" stroke="#d97706" strokeWidth="2"/>
      <line x1="156" y1="85" x2="204" y2="85" stroke="#d97706" strokeWidth="2"/>
      <line x1="163" y1="68" x2="197" y2="102" stroke="#d97706" strokeWidth="2"/>
      <line x1="197" y1="68" x2="163" y2="102" stroke="#d97706" strokeWidth="2"/>
      <circle cx="180" cy="85" r="4" fill="#d97706"/>
      {/* Cart body */}
      <path d="M84,61 L186,61 L190,28 L80,28 Z" fill="#92400e" opacity="0.9"/>
      <rect x="78" y="23" width="114" height="7" rx="2" fill="#78350f"/>
      {/* Cart decorative stripes */}
      <line x1="110" y1="28" x2="106" y2="61" stroke="rgba(255,200,50,0.3)" strokeWidth="1.5"/>
      <line x1="135" y1="28" x2="135" y2="61" stroke="rgba(255,200,50,0.3)" strokeWidth="1.5"/>
      <line x1="160" y1="28" x2="164" y2="61" stroke="rgba(255,200,50,0.3)" strokeWidth="1.5"/>
    </svg>
  )
}

function FloatingDecor() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {COCONUT_DATA.map((d, i) => (
        <div key={`coconut-${i}`} className="absolute"
          style={{ ...d.pos, opacity: d.opacity, animation: `agri-sway-tree ${d.dur} ease-in-out infinite ${d.delay}` }}>
          <CoconutTreeSVG size={d.size} flip={d.flip} />
        </div>
      ))}
      {MANGO_DATA.map((d, i) => (
        <div key={`mango-${i}`} className="absolute"
          style={{ ...d.pos, opacity: d.opacity, animation: `agri-float ${d.dur} ease-in-out infinite ${d.delay}` }}>
          <div style={{ transform: `rotate(${d.rotate}deg) scale(${d.scale})` }}>
            <MangoSVG size={d.size} />
          </div>
        </div>
      ))}
      {BANANA_DATA.map((d, i) => (
        <div key={`banana-${i}`} className="absolute"
          style={{ ...d.pos, opacity: d.opacity, animation: `agri-float ${d.dur} ease-in-out infinite ${d.delay}` }}>
          <div style={{ transform: `rotate(${d.rotate}deg)` }}>
            <BananaBunchSVG size={d.size} />
          </div>
        </div>
      ))}
      {CART_DATA.map((d, i) => (
        <div key={`cart-${i}`} className="absolute"
          style={{ ...d.pos, opacity: d.opacity, animation: `agri-drift ${d.dur} ease-in-out infinite ${d.delay}` }}>
          <BullockCartSVG size={d.size} />
        </div>
      ))}
    </div>
  )
}

// ─── Paddy stalks at bottom wave ─────────────────────────────────────────────
// Pre-computed at module level — same values on server and client
const STALKS = Array.from({ length: 48 }).map((_, i) => {
  const x    = Number(((i / 48) * 1440 + 10).toFixed(4))
  const h    = Number((40 + Math.sin(i * 1.7) * 20 + Math.cos(i * 0.9) * 15).toFixed(4))
  const sway = Number((Math.sin(i * 1.2) * 6).toFixed(4))
  return { x, h, sway, opacity: Number((0.18 + (i % 3) * 0.06).toFixed(2)) }
})

function PaddyField() {
  return (
    <svg
      viewBox="0 0 1440 160"
      preserveAspectRatio="none"
      className="w-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {STALKS.map(({ x, h, sway, opacity }, i) => (
        <g key={i} opacity={opacity}>
          <path
            d={`M${x},160 C${x + sway},${160 - h * 0.5} ${x + sway * 0.5},${160 - h * 0.8} ${x + sway * 0.3},${160 - h}`}
            stroke="#f6de55"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          <ellipse
            cx={x + sway * 0.3}
            cy={160 - h - 5}
            rx="3"
            ry="7"
            fill="#f1c929"
            opacity="0.7"
          />
        </g>
      ))}
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

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

      {/* Agricultural background decorations — client-only to avoid hydration mismatch */}
      {mounted && <FloatingDecor />}

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
