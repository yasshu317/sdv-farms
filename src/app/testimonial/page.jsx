'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import SiteHeader from '../../components/SiteHeader'
import { createBrowserClient } from '@supabase/ssr'

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(value === n ? 0 : n)}
          className="text-3xl transition-transform hover:scale-110 leading-none"
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <span className={n <= (hovered || value) ? 'text-turmeric-400' : 'text-white/20'}>★</span>
        </button>
      ))}
    </div>
  )
}

export default function ShareTestimonialPage() {
  const router = useRouter()
  const [user, setUser]           = useState(undefined)
  const [form, setForm]           = useState({ name: '', role: '', location: '', message: '', rating: 0 })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone]           = useState(false)
  const [error, setError]         = useState('')

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    )
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null))
  }, [])

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.name.trim())    return setError('Please enter your name.')
    if (!form.message.trim()) return setError('Please share a few words about your experience.')

    setSubmitting(true)
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (user === undefined) {
    return (
      <>
        <SiteHeader />
        <div className="min-h-screen bg-paddy-950 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-turmeric-400/40 border-t-turmeric-400 rounded-full animate-spin" />
        </div>
      </>
    )
  }

  if (user === null) {
    return (
      <>
        <SiteHeader />
        <div className="min-h-screen bg-paddy-950 flex items-center justify-center px-4">
          <div className="max-w-sm w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h1 className="font-display text-xl text-white mb-2">Sign in to share</h1>
            <p className="text-white/50 text-sm mb-6">
              Only verified buyers and sellers can submit a testimonial.
            </p>
            <Link
              href={`/auth/login?next=/testimonial`}
              className="block w-full bg-turmeric-500 hover:bg-turmeric-400 text-paddy-950 font-semibold text-sm py-3 rounded-xl transition-colors"
            >
              Sign in
            </Link>
            <Link href="/" className="block mt-3 text-white/40 hover:text-white/70 text-sm transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </>
    )
  }

  if (done) {
    return (
      <>
        <SiteHeader />
        <div className="min-h-screen bg-paddy-950 flex items-center justify-center px-4">
          <div className="max-w-sm w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">🙏</div>
            <h1 className="font-display text-2xl text-white mb-2">Thank you!</h1>
            <p className="text-white/50 text-sm mb-6">
              Your experience has been submitted. Our team will review it shortly and publish it on the homepage.
            </p>
            <Link
              href="/"
              className="block w-full bg-turmeric-500 hover:bg-turmeric-400 text-paddy-950 font-semibold text-sm py-3 rounded-xl transition-colors"
            >
              Back to home
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen bg-paddy-950 py-12 px-4">
        <div className="max-w-lg mx-auto">

          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="text-turmeric-400 hover:text-turmeric-300 text-sm flex items-center gap-1.5 mb-6 w-fit">
              ← Back to home
            </Link>
            <p className="text-turmeric-400 text-xs font-semibold uppercase tracking-widest mb-2">Share your story</p>
            <h1 className="font-display text-3xl font-bold text-white mb-2">How was your experience?</h1>
            <p className="text-white/50 text-sm">
              Your feedback helps others trust SDV Farms. We'll review your submission before publishing it.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div>
              <label className="block text-sm text-white/70 mb-1.5">
                Your name <span className="text-turmeric-400">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                maxLength={80}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-turmeric-400/50 transition-colors"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm text-white/70 mb-1.5">Your role / profession <span className="text-white/30 text-xs">(optional)</span></label>
              <input
                type="text"
                value={form.role}
                onChange={e => set('role', e.target.value)}
                placeholder="e.g. Farmer, Investor, Business Owner"
                maxLength={80}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-turmeric-400/50 transition-colors"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm text-white/70 mb-1.5">Location <span className="text-white/30 text-xs">(optional)</span></label>
              <input
                type="text"
                value={form.location}
                onChange={e => set('location', e.target.value)}
                placeholder="e.g. Hyderabad, Andhra Pradesh"
                maxLength={80}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-turmeric-400/50 transition-colors"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm text-white/70 mb-2">Rating <span className="text-white/30 text-xs">(optional)</span></label>
              <StarRating value={form.rating} onChange={v => set('rating', v)} />
              {form.rating > 0 && (
                <p className="text-white/30 text-xs mt-1.5">
                  {['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'][form.rating]}
                </p>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm text-white/70 mb-1.5">
                Your experience <span className="text-turmeric-400">*</span>
              </label>
              <textarea
                value={form.message}
                onChange={e => set('message', e.target.value)}
                placeholder="Tell us about your experience working with SDV Farms…"
                rows={5}
                maxLength={600}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-turmeric-400/50 transition-colors resize-none"
              />
              <p className="text-white/25 text-xs mt-1 text-right">{form.message.length}/600</p>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-turmeric-500 hover:bg-turmeric-400 disabled:opacity-50 text-paddy-950 font-semibold text-sm py-3.5 rounded-xl transition-colors"
            >
              {submitting ? 'Submitting…' : 'Submit my experience'}
            </button>

            <p className="text-white/25 text-xs text-center">
              Submissions are reviewed before appearing on the homepage.
            </p>
          </form>
        </div>
      </div>
    </>
  )
}
