'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useLang } from '../context/LanguageContext'
import Image from 'next/image'

function StarRow({ rating }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1,2,3,4,5].map(n => (
        <span key={n} className={n <= rating ? 'text-turmeric-400' : 'text-white/15'} aria-hidden>★</span>
      ))}
    </div>
  )
}

function TestimonialCard({ item }) {
  const initials = item.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="flex-shrink-0 w-80 bg-white/6 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 snap-start">
      <div className="text-turmeric-400/50 text-4xl leading-none font-serif">&ldquo;</div>
      <p className="text-white/80 text-sm leading-relaxed flex-1 -mt-3">{item.message}</p>
      {item.rating > 0 && <StarRow rating={item.rating} />}
      <div className="flex items-center gap-3 pt-2 border-t border-white/8">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-turmeric-500/20 border border-turmeric-400/25 flex items-center justify-center shrink-0">
          {item.avatar_url
            ? <Image src={item.avatar_url} alt={item.name} width={40} height={40} className="w-full h-full object-cover" />
            : <span className="text-turmeric-300 text-sm font-bold">{initials}</span>
          }
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-semibold leading-tight truncate">{item.name}</p>
          {(item.role || item.location) && (
            <p className="text-white/40 text-xs truncate">
              {[item.role, item.location].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function WinCard({ item }) {
  return (
    <div className="flex-shrink-0 w-52 bg-turmeric-500/10 border border-turmeric-400/20 rounded-2xl p-5 flex flex-col items-center text-center gap-2 snap-start justify-center">
      <span className="text-4xl leading-none">{item.win_icon || '🏆'}</span>
      {item.win_stat && <p className="text-turmeric-300 font-bold text-sm leading-snug">{item.win_stat}</p>}
      <p className="text-white/50 text-xs leading-relaxed">{item.message}</p>
    </div>
  )
}

export default function Testimonials() {
  const { lang } = useLang()
  const [items, setItems]         = useState([])
  const [avgRating, setAvgRating] = useState(null)
  const [ratingCount, setRatingCount] = useState(0)
  const [loaded, setLoaded]       = useState(false)
  const scrollRef = useRef(null)
  const [canLeft, setCanLeft]   = useState(false)
  const [canRight, setCanRight] = useState(true)

  useEffect(() => {
    fetch('/api/testimonials')
      .then(r => r.json())
      .then(d => {
        setItems(d.testimonials ?? [])
        setAvgRating(d.avgRating ?? null)
        setRatingCount(d.ratingCount ?? 0)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  function updateArrows() {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 8)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
  }

  function scroll(dir) {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' })
  }

  if (!loaded || items.length === 0) return null

  const testimonials = items.filter(i => i.type === 'testimonial')
  const wins         = items.filter(i => i.type === 'win')

  return (
    <section className="py-16 overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a1f0c 0%, #071709 100%)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Wins row */}
        {wins.length > 0 && (
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {wins.map(w => (
              <div key={w.id} className="flex items-center gap-2.5 bg-turmeric-500/10 border border-turmeric-400/20 rounded-full px-4 py-2">
                <span className="text-xl leading-none">{w.win_icon || '🏆'}</span>
                <span className="text-turmeric-200 text-sm font-semibold">{w.win_stat || w.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Header */}
        {testimonials.length > 0 && (
          <>
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <p className="text-turmeric-400 text-xs font-semibold uppercase tracking-widest mb-2">
                  {lang === 'te' ? 'వినియోగదారుల అభిప్రాయాలు' : 'What our customers say'}
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
                  {lang === 'te' ? 'విశ్వాసం మాకు మూలధనం' : 'Trusted by investors across India'}
                </h2>
                {avgRating !== null && ratingCount > 0 && (
                  <div className="flex items-center gap-2.5">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => {
                        const fill = Math.min(1, Math.max(0, avgRating - (n - 1)))
                        if (fill >= 1) return <span key={n} className="text-turmeric-400 text-base leading-none">★</span>
                        if (fill > 0) return (
                          <span key={n} className="relative text-base leading-none inline-block">
                            <span className="text-white/15">★</span>
                            <span
                              className="absolute inset-0 text-turmeric-400 overflow-hidden"
                              style={{ width: `${fill * 100}%` }}
                            >★</span>
                          </span>
                        )
                        return <span key={n} className="text-white/15 text-base leading-none">★</span>
                      })}
                    </div>
                    <span className="text-turmeric-300 font-bold text-sm">{avgRating}</span>
                    <span className="text-white/35 text-xs">
                      {lang === 'te'
                        ? `${ratingCount} రేటింగ్‌లు ఆధారంగా`
                        : `based on ${ratingCount} rating${ratingCount !== 1 ? 's' : ''}`}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => scroll(-1)}
                  disabled={!canLeft}
                  aria-label="Scroll left"
                  className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/60 hover:bg-white/10 disabled:opacity-25 transition-colors"
                >
                  ‹
                </button>
                <button
                  onClick={() => scroll(1)}
                  disabled={!canRight}
                  aria-label="Scroll right"
                  className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/60 hover:bg-white/10 disabled:opacity-25 transition-colors"
                >
                  ›
                </button>
              </div>
            </div>

            {/* Carousel */}
            <div
              ref={scrollRef}
              onScroll={updateArrows}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {testimonials.map(item => (
                <TestimonialCard key={item.id} item={item} />
              ))}
            </div>

            {/* CTA */}
            <div className="mt-10 text-center">
              <Link
                href="/testimonial"
                className="inline-flex items-center gap-2 border border-turmeric-400/30 hover:border-turmeric-400/70 text-turmeric-300 hover:text-turmeric-200 text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
              >
                ✍️ {lang === 'te' ? 'మీ అనుభవం పంచుకోండి' : 'Share your experience'}
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
