'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '../../lib/supabase'
import { LogOut, Home, MapPin, Phone } from 'lucide-react'
import EmailVerificationBanner from '../../components/EmailVerificationBanner'
import RoleRedirectBanner from '../../components/RoleRedirectBanner'
import { content } from '../../data/content'

const STATUS_BADGE = {
  pending:   { label: 'Pending',      color: 'bg-yellow-500/15 text-yellow-300 border-yellow-400/30' },
  contacted: { label: 'Contacted',    color: 'bg-blue-500/15   text-blue-300   border-blue-400/30'   },
  visited:   { label: 'Site Visited', color: 'bg-purple-500/15 text-purple-300 border-purple-400/30' },
  booked:    { label: 'Booked',       color: 'bg-green-500/15  text-green-300  border-green-400/30'  },
  closed:    { label: 'Closed',       color: 'bg-white/5       text-white/40   border-white/15'      },
}

function StatusBadge({ status }) {
  const s = STATUS_BADGE[status] ?? STATUS_BADGE.pending
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${s.color}`}>
      {s.label}
    </span>
  )
}

const LAND_REQ_STATUS = {
  open:    { label: 'Open',    color: 'bg-yellow-500/15 text-yellow-300 border-yellow-400/30' },
  matched: { label: 'Matched', color: 'bg-green-500/15  text-green-300  border-green-400/30'  },
  closed:  { label: 'Closed',  color: 'bg-white/5       text-white/40   border-white/15'      },
}

function LandRequestBadge({ status }) {
  const s = LAND_REQ_STATUS[status] ?? LAND_REQ_STATUS.open
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${s.color}`}>
      {s.label}
    </span>
  )
}

