'use client'
import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'
import { homePathForRole } from '../../../lib/authRedirects'

const URL_ERROR_MESSAGES = {
  auth_callback_error: 'Email confirmation failed or link has expired. Please try signing in, or register again.',
  access_denied:       'Access was denied. Please sign in with an authorised account.',
}

const bg = 'linear-gradient(160deg, #071709 0%, #1a4520 60%, #286d2f 100%)'

// ── Inner form — uses useSearchParams so must sit inside <Suspense> ──────────
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    const urlError = searchParams.get('error')
    if (urlError) setError(URL_ERROR_MESSAGES[urlError] ?? 'Something went wrong. Please try again.')
  }, [searchParams])

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setLoading(false)
      setError(err.message)
      return
    }
    // Auth succeeded — show branded redirect overlay while Next.js navigates
    setRedirecting(true)
    const role = data.user?.user_metadata?.role
    router.push(homePathForRole(role))
    router.refresh()
  }

  // Full-screen branded overlay shown after successful auth during navigation
  if (redirecting) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 z-50"
           style={{ background: bg }}>
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <span className="text-6xl">🌾</span>
          <p className="text-white font-display text-xl font-bold">SDV Farms</p>
        </div>
        <div className="flex items-center gap-2 text-white/60 text-sm">
          <svg className="animate-spin w-4 h-4 text-turmeric-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Taking you to your dashboard…
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/8 backdrop-blur-sm border border-white/15 rounded-3xl p-8">
      <h1 className="text-white font-display text-2xl font-bold mb-6">Welcome back</h1>

      {error && (
        <div className="bg-red-500/15 border border-red-400/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-5">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-white/70 text-sm mb-1.5">Email address</label>
          <input
            type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/35 focus:outline-none focus:border-turmeric-400 transition-colors text-sm"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-white/70 text-sm mb-1.5">Password</label>
          <input
            type="password" required value={password} onChange={e => setPassword(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/35 focus:outline-none focus:border-turmeric-400 transition-colors text-sm"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full bg-turmeric-500 hover:bg-turmeric-600 disabled:opacity-70 text-white font-semibold py-3 rounded-xl transition-colors mt-2 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Signing in…
            </>
          ) : 'Sign in'}
        </button>
      </form>

      <p className="text-white/50 text-sm text-center mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/auth/register" className="text-turmeric-400 hover:text-turmeric-300 font-medium">
          Register here
        </Link>
      </p>
      <p className="text-center mt-3">
        <Link href="/" className="text-white/35 hover:text-white/60 text-xs transition-colors">
          ← Back to SDV Farms
        </Link>
      </p>
    </div>
  )
}

// ── Page — wraps LoginForm in Suspense so Next.js can prerender the shell ────
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: bg }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white hover:text-turmeric-300 transition-colors">
            <span className="text-3xl">🌾</span>
            <span className="font-display text-2xl font-bold">SDV Farms</span>
          </Link>
          <p className="text-white/50 text-sm mt-2">Sign in to your account</p>
        </div>

        <Suspense fallback={
          <div className="bg-white/8 border border-white/15 rounded-3xl p-8 text-center text-white/40 text-sm">
            Loading…
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
