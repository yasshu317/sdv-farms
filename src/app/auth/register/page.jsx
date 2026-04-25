'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

const DISALLOWED_LAND_TYPES = [
  'Government land', 'Poramboke', 'Assigned land', 'Forest land',
  'Ceiling land', 'Inam land', 'Civil Dispute land',
]

function RoleCard({ role, icon, title, description, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
        selected
          ? 'border-turmeric-400 bg-turmeric-500/10'
          : 'border-white/15 bg-white/5 hover:border-white/30'
      }`}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-white font-semibold text-sm">{title}</div>
      <div className="text-white/50 text-xs mt-0.5">{description}</div>
    </button>
  )
}

export default function RegisterPage() {
  const router = useRouter()

  // Step 0 = role choice, Step 1 = eligibility (seller only), Step 2 = form
  const [step, setStep]           = useState(0)
  const [role, setRole]           = useState('')           // buyer | seller
  const [sellerType, setSellerType] = useState('')         // farmer | agent
  const [eligLandType, setEligLandType] = useState('')
  const [eligBlocked, setEligBlocked]   = useState(false)

  const [form, setForm]       = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  function handleRoleNext() {
    if (!role) { setError('Please choose how you want to use SDV Farms'); return }
    setError('')
    if (role === 'seller') { setStep(1); return }
    setStep(2)
  }

  function handleEligNext() {
    if (!eligLandType) { setError('Please select your land type'); return }
    setError('')
    if (DISALLOWED_LAND_TYPES.includes(eligLandType)) {
      setEligBlocked(true)
      return
    }
    if (!sellerType) { setError('Please select Farmer or Agent'); return }
    setStep(2)
  }

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
        data: {
          full_name: form.name,
          phone: form.phone,
          role,
          seller_type: role === 'seller' ? sellerType : null,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setSuccess(true)
  }

  const bg = 'linear-gradient(160deg, #071709 0%, #1a4520 60%, #286d2f 100%)'

  // ── Success ──
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: bg }}>
        <div className="w-full max-w-md text-center">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-white font-display text-2xl font-bold mb-3">Check your email</h2>
          <p className="text-white/60 mb-2">
            We sent a confirmation link to <strong className="text-turmeric-300">{form.email}</strong>.
          </p>
          <p className="text-white/40 text-sm mb-6">Click it to activate your account, then sign in.</p>
          <Link href="/auth/login" className="text-turmeric-400 hover:text-turmeric-300 text-sm font-medium">
            Back to login →
          </Link>
        </div>
      </div>
    )
  }

  // ── Eligibility blocked ──
  if (eligBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: bg }}>
        <div className="w-full max-w-md text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-white font-display text-2xl font-bold mb-3">Land Not Eligible</h2>
          <p className="text-white/60 mb-2">
            Unfortunately <strong className="text-turmeric-300">{eligLandType}</strong> cannot be listed on SDV Farms.
          </p>
          <p className="text-white/40 text-sm mb-6">
            Government, Forest, Poramboke, Ceiling, Inam and Civil Dispute lands are not permitted.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setEligBlocked(false); setEligLandType(''); setStep(1) }}
              className="bg-turmeric-500 hover:bg-turmeric-600 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Try a Different Land Type
            </button>
            <Link href="/#contact" className="text-white/50 hover:text-white/70 text-sm transition-colors">
              Contact SDV Farms for guidance →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: bg }}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            title="Home"
            aria-label="SDV Farms — Home"
            className="inline-flex items-center gap-2 text-white hover:text-turmeric-300 transition-colors rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-turmeric-400/60"
          >
            <span className="text-3xl" aria-hidden>🌾</span>
            <span className="font-display text-2xl font-bold">SDV Farms</span>
          </Link>
          <p className="text-white/50 text-sm mt-2">
            {step === 0 ? 'How would you like to use SDV Farms?' :
             step === 1 ? 'Quick eligibility check' :
             `Create your ${role === 'seller' ? 'seller' : 'buyer'} account`}
          </p>
        </div>

        <div className="bg-white/8 backdrop-blur-sm border border-white/15 rounded-3xl p-8">

          {error && (
            <div className="bg-red-500/15 border border-red-400/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-5">
              {error}
            </div>
          )}

          {/* ── Step 0: Role choice ── */}
          {step === 0 && (
            <div>
              <h1 className="text-white font-display text-xl font-bold mb-5">I want to…</h1>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <RoleCard
                  role="buyer" icon="🏡" title="Buy Land"
                  description="Browse and invest in agricultural land"
                  selected={role === 'buyer'} onClick={() => setRole('buyer')}
                />
                <RoleCard
                  role="seller" icon="🌾" title="Sell Land"
                  description="List my agricultural property for sale"
                  selected={role === 'seller'} onClick={() => setRole('seller')}
                />
              </div>
              <button
                type="button" onClick={handleRoleNext}
                className="w-full bg-turmeric-500 hover:bg-turmeric-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Continue →
              </button>
            </div>
          )}

          {/* ── Step 1: Eligibility (seller only) ── */}
          {step === 1 && (
            <div>
              <h1 className="text-white font-display text-xl font-bold mb-2">Eligibility Check</h1>
              <p className="text-white/50 text-sm mb-5">Let's make sure your land qualifies before we proceed.</p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-white/70 text-sm mb-1.5">What type of land do you want to sell?</label>
                  <select
                    value={eligLandType}
                    onChange={e => setEligLandType(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-turmeric-400 transition-colors text-sm"
                  >
                    <option value="" className="bg-gray-800">Select land type…</option>
                    <optgroup label="✅ Eligible" className="bg-gray-800">
                      <option value="Agriculture">Agriculture</option>
                      <option value="Estate Agriculture">Estate Agriculture</option>
                    </optgroup>
                    <optgroup label="❌ Not eligible" className="bg-gray-800">
                      {DISALLOWED_LAND_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-1.5">Are you the farmer or an agent?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['farmer', 'agent'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSellerType(t)}
                        className={`py-3 rounded-xl border-2 text-sm font-medium transition-all capitalize ${
                          sellerType === t
                            ? 'border-turmeric-400 bg-turmeric-500/10 text-white'
                            : 'border-white/15 text-white/60 hover:border-white/30'
                        }`}
                      >
                        {t === 'farmer' ? '👨‍🌾 Farmer' : '🤝 Agent'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button" onClick={() => { setStep(0); setError('') }}
                  className="flex-1 bg-white/10 hover:bg-white/15 text-white font-medium py-3 rounded-xl transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button" onClick={handleEligNext}
                  className="flex-1 bg-turmeric-500 hover:bg-turmeric-600 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Registration form ── */}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-2 mb-5">
                <span className="text-lg">{role === 'seller' ? '🌾' : '🏡'}</span>
                <h1 className="text-white font-display text-xl font-bold">
                  {role === 'seller' ? `Register as ${sellerType}` : 'Create buyer account'}
                </h1>
              </div>

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

                <div className="flex gap-3 pt-1">
                  <button
                    type="button" onClick={() => { setStep(role === 'seller' ? 1 : 0); setError('') }}
                    className="flex-1 bg-white/10 hover:bg-white/15 text-white font-medium py-3 rounded-xl transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit" disabled={loading}
                    className="flex-1 bg-turmeric-500 hover:bg-turmeric-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
                  >
                    {loading ? 'Creating…' : 'Create account'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <p className="text-white/50 text-sm text-center mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-turmeric-400 hover:text-turmeric-300 font-medium">Sign in</Link>
          </p>
          <p className="text-center mt-3">
            <Link href="/" className="text-white/35 hover:text-white/60 text-xs transition-colors">← Back to SDV Farms</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