export default function DashboardClient({ user, enquiries, interests, landRequests = [], landShortlist: landShortlistInitial = [], initialTab = 'overview' }) {
  const router = useRouter()
  const cta = content.en.cta
  const [tab, setTab] = useState(initialTab)
  const [landShortlist, setLandShortlist] = useState(landShortlistInitial)

  useEffect(() => { setTab(initialTab) }, [initialTab])

  useEffect(() => { setLandShortlist(landShortlistInitial) }, [landShortlistInitial])

  async function removeLandShortlistItem(wishlistRowId) {
    const supabase = createClient()
    const { error } = await supabase.from('buyer_wishlist').delete().eq('id', wishlistRowId).eq('buyer_id', user.id)
    if (error) {
      alert('Could not remove from shortlist. Please try again.')
      return
    }
    setLandShortlist(prev => prev.filter(row => row.wishlistRowId !== wishlistRowId))
    router.refresh()
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const name = user.full_name || user.email?.split('@')[0] || 'Buyer'
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #071709 0%, #0a1f0c 40%, #0d2510 100%)' }}>

      {/* ── Header ── */}
      <div className="border-b border-white/8 px-4 sm:px-6 py-4 sticky top-0 z-30 bg-paddy-950/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl" title="SDV Farms Home">🌾</Link>
            <div>
              <p className="text-white font-semibold text-sm">{name}</p>
              <span className="text-xs bg-green-500/20 text-green-300 border border-green-400/30 rounded-full px-2 py-0.5 font-semibold">
                🏡 Buyer
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/properties" className="hidden sm:inline-flex items-center gap-1.5 text-white/60 hover:text-turmeric-300 text-sm transition-colors">
              🔍 Browse Land
            </Link>
            <button onClick={handleLogout} className="text-white/40 hover:text-red-400 text-xs transition-colors flex items-center gap-1">
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
        <RoleRedirectBanner />
        <EmailVerificationBanner user={user} />
        {user?.role === 'seller' && (
          <div className="flex items-center justify-between gap-3 bg-turmeric-500/10 border border-turmeric-400/25 rounded-xl px-4 py-3 mt-3">
            <p className="text-turmeric-200 text-sm">
              You&apos;re browsing as a <strong>buyer</strong> — enquiries and land requests submitted here are tracked separately from your listings.
            </p>
            <Link href="/seller" className="shrink-0 text-xs font-semibold text-turmeric-300 hover:text-turmeric-200 border border-turmeric-400/30 rounded-full px-3 py-1 transition-colors">
              My Listings →
            </Link>
          </div>
        )}
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Welcome back, {name.split(' ')[0]}! 👋
          </h1>
          <p className="text-white/45 text-sm mt-1">
            Browse saved farmland on <strong className="text-white/55 font-medium">Land shortlist</strong>
            {' · '}track enquiries · Phase&nbsp;1 <strong className="text-white/55 font-medium">Plot interests</strong>
            {' · '}land requests.
          </p>
        </div>

        {/* Summary cards — match homepage/seller stat style */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {[
            { emoji: '📋', label: 'Enquiries',     value: enquiries.length,                                                              color: 'text-turmeric-400' },
            { emoji: '📍', label: 'Plot Interests', value: interests.length,                                                              color: 'text-paddy-300'   },
            { emoji: '📌', label: cta.shortlistOverviewCard, value: landShortlist.length,                                           color: 'text-rose-200' },
            { emoji: '✅', label: 'Contacted',      value: enquiries.filter(e => e.status === 'contacted' || e.status === 'visited').length, color: 'text-green-300'  },
            { emoji: '🕐', label: 'Pending',        value: enquiries.filter(e => e.status === 'pending').length,                          color: 'text-yellow-300'  },
          ].map(card => (
            <div key={card.label} className="bg-white/4 border border-white/8 rounded-2xl py-5 px-3 text-center">
              <p className="text-xl mb-1">{card.emoji}</p>
              <p className={`font-display font-bold text-3xl ${card.color}`}>{card.value}</p>
              <p className="text-white/50 text-xs mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs with icons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'overview',       icon: '🏠', label: 'Overview'       },
            { id: 'enquiries',      icon: '📋', label: 'Enquiries',     count: enquiries.length     },
            { id: 'interests',      icon: '📍', label: 'Plot Interests', count: interests.length     },
            { id: 'land-shortlist', icon: '📌', label: cta.shortlistDashboardTab, count: landShortlist.length },
            { id: 'land-requests',  icon: '🗺️', label: 'Land Requests',  count: landRequests.length  },
          ].map(t => (
            <button
              key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                tab === t.id
                  ? 'bg-white/15 border-white/25 text-white shadow-sm'
                  : 'bg-white/5 border-white/10 text-white/50 hover:text-white/75 hover:bg-white/8'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {t.count > 0 && (
                <span className={`text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center ${
                  tab === t.id ? 'bg-turmeric-500/30 text-turmeric-300' : 'bg-white/10 text-white/40'
                }`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Overview tab ── */}
        {tab === 'overview' && (
          <div className="grid sm:grid-cols-2 gap-5">
            {/* Account info */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="font-semibold text-white mb-4">Account Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-white/45">Name</span><span className="font-medium text-white/90">{name}</span></div>
                <div className="flex justify-between"><span className="text-white/45">Email</span><span className="font-medium text-white/90 truncate ml-4">{user.email?.toLowerCase()}</span></div>
                {user.phone && <div className="flex justify-between"><span className="text-white/45">Phone</span><span className="font-medium text-white/90">{user.phone}</span></div>}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="font-semibold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <a href="tel:7780312525" className="flex items-center gap-3 p-3 rounded-xl bg-paddy-700/40 hover:bg-paddy-700/60 border border-paddy-500/20 transition-colors">
                  <Phone size={16} className="text-paddy-300" />
                  <div>
                    <p className="text-sm font-medium text-white">Call us now</p>
                    <p className="text-xs text-white/50">7780312525</p>
                  </div>
                </a>
                <Link href="/properties" className="flex items-center gap-3 p-3 rounded-xl bg-turmeric-500/15 hover:bg-turmeric-500/25 border border-turmeric-400/20 transition-colors">
                  <Home size={16} className="text-turmeric-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Browse &amp; book a site visit</p>
                    <p className="text-xs text-white/50">Pick a listing → book from its page</p>
                  </div>
                </Link>
                <Link href="/dashboard?tab=land-shortlist" className="flex items-center gap-3 p-3 rounded-xl bg-rose-500/12 hover:bg-rose-500/20 border border-rose-400/25 transition-colors">
                  <span className="text-lg shrink-0" aria-hidden>📌</span>
                  <div>
                    <p className="text-sm font-medium text-white">{cta.shortlistOverviewCard}</p>
                    <p className="text-xs text-white/50">{cta.shortlistCompareHint}</p>
                  </div>
                </Link>
                <Link href="/buyer-request" className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-400/20 transition-colors">
                  <MapPin size={16} className="text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Post a land request</p>
                    <p className="text-xs text-white/50">Tell us what you&apos;re looking for</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Journey status */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:col-span-2">
              <h2 className="font-semibold text-white mb-5">Your Journey</h2>
              <div className="flex items-center">
                {[
                  { step: 1, label: 'Registered',  done: true },
                  { step: 2, label: 'Enquired',     done: enquiries.length > 0 },
                  { step: 3, label: 'Site Visit',   done: enquiries.some(e => ['visited','booked'].includes(e.status)) },
                  { step: 4, label: 'Plot Booked',  done: enquiries.some(e => e.status === 'booked') },
                ].map((s, idx, arr) => (
                  <div key={s.step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                        s.done ? 'bg-paddy-600 border-paddy-500 text-white' : 'bg-white/5 border-white/20 text-white/30'
                      }`}>
                        {s.done ? '✓' : s.step}
                      </div>
                      <p className={`text-xs mt-1.5 text-center ${s.done ? 'text-paddy-300 font-medium' : 'text-white/30'}`}>
                        {s.label}
                      </p>
                    </div>
                    {idx < arr.length - 1 && (
                      <div className={`h-0.5 flex-1 mb-5 ${s.done && arr[idx+1].done ? 'bg-paddy-500' : 'bg-white/10'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Enquiries tab ── */}
        {tab === 'enquiries' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {enquiries.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">📋</p>
                <p className="font-medium text-white/70">No enquiries yet</p>
                <p className="text-sm text-white/40 mt-1">Browse a listing and enquire directly from its page</p>
                <Link href="/properties" className="inline-block mt-4 text-sm text-turmeric-400 hover:text-turmeric-300 font-medium">
                  Browse listings →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/8">
                {enquiries.map(eq => (
                  <div key={eq.id} className="p-5 hover:bg-white/3 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        {eq.properties?.title ? (
                          <Link href={`/properties/${eq.property_id}`} className="text-xs font-semibold text-turmeric-400 hover:underline block mb-0.5">
                            {eq.properties.title}
                          </Link>
                        ) : eq.property_id ? (
                          <Link href={`/properties/${eq.property_id}`} className="text-xs font-semibold text-turmeric-400 hover:underline block mb-0.5">
                            View property →
                          </Link>
                        ) : null}
                        <p className="text-sm text-white/80 line-clamp-2">{eq.message || 'General enquiry'}</p>
                        <p className="text-xs text-white/35 mt-1">
                          {new Date(eq.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                        </p>
                      </div>
                      <StatusBadge status={eq.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Plot interests tab ── */}
        {tab === 'interests' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {interests.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">📍</p>
                <p className="font-medium text-white/70">No plot interests yet</p>
                <p className="text-sm text-white/40 mt-1 max-w-sm mx-auto">
                  Express interest in a plot from the <strong className="text-white/55">Phase 1</strong> plot layout section on the marketing site.
                </p>
                <p className="text-xs text-white/35 mt-3 max-w-sm mx-auto leading-relaxed">
                  Farmland cards you ♥‑save appear under{' '}
                  <button type="button" className="text-turmeric-400 hover:text-turmeric-300 font-medium underline-offset-2" onClick={() => setTab('land-shortlist')}>
                    Land shortlist
                  </button>
                  {' '}— not here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/8">
                {interests.map(pi => (
                  <div key={pi.id} className="p-5 hover:bg-white/3 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-white/90 text-sm">Plot #{pi.plots?.plot_number ?? pi.plot_id}</p>
                        {pi.plots && (
                          <p className="text-xs text-white/40 mt-0.5">
                            {pi.plots.area_sqyds} sq.yds · ₹{pi.plots.price_per_sqyd?.toLocaleString('en-IN')}/sq.yd
                          </p>
                        )}
                        <p className="text-xs text-white/35 mt-0.5">
                          {new Date(pi.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                        </p>
                      </div>
                      <StatusBadge status={pi.status ?? 'pending'} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Land shortlist tab (buyer wishlist — compare & book visits) ── */}
        {tab === 'land-shortlist' && (
          <div className="space-y-4">
            <p className={`text-white/45 text-xs leading-relaxed max-w-2xl`}>
              {cta.shortlistDisclaimer}
            </p>
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              {landShortlist.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <p className="text-4xl mb-3">📌</p>
                  <p className={`font-medium text-white/70`}>{cta.shortlistEmptyTitle}</p>
                  <p className={`text-sm text-white/40 mt-1`}>{cta.shortlistEmptyHint}</p>
                  <Link href="/properties" className={`inline-block mt-5 text-sm text-turmeric-400 hover:text-turmeric-300 font-medium`}>
                    {cta.viewProperties} →
                  </Link>
                </div>
              ) : (
                <>
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-white/40 text-[11px] uppercase tracking-wide border-b border-white/10">
                        <tr>
                          <th className={`px-4 py-3 font-semibold`}>{cta.shortlistLocationCol}</th>
                          <th className={`px-4 py-3 font-semibold`}>{cta.shortlistLandCol}</th>
                          <th className="px-4 py-3 font-semibold text-right">{cta.shortlistAcresCol}</th>
                          <th className={`px-4 py-3 font-semibold text-right`}>{cta.shortlistPricePerAcreCol}</th>
                          <th className={`px-4 py-3 font-semibold text-right`}>{cta.shortlistTotalCol}</th>
                          <th className={`px-4 py-3 font-semibold`}>{cta.shortlistSavedCol}</th>
                          <th className="px-4 py-3 font-semibold text-right" aria-label="Actions" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/8">
                        {landShortlist.map(row => {
                          const sp = row.property
                          const locLine = [sp.village, sp.mandal, sp.district, sp.state].filter(Boolean).join(', ')
                          const acres = Number(sp.area_acres)
                          const pp = Number(sp.expected_price)
                          const total = (acres * pp).toLocaleString('en-IN')
                          return (
                            <tr key={row.wishlistRowId} className="hover:bg-white/3 transition-colors">
                              <td className="px-4 py-3 text-white/90 max-w-[220px]">
                                <Link href={`/properties/${sp.id}`} className="hover:text-turmeric-400 font-medium line-clamp-2">
                                  {locLine || '—'}
                                </Link>
                                {sp.property_id && (
                                  <p className="text-[11px] text-white/35 font-mono mt-0.5">{sp.property_id}</p>
                                )}
                              </td>
                              <td className={`px-4 py-3 text-white/70`}>
                                {[sp.land_soil_type, sp.land_used_type].filter(Boolean).join(' · ') || '—'}
                              </td>
                              <td className="px-4 py-3 text-white/85 text-right tabular-nums">{acres}</td>
                              <td className="px-4 py-3 text-turmeric-300 text-right tabular-nums whitespace-nowrap">₹{pp.toLocaleString('en-IN')}</td>
                              <td className="px-4 py-3 text-turmeric-400/95 font-medium text-right tabular-nums whitespace-nowrap">₹{total}</td>
                              <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">
                                {new Date(row.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex flex-wrap justify-end gap-2">
                                  <Link
                                    href={`/properties/${sp.id}`}
                                    className="text-xs font-medium text-turmeric-400 hover:text-turmeric-300 whitespace-nowrap"
                                  >
                                    View
                                  </Link>
                                  <Link
                                    href={`/properties/${sp.id}?book=1`}
                                    className={`text-xs font-semibold text-white bg-turmeric-500/35 hover:bg-turmeric-500/50 px-2.5 py-1 rounded-lg border border-turmeric-400/30 whitespace-nowrap`}
                                  >
                                    {cta.shortlistBookSlot}
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => removeLandShortlistItem(row.wishlistRowId)}
                                    className={`text-xs font-medium text-white/55 hover:text-red-400 whitespace-nowrap`}
                                  >
                                    {cta.shortlistRemove}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="md:hidden divide-y divide-white/8">
                    {landShortlist.map(row => {
                      const sp = row.property
                      const locLine = [sp.village, sp.mandal, sp.district, sp.state].filter(Boolean).join(', ')
                      const acres = Number(sp.area_acres)
                      const pp = Number(sp.expected_price)
                      const total = (acres * pp).toLocaleString('en-IN')
                      return (
                        <div key={row.wishlistRowId} className="p-5 space-y-3">
                          <div className="flex justify-between gap-3 items-start">
                            <Link href={`/properties/${sp.id}`} className={`text-sm font-medium text-white/90 hover:text-turmeric-400 min-w-0 leading-snug`}>
                              {locLine || '—'}
                              {sp.property_id && (
                                <span className="block text-[11px] text-white/35 font-mono mt-1">{sp.property_id}</span>
                              )}
                            </Link>
                            <button
                              type="button"
                              onClick={() => removeLandShortlistItem(row.wishlistRowId)}
                              className={`text-xs font-medium text-white/55 hover:text-red-400 shrink-0 pt-0.5`}
                            >
                              {cta.shortlistRemove}
                            </button>
                          </div>
                          <p className="text-xs text-white/45 tabular-nums">
                            {acres} acres · ₹{pp.toLocaleString('en-IN')} / acre · ₹{total}
                          </p>
                          <p className={`text-[11px] text-white/35`}>
                            <span>{cta.shortlistSavedCol}: </span>
                            <span>{new Date(row.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={`/properties/${sp.id}?book=1`}
                              className={`flex-1 min-w-[120px] text-center text-xs font-semibold text-white bg-turmeric-500/35 hover:bg-turmeric-500/50 px-3 py-2 rounded-xl border border-turmeric-400/30 transition-colors`}
                            >
                              {cta.shortlistBookSlot}
                            </Link>
                            <Link
                              href={`/properties/${sp.id}`}
                              className="flex-1 min-w-[100px] text-center text-xs font-medium text-white/70 border border-white/15 hover:bg-white/8 px-3 py-2 rounded-xl transition-colors"
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Land requests tab ── */}
        {tab === 'land-requests' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {landRequests.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🗺️</p>
                <p className="font-medium text-white/70">No land requests yet</p>
                <p className="text-sm text-white/40 mt-1">Tell us what kind of land you&apos;re looking for</p>
                <Link href="/buyer-request" className="inline-block mt-4 text-sm text-turmeric-400 hover:text-turmeric-300 font-medium">
                  Post a land request →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/8">
                {landRequests.map(r => (
                  <div key={r.id} className="p-5 hover:bg-white/3 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-white/90 text-sm">
                          {[r.state, r.district].filter(Boolean).join(' · ') || 'Any location'}
                        </p>
                        {r.notes && <p className="text-xs text-white/45 mt-1 line-clamp-2">{r.notes}</p>}
                        <p className="text-xs text-white/35 mt-1">
                          {new Date(r.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <LandRequestBadge status={r.status} />
                        {r.status === 'open' && (
                          <Link href={`/buyer-request/${r.id}/edit`} className="text-xs font-medium text-turmeric-400 hover:text-turmeric-300">
                            Edit →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
