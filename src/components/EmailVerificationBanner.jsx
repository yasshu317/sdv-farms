'use client'
import { useState } from 'react'
import { createClient } from '../lib/supabase'

export default function EmailVerificationBanner({ user }) {
  const [sent, setSent]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  if (!user || user.email_confirmed_at) return null

  async function resend() {
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      })
      if (err) throw err
      setSent(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
      <div className="flex items-start sm:items-center gap-2.5">
        <span className="text-amber-500 text-base mt-0.5 sm:mt-0">⚠️</span>
        <div>
          <p className="font-medium text-amber-800">Your email is not verified</p>
          <p className="text-amber-600 text-xs mt-0.5">
            Check your inbox at <strong>{user.email}</strong> for a verification link.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {sent ? (
          <span className="text-xs text-green-600 font-medium">✓ Email re-sent!</span>
        ) : (
          <>
            {error && <span className="text-xs text-red-500">{error}</span>}
            <button
              onClick={resend}
              disabled={loading}
              className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? 'Sending…' : 'Resend Email'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
