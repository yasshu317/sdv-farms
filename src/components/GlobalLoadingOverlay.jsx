'use client'

import { useEffect, useState } from 'react'

/** Wait this long before showing — avoids flashes on fast requests */
const SHOW_AFTER_MS = 320
/** Brief delay before hiding so the UI doesn’t flicker */
const HIDE_AFTER_MS = 100

/**
 * When any in-flight `fetch` lasts longer than SHOW_AFTER_MS, shows the app icon
 * with a loading ring. Covers client navigations (RSC), API calls, and slow data loads.
 */
export default function GlobalLoadingOverlay() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const state = {
      inFlight: 0,
      showTimer: /** @type {ReturnType<typeof setTimeout> | null} */ (null),
      hideTimer: /** @type {ReturnType<typeof setTimeout> | null} */ (null),
    }

    const clearShow = () => {
      if (state.showTimer) {
        clearTimeout(state.showTimer)
        state.showTimer = null
      }
    }
    const clearHide = () => {
      if (state.hideTimer) {
        clearTimeout(state.hideTimer)
        state.hideTimer = null
      }
    }

    const scheduleShow = () => {
      clearShow()
      state.showTimer = setTimeout(() => setVisible(true), SHOW_AFTER_MS)
    }

    const scheduleHide = () => {
      clearHide()
      state.hideTimer = setTimeout(() => setVisible(false), HIDE_AFTER_MS)
    }

    const orig = window.fetch.bind(window)

    window.fetch = async (input, init) => {
      let url = ''
      try {
        if (typeof input === 'string') url = input
        else if (input instanceof URL) url = input.href
        else if (typeof Request !== 'undefined' && input instanceof Request) url = input.url
      } catch {
        url = ''
      }

      try {
        const u = new URL(url, window.location.origin)
        if (
          u.pathname === '/icon' ||
          u.pathname === '/apple-icon' ||
          u.pathname.startsWith('/_next/static/') ||
          u.pathname.startsWith('/_next/image')
        ) {
          return orig(input, init)
        }
      } catch {
        /* relative or opaque URL — still track */
      }

      state.inFlight += 1
      if (state.inFlight === 1) {
        clearHide()
        scheduleShow()
      }

      try {
        return await orig(input, init)
      } finally {
        state.inFlight = Math.max(0, state.inFlight - 1)
        if (state.inFlight === 0) {
          clearShow()
          scheduleHide()
        }
      }
    }

    return () => {
      window.fetch = orig
      clearShow()
      clearHide()
      setVisible(false)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-paddy-950/35 backdrop-blur-[2px] motion-reduce:backdrop-blur-none pointer-events-none"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="pointer-events-none flex flex-col items-center gap-4 rounded-2xl bg-white/95 px-8 py-7 shadow-xl border border-paddy-100/90">
        <div className="relative h-14 w-14">
          <div
            className="absolute inset-0 rounded-xl border-2 border-turmeric-500/30 border-t-turmeric-500 animate-spin motion-reduce:animate-none"
            style={{ animationDuration: '0.85s' }}
            aria-hidden
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- /icon is a dynamic route; Image not needed */}
          <img
            src="/icon"
            alt=""
            width={56}
            height={56}
            decoding="async"
            className="relative z-10 h-14 w-14 rounded-lg object-cover shadow-sm"
          />
        </div>
        <p className="text-sm font-medium text-paddy-800">Loading…</p>
      </div>
    </div>
  )
}
