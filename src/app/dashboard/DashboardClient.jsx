'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '../../lib/supabase'
import { LogOut } from 'lucide-react'
import EmailVerificationBanner from '../../components/EmailVerificationBanner'
import RoleRedirectBanner from '../../components/RoleRedirectBanner'
import BuyerLandRequestForm, { BUYER_REQUEST_INITIAL } from '../../components/buyer/BuyerLandRequestForm'
import { content } from '../../data/content'
import { useLang } from '../../context/LanguageContext'
import { INTEREST_SHORTLIST_MAX } from '../../lib/interestShortlist'
import { peekPendingShortlistIds, flushPendingShortlistToWishlist } from '../../lib/pendingShortlist'
import Phase2ServicesPanel from '../../components/services/Phase2ServicesPanel'

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

/**
 * Unified “My Dashboard” — KPI strip, profile, plots, farmland shortlist,
 * land requests (with submit), browse, seller post property, services.
 */
export default function DashboardClient({
  user,
  profile = null,
  enquiries = [],
  interests = [],
  landRequests = [],
  landShortlist: landShortlistInitial = [],
  dashboardStats,
  sellerEngagement = { visitRequests: 0, shortlistSaves: 0 },
  focusServicesSection = false,
}) {
  const router = useRouter()
  const { lang } = useLang()
  const nav = content[lang].nav
  const cta = content[lang].cta

  const [landShortlist, setLandShortlist] = useState(landShortlistInitial)
  const [pendingListingCount, setPendingListingCount] = useState(0)
  const [mergingPending, setMergingPending] = useState(false)
  const [landFormKey, setLandFormKey] = useState(0)

  const shortlistListingViewsTotal = useMemo(
    () => landShortlist.reduce((sum, row) => sum + (Number(row.property?.views) || 0), 0),
    [landShortlist],
  )

  useEffect(() => {
    setLandShortlist(landShortlistInitial)
  }, [landShortlistInitial])

  useEffect(() => {
    if (!focusServicesSection) return
    const id = window.requestAnimationFrame(() => {
      document.getElementById('dashboard-services')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    const url = new URL(window.location.href)
    url.searchParams.delete('services')
    window.history.replaceState(null, '', url.pathname + (url.search ? url.search : '') + url.hash)
    return () => window.cancelAnimationFrame(id)
  }, [focusServicesSection])

  useEffect(() => {
    setPendingListingCount(peekPendingShortlistIds().length)
  }, [landShortlistInitial])

  const name = profile?.full_name || user.full_name || user.email?.split('@')[0] || 'Member'
  const email = profile?.email || user.email || '—'
  const phone = profile?.phone || user.phone || '—'

  const servicesPrefill = useMemo(() => ({
    full_name: name,
    email: email !== '—' ? String(email).toLowerCase() : '',
    phone: phone !== '—' ? String(phone).replace(/\s/g, '') : '',
  }), [name, email, phone])
  const latestRequest = landRequests[0]
  const roleLabel =
    user.role === 'seller' && dashboardStats.propertiesPosted > 0
      ? 'Buyer & Seller'
      : user.role === 'seller'
        ? 'Seller'
        : 'Buyer'

  async function mergePendingShortlist() {
    setMergingPending(true)
    const supabase = createClient()
    try {
      const r = await flushPendingShortlistToWishlist(user.id, supabase)
      setPendingListingCount(peekPendingShortlistIds().length)
      if (r.skippedCap) {
        alert(`${cta.shortlistLimitPart1}${INTEREST_SHORTLIST_MAX}${cta.shortlistLimitPart2}`)
      }
      if (r.added > 0) router.refresh()
    } finally {
      setMergingPending(false)
    }
  }

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

  async function handleCreateLandRequest(form) {
    const supabase = createClient()
    const { error: insertErr } = await supabase.from('buyer_requests').insert({
      buyer_id: user.id,
      name: form.name,
      phone: form.phone,
      email: form.email || user.email || null,
      state: form.state || null,
      district: form.district || null,
      mandal: form.mandal || null,
      land_soil_type: form.land_soil_type || null,
      area_min: form.area_min ? Number(form.area_min) : null,
      area_max: form.area_max ? Number(form.area_max) : null,
      price_max: form.price_max ? Number(form.price_max) : null,
      notes: form.notes || null,
      buyer_residence_city: form.buyer_residence_city || null,
      buyer_residence_state: form.buyer_residence_state || null,
      buyer_residence_notes: form.buyer_residence_notes || null,
    })
    if (insertErr) throw new Error(insertErr.message)
    setLandFormKey(k => k + 1)
    router.refresh()
  }

  const kpi = [
    { label: 'No. of properties posted', value: dashboardStats.propertiesPosted, color: 'text-turmeric-400', icon: '📝' },
    { label: 'Interested / shortlisted', value: dashboardStats.shortlisted, color: 'text-rose-200', icon: '📌' },
    { label: 'Contacted / appointments', value: dashboardStats.contactedAppointments, color: 'text-paddy-300', icon: '📅' },
    { label: 'Properties sold (your listings)', value: dashboardStats.soldAsSeller, color: 'text-green-300', icon: '✅' },
    { label: 'Properties bought (approx.)', value: dashboardStats.boughtApprox, color: 'text-blue-300', icon: '🤝' },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #071709 0%, #0a1f0c 40%, #0d2510 100%)' }}>

      {/* Header — My Dashboard + Talk to team + Sign out */}
      <div className="border-b border-white/8 px-4 sm:px-6 py-4 sticky top-0 z-30 bg-paddy-950/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="text-2xl shrink-0" title="SDV Farms Home">🌾</Link>
            <div className="min-w-0">
              <h1 className="text-white font-display font-bold text-base sm:text-lg truncate">My Dashboard</h1>
              <p className="text-white/45 text-xs truncate">
                {name.split(' ')[0]} · <span className="text-white/55">{roleLabel}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center btn-gold text-xs font-semibold py-2 px-3 rounded-full whitespace-nowrap"
            >
              {nav.talkToTeam}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="text-white/50 hover:text-red-400 text-xs transition-colors flex items-center gap-1 border border-white/15 rounded-full px-2.5 py-1.5"
            >
              <LogOut size={13} /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 space-y-3">
        <RoleRedirectBanner />
        <EmailVerificationBanner user={user} />
        {pendingListingCount > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-rose-500/12 border border-rose-400/28 rounded-xl px-4 py-3">
            <p className="text-rose-100/95 text-sm">{cta.pendingShortlistBanner(pendingListingCount)}</p>
            <button
              type="button"
              disabled={mergingPending}
              onClick={mergePendingShortlist}
              className="shrink-0 text-sm font-semibold text-white bg-turmeric-500 hover:bg-turmeric-600 disabled:opacity-60 rounded-xl px-4 py-2.5 transition-colors"
            >
              {mergingPending ? cta.pendingShortlistAdding : cta.pendingShortlistConfirm}
            </button>
          </div>
        )}
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <p className="text-white/50 text-sm">
          Welcome back, <strong className="text-white/75">{name.split(' ')[0]}</strong>. Here’s your overview — browse the site from the homepage; manage requests and saved land here.
        </p>

        {/* Row 1 — KPI strip (same five labels) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {kpi.map(card => (
            <div key={card.label} className="bg-white/4 border border-white/8 rounded-2xl py-4 px-2.5 text-center">
              <p className="text-lg mb-0.5" aria-hidden>{card.icon}</p>
              <p className={`font-display font-bold text-2xl sm:text-3xl ${card.color}`}>{card.value}</p>
              <p className="text-white/45 text-[10px] sm:text-xs mt-1 leading-snug">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Row 2 — sections */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* 1. Overview / profile */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 lg:col-span-2">
            <h2 className="font-semibold text-white mb-4 text-lg">Overview / Profile</h2>
            <div className="grid sm:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <div className="flex justify-between gap-3"><span className="text-white/45 shrink-0">Name</span><span className="font-medium text-white/90 text-right">{name}</span></div>
                <div className="flex justify-between gap-3"><span className="text-white/45 shrink-0">Email</span><span className="font-medium text-white/90 text-right break-all">{email}</span></div>
                <div className="flex justify-between gap-3"><span className="text-white/45 shrink-0">Phone</span><span className="font-medium text-white/90">{phone}</span></div>
              </div>
              <div className="space-y-3 border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6">
                <p className="text-white/35 text-[11px] uppercase tracking-wide mb-2">Address &amp; preference hints</p>
                <div className="flex justify-between gap-3"><span className="text-white/45">Village</span><span className="text-white/80">—</span></div>
                <div className="flex justify-between gap-3"><span className="text-white/45">Mandal</span><span className="text-white/80">{latestRequest?.mandal || '—'}</span></div>
                <div className="flex justify-between gap-3"><span className="text-white/45">District</span><span className="text-white/80">{latestRequest?.district || '—'}</span></div>
                <div className="flex justify-between gap-3"><span className="text-white/45">State</span><span className="text-white/80">{latestRequest?.state || '—'}</span></div>
                <div className="flex justify-between gap-3"><span className="text-white/45">ZIP code</span><span className="text-white/80">—</span></div>
                <p className="text-white/30 text-[11px] pt-2 border-t border-white/10 mt-2">
                  Your residence: {[latestRequest?.buyer_residence_city, latestRequest?.buyer_residence_state].filter(Boolean).join(', ') || '—'}
                  {latestRequest?.buyer_residence_notes && (
                    <span className="block mt-1 text-white/35">{latestRequest.buyer_residence_notes}</span>
                  )}
                </p>
              </div>
            </div>
          </section>

          {/* 2. Interested plots (Phase 1) */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="font-semibold text-white mb-3 flex items-center justify-between gap-2">
              <span>Interested plots</span>
              <span className="text-xs text-white/40 font-normal">{interests.length}</span>
            </h2>
            {interests.length === 0 ? (
              <p className="text-white/45 text-sm">No Phase 1 plot interests yet.</p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {interests.map(pi => (
                  <li key={pi.id} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-3 py-2">
                    <span className="text-2xl shrink-0" aria-hidden>📍</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-medium text-sm">Plot #{pi.plots?.plot_number ?? pi.plot_id}</p>
                      {pi.plots && (
                        <p className="text-[11px] text-white/40">{pi.plots.area_sqyds} sq.yd · ₹{pi.plots.price_per_sqyd?.toLocaleString('en-IN')}/sq.yd</p>
                      )}
                    </div>
                    <StatusBadge status={pi.status ?? 'pending'} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Farmland shortlist */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="font-semibold text-white mb-3 flex items-center justify-between gap-2">
              <span>{cta.shortlistDashboardTab}</span>
              <span className="text-xs text-white/40 font-normal">{landShortlist.length}</span>
            </h2>
            {shortlistListingViewsTotal > 0 && (
              <p className="text-white/38 text-[11px] mb-3">{cta.enquiriesShortlistViewsLine(shortlistListingViewsTotal)}</p>
            )}
            {landShortlist.length === 0 ? (
              <p className="text-white/45 text-sm mb-3">{cta.shortlistEmptyHint}</p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {landShortlist.slice(0, 8).map(row => {
                  const sp = row.property
                  const photo = sp.photo_urls?.[0]
                  const label = [sp.village, sp.mandal].filter(Boolean).join(', ') || sp.district || 'Listing'
                  return (
                    <li key={row.wishlistRowId} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-2 py-2">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-paddy-900/60 shrink-0">
                        {photo ? (
                          <Image src={photo} alt="" fill className="object-cover" sizes="48px" />
                        ) : (
                          <span className="flex items-center justify-center h-full text-lg">🌾</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link href={`/properties/${sp.id}`} className="text-sm font-medium text-white hover:text-turmeric-400 truncate block">
                          {label}
                        </Link>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <Link href={`/properties/${sp.id}?book=1`} className="text-[11px] text-turmeric-400">{cta.shortlistBookSlot}</Link>
                          <button type="button" onClick={() => removeLandShortlistItem(row.wishlistRowId)} className="text-[11px] text-white/40 hover:text-red-400">{cta.shortlistRemove}</button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
            <Link href="/properties" className="inline-block mt-4 text-sm text-turmeric-400 hover:text-turmeric-300 font-medium">{cta.viewProperties} →</Link>
          </section>

          {/* 3. Land requests */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="font-semibold text-white text-lg">Land requests</h2>
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <p className="text-white/45 text-xs mb-3">Post a new request — we’ll match you to listings.</p>
                <div className="bg-white/6 border border-white/10 rounded-2xl p-5">
                  <BuyerLandRequestForm
                    key={landFormKey}
                    initialForm={{
                      ...BUYER_REQUEST_INITIAL,
                      name,
                      phone: phone !== '—' ? String(phone) : '',
                      email: email !== '—' ? String(email).toLowerCase() : '',
                    }}
                    submitLabel="Submit request"
                    onSubmit={async form => {
                      await handleCreateLandRequest(form)
                    }}
                  />
                </div>
              </div>
              <div>
                <p className="text-white/45 text-xs mb-3">Your requests</p>
                {landRequests.length === 0 ? (
                  <p className="text-white/40 text-sm">No requests yet.</p>
                ) : (
                  <ul className="space-y-2 max-h-[28rem] overflow-y-auto">
                    {landRequests.map(r => (
                      <li key={r.id} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-white font-medium text-sm">{[r.state, r.district].filter(Boolean).join(' · ') || 'Any location'}</p>
                          {r.notes && <p className="text-xs text-white/45 mt-1 line-clamp-2">{r.notes}</p>}
                          <p className="text-[11px] text-white/30 mt-1">
                            {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <LandRequestBadge status={r.status} />
                          {r.status === 'open' && (
                            <Link href={`/buyer-request/${r.id}/edit`} className="text-[11px] text-turmeric-400 hover:text-turmeric-300">Edit</Link>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>

          {/* 4. Browse properties */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col">
            <h2 className="font-semibold text-white mb-2 text-lg">Browse properties</h2>
            <p className="text-white/45 text-sm flex-1">Explore approved farmland listings, compare on your shortlist, and book a visit from any listing.</p>
            <Link
              href="/properties"
              className="mt-4 inline-flex items-center justify-center bg-turmeric-500 hover:bg-turmeric-600 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              {cta.viewProperties} →
            </Link>
          </section>

          {/* 5. Post property (seller) */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col relative overflow-hidden">
            <h2 className="font-semibold text-white mb-2 text-lg">Post property</h2>
            <p className="text-white/45 text-sm mb-4">Add a listing and track buyer interest.</p>
            <div className="flex gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-2 rounded-xl bg-black/25 border border-white/10 px-3 py-2 text-sm">
                <span aria-hidden>📅</span>
                <div>
                  <p className="text-white font-semibold tabular-nums">{sellerEngagement.visitRequests}</p>
                  <p className="text-[10px] text-white/45">Visit / enquire</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-black/25 border border-white/10 px-3 py-2 text-sm">
                <span aria-hidden>📌</span>
                <div>
                  <p className="text-white font-semibold tabular-nums">{sellerEngagement.shortlistSaves}</p>
                  <p className="text-[10px] text-white/45">Shortlist saves</p>
                </div>
              </div>
            </div>
            <Link
              href="/seller/property/new"
              className="mt-auto inline-flex items-center justify-center bg-paddy-700 hover:bg-paddy-600 border border-paddy-500/40 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              + Add property
            </Link>
            {dashboardStats.propertiesPosted > 0 && (
              <Link href="/seller" className="block text-center text-xs text-turmeric-400 hover:text-turmeric-300 mt-3">
                Manage {dashboardStats.propertiesPosted} listing{dashboardStats.propertiesPosted === 1 ? '' : 's'} →
              </Link>
            )}
          </section>

          {/* 6. Services — full Phase II booking embedded */}
          <section id="dashboard-services" className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col lg:col-span-2">
            <h2 className="font-semibold text-white mb-1 text-lg">Services</h2>
            <p className="text-white/45 text-xs sm:text-sm mb-5">
              Fence, borewell, drip irrigation, seedlings, fertilizers, and customised farming plans. Your details are filled in automatically — tap <strong className="text-white/65">Enquire</strong> on any service below. Call{' '}
              <a href="tel:7780312525" className="text-turmeric-400 font-medium">7780312525</a>{' '}
              anytime.
            </p>
            <Phase2ServicesPanel
              prefillContact={servicesPrefill}
              showPhase3Teaser
              footerLinkHref="/services"
              footerLinkLabel="Open standalone Services page →"
            />
          </section>

          {/* Property enquiries (compact) */}
          {enquiries.length > 0 && (
            <section className="bg-white/5 border border-white/10 rounded-2xl p-6 lg:col-span-2">
              <h2 className="font-semibold text-white mb-3 text-lg">Recent enquiries</h2>
              <div className="divide-y divide-white/8 rounded-xl border border-white/10 overflow-hidden">
                {enquiries.slice(0, 5).map(eq => (
                  <div key={eq.id} className="p-4 hover:bg-white/3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {eq.property_id && (
                        <Link href={`/properties/${eq.property_id}`} className="text-xs font-semibold text-turmeric-400 hover:underline">
                          {eq.properties?.title || 'View property'}
                        </Link>
                      )}
                      <p className="text-sm text-white/75 line-clamp-2 mt-0.5">{eq.message || 'Enquiry'}</p>
                      <p className="text-[11px] text-white/30 mt-1">
                        {new Date(eq.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <StatusBadge status={eq.status} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}
