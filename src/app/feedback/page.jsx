'use client'
import { useState } from 'react'
import Link from 'next/link'
import SiteHeader from '../../components/SiteHeader'

const FEEDBACK_TYPES = [
  { value: 'general',     label: 'General',     icon: '💬' },
  { value: 'suggestion',  label: 'Suggestion',  icon: '💡' },
  { value: 'complaint',   label: 'Complaint',   icon: '⚠️' },
  { value: 'partnership', label: 'Partnership', icon: '🤝' },
  { value: 'other',       label: 'Other',       icon: '📝' },
]

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(value === n ? 0 : n)}
          className="text-2xl transition-transform hover:scale-110 leading-none"
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <span className={n <= (hovered || value) ? 'text-turmeric-400' : 'text-white/20'}>★</span>
        </button>
      ))}
    </div>
  )
}

export default function FeedbackPage() {
  const [form, setForm] = useState({
    business_name: '',
    contact_name: '',
    email: '',
    phone: '',
    feedback_type: 'general',
    message: '',
    rating: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [success, setSuccess] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.business_name.trim() || !form.message.trim()) {
      setError('Business name and message are required.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, rating: form.rating || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const bg = 'linear-gradient(160deg, #071709 0%, #0e2c13 50%, #071709 100%)'
  const inputCls = 'w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-turmeric-400 transition-colors text-sm'
  const labelCls = 'block text-white/65 text-sm mb-1.5'

  if (success) {
    return (
      <div className="min-h-screen" style={{ background: bg }}>
        <SiteHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-5">🙏</div>
            <h2 className="font-display text-2xl font-bold text-white mb-3">Thank you!</h2>
            <p className="text-white/55 mb-2">
              Your feedback has been received by the SDV Farms team.
            </p>
            <p className="text-white/35 text-sm mb-8">
              We review every submission and will follow up if needed.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="inline-block bg-turmeric-500 hover:bg-turmeric-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
              >
                Back to Home
              </Link>
              <button
                onClick={() => {
                  setSuccess(false)
                  setForm({ business_name: '', contact_name: '', email: '', phone: '', feedback_type: 'general', message: '', rating: 0 })
                }}
                className="inline-block bg-white/10 hover:bg-white/15 border border-white/15 text-white font-medium px-6 py-2.5 rounded-xl transition-colors text-sm"
              >
                Submit another
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      <SiteHeader />

      {/* Hero */}
      <div className="border-b border-white/8 px-4 sm:px-6 py-10 text-center" style={{ background: 'linear-gradient(135deg, #0e2c13 0%, #1a4520 50%, #0e2c13 100%)' }}>
        <p className="text-white/40 text-xs mb-3">
          <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
          <span className="mx-1.5">·</span>
          <span className="text-white/55">Business Feedback</span>
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">
          Share Your Feedback
        </h1>
        <p className="text-white/50 text-sm max-w-md mx-auto">
          We value your input. Tell us how we can improve, share a suggestion, or explore a partnership with SDV Farms.
        </p>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Feedback type */}
          <div>
            <label className={labelCls}>Feedback Type</label>
            <div className="grid grid-cols-5 gap-2">
              {FEEDBACK_TYPES.map(ft => (
                <button
                  key={ft.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, feedback_type: ft.value }))}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    form.feedback_type === ft.value
                      ? 'border-turmeric-400 bg-turmeric-500/15 text-white'
                      : 'border-white/12 bg-white/4 text-white/50 hover:border-white/25 hover:text-white/80'
                  }`}
                >
                  <span className="text-lg leading-none">{ft.icon}</span>
                  <span>{ft.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Business name + contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Business Name *</label>
              <input
                type="text"
                value={form.business_name}
                onChange={set('business_name')}
                placeholder="Your business name"
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Your Name</label>
              <input
                type="text"
                value={form.contact_name}
                onChange={set('contact_name')}
                placeholder="Contact person"
                className={inputCls}
              />
            </div>
          </div>

          {/* Email + phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="your@email.com"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={set('phone')}
                placeholder="+91 98765 43210"
                className={inputCls}
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className={labelCls}>Overall Rating <span className="text-white/30">(optional)</span></label>
            <StarRating value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
            {form.rating > 0 && (
              <p className="text-white/35 text-xs mt-1.5">
                {['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'][form.rating]}
                <button type="button" onClick={() => setForm(f => ({ ...f, rating: 0 }))} className="ml-2 text-white/25 hover:text-white/50 transition-colors">
                  × clear
                </button>
              </p>
            )}
          </div>

          {/* Message */}
          <div>
            <label className={labelCls}>Message *</label>
            <textarea
              value={form.message}
              onChange={set('message')}
              required
              rows={5}
              placeholder="Tell us what's on your mind — the more detail the better."
              className={`${inputCls} resize-none`}
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-400/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-turmeric-500 hover:bg-turmeric-600 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
          >
            {loading ? 'Submitting…' : 'Submit Feedback'}
          </button>

          <p className="text-white/25 text-xs text-center">
            Your feedback goes directly to the SDV Farms team. We may follow up via email or phone if you have provided contact details.
          </p>
        </form>
      </div>
    </div>
  )
}
