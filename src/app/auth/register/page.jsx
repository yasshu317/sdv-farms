'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm]       = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 6)       { setError('Password must be at least 6 characters'); return }

    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.name, phone: form.phone, role: 'buyer' },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'linear-gradient(160deg, #071709 0%, #1a4520 60%, #286d2f 100%)' }}>
        <div className="w-full max-w-md text-center">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-white font-display text-2xl font-bold mb-3">Check your email</h2>
          <p className="text-white/60 mb-6">
            We sent a confirmation link to <strong className="text-turmeric-300">{form.email}</strong>.
            Click it to activate your account.
          </p>
          <Link href="/auth/login" className="text-turmeric-400 hover:text-turmeric-300 text-sm font-medium">
            Back to login →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(160deg, #071709 0%, #1a4520 60%, #286d2f 100%)' }}>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white hover:text-turmeric-300 transition-colors">
            <span className="text-3xl">🌾</span>
            <span className="font-display text-2xl font-bold">SDV Farms</span>
          </Link>
          <p className="text-white/50 text-sm mt-2">Create your buyer account</p>
        </div>

        <div className="bg-white/8 backdrop-blur-sm border border-white/15 rounded-3xl p-8">
          <h1 className="text-white font-display text-2xl font-bold mb-6">Register</h1>

          {error && (
            <div className="bg-red-500/15 border border-red-400/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm mb-1.5">Full name</label>
              <input
                type="text" required value={form.name} onChange={set('name')}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/35 focus:outline-none focus:border-turmeric-400 transition-colors text-sm"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1.5">Email address</label>
              <input
                type="email" required value={form.email} onChange={set('email')}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/35 focus:outline-none focus:border-turmeric-400 transition-colors text-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1.5">Phone number</label>
              <input
                type="tel" required value={form.phone} onChange={set('phone')}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/35 focus:outline-none focus:border-turmeric-400 transition-colors text-sm"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1.5">Password</label>
              <input
                type="password" required value={form.password} onChange={set('password')}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/35 focus:outline-none focus:border-turmeric-400 transition-colors text-sm"
                placeholder="Min. 6 characters"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1.5">Confirm password</label>
              <input
                type="password" required value={form.confirm} onChange={set('confirm')}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/35 focus:outline-none focus:border-turmeric-400 transition-colors text-sm"
                placeholder="Repeat password"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-turmeric-500 hover:bg-turmeric-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors mt-2"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-white/50 text-sm text-center mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-turmeric-400 hover:text-turmeric-300 font-medium">
              Sign in
            </Link>
          </p>
          <p className="text-center mt-3">
            <Link href="/" className="text-white/35 hover:text-white/60 text-xs transition-colors">
              ← Back to SDV Farms
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
