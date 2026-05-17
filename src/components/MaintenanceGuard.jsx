'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase'
import { isAdminOrStaff } from '../lib/roles'

/**
 * Wraps the whole app. When the `maintenance_mode` flag is ON:
 *  - Regular visitors → see the full-screen maintenance page
 *  - Admin / staff     → see a dismissible banner but can still use the site
 */
export default function MaintenanceGuard({ children }) {
  // Start optimistically showing the site — only switch if maintenance is confirmed ON
  const [state, setState] = useState('live') // 'live' | 'maintenance' | 'admin-banner'
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      // 1. Check the flag
      let maintenanceOn = false
      try {
        const res = await fetch('/api/feature-flags')
        const json = res.ok ? await res.json() : null
        maintenanceOn = !!json?.flags?.maintenance_mode?.enabled
      } catch {
        // flag fetch failed → treat as live
      }

      if (cancelled) return
      if (!maintenanceOn) { setState('live'); return }

      // 2. Flag is on — check if user is admin/staff
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const role = user?.user_metadata?.role
        setState(isAdminOrStaff(role) ? 'admin-banner' : 'maintenance')
      } catch {
        setState('maintenance')
      }
    })()
    return () => { cancelled = true }
  }, [])

  if (state === 'maintenance') {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
        style={{ background: 'linear-gradient(160deg, #071709 0%, #0e2c13 50%, #071709 100%)' }}
      >
        <div className="text-6xl mb-6 animate-pulse">🌾</div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">
          We'll be back soon
        </h1>
        <p className="text-white/50 text-base max-w-sm mb-2">
          SDV Farms is currently undergoing scheduled maintenance.
        </p>
        <p className="text-white/30 text-sm max-w-xs">
          Thank you for your patience. Please check back in a little while.
        </p>
        <div className="mt-10 flex items-center gap-3 text-white/20 text-xs">
          <span>SDV Farms</span>
          <span>·</span>
          <a href="tel:7780312525" className="hover:text-white/40 transition-colors">7780312525</a>
        </div>
      </div>
    )
  }

  return (
    <>
      {state === 'admin-banner' && !dismissed && (
        <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-between gap-3 bg-amber-500 px-4 py-2 text-sm font-semibold text-amber-950 shadow-lg">
          <span>⚠️ Maintenance mode is ON — only you (admin/staff) can see the site right now.</span>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 rounded-full bg-amber-950/15 hover:bg-amber-950/25 px-3 py-0.5 text-xs transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}
      <div className={state === 'admin-banner' && !dismissed ? 'pt-9' : ''}>
        {children}
      </div>
    </>
  )
}
