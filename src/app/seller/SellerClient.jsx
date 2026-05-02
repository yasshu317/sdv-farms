'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import StatusBadge from '../../components/ui/StatusBadge'
import AppointmentPicker from '../../components/AppointmentPicker'
import EmailVerificationBanner from '../../components/EmailVerificationBanner'

/** Only statuses a seller cares about */
const SELLER_STATUSES = ['pending', 'approved']
const MAX_LISTINGS = 2

export default function SellerClient({ user, properties, appointments }) {
  const router = useRouter()
  const [tab, setTab] = useState('listings')
  const [showPicker, setShowPicker] = useState(false)

  // Only count active (pending / approved) listings against the cap
  const activeListings = properties.filter(p => SELLER_STATUSES.includes(p.status))
  const canAddMore = activeListings.length < MAX_LISTINGS

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  function fmt(v) {
    if (v === null || v === undefined || v === '') return '—'
    return String(v)
  }

  function fileLabel(url, i) {
    try {
      const seg = decodeURIComponent(String(url).split('/').pop() || '')
      return seg.length > 36 ? `${seg.slice(0, 33)}…` : seg || `File ${i + 1}`
    } catch {
      return `File ${i + 1}`
    }
  }

  const pendingCount  = properties.filter(p => p.status === 'pending').length
  const approvedCount = properties.filter(p => p.status === 'approved').length
  const totalViews    = properties.reduce((acc, p) => acc + (p.views || 0), 0)

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #071709 0%, #0e2c13 50%, #071709 100%)' }}>

      {/* ── Header ── */}
      <div className="border-b border-white/8 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl" title="SDV Farms Home">🌾</Link>
            <div>
              <p className="text-white font-semibold text-sm">{user.full_name}</p>
              <p className="text-white/40 text-xs capitalize">{user.seller_type || 'Seller'} · {user.email}</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="text-white/40 hover:text-white/70 text-xs transition-colors">
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4">
        <EmailVerificationBanner user={user} />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Hero action bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-white font-display text-2xl font-bold">My Listings</h1>
            <p className="text-white/45 text-sm mt-1">
              {activeListings.length} of {MAX_LISTINGS} slots used
            </p>
          </div>
          {canAddMore ? (
            <Link
              href="/seller/property/new"
              className="inline-flex items-center gap-2 bg-turmeric-500 hover:bg-turmeric-600 active:scale-95 text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-turmeric-900/30"
            >
              <span className="text-lg leading-none">+</span> Add Property
            </Link>
          ) : (
            <div className="text-right">
              <p className="text-white/45 text-xs">Max {MAX_LISTINGS} active listings reached</p>
              <p className="text-white/30 text-xs mt-0.5">Remove a listing to add a new one</p>
            </div>
          )}
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Pending Review', value: pendingCount,  color: 'text-yellow-300' },
            { label: 'Live / Approved', value: approvedCount, color: 'text-paddy-300' },
            { label: 'Total Views',    value: totalViews,     color: 'text-turmeric-400' },
          ].map(s => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-white/50 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6 w-fit">
          {['listings', 'appointments'].map(t => (
            <button
              key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                tab === t ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white/70'
              }`}
            >{t}</button>
          ))}
        </div>

        {/* ══ Listings tab ══ */}
        {tab === 'listings' && (
          <div>
            {properties.length === 0 ? (
              /* ── Empty state ── */
              <div className="text-center py-20 border border-dashed border-white/15 rounded-2xl">
                <div className="text-5xl mb-4">🌾</div>
                <h2 className="text-white font-semibold text-lg mb-2">No listings yet</h2>
                <p className="text-white/45 text-sm mb-6 max-w-xs mx-auto">
                  List your agricultural land — free, fast, reviewed within 48 hours.
                </p>
                <Link
                  href="/seller/property/new"
                  className="inline-flex items-center gap-2 bg-turmeric-500 hover:bg-turmeric-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
                >
                  <span className="text-lg leading-none">+</span> Add Your First Property
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {properties.map(p => {
                  const docs    = Array.isArray(p.doc_urls)   ? p.doc_urls   : []
                  const photos  = Array.isArray(p.photo_urls) ? p.photo_urls : []
                  const created = p.created_at
                    ? new Date(p.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                    : '—'
                  const updated = p.updated_at
                    ? new Date(p.updated_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                    : '—'

                  return (
                    <div key={p.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                      {/* ── Card header ── */}
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            {p.property_id
                              ? <span className="text-turmeric-400 font-mono text-sm font-bold">{p.property_id}</span>
                              : <span className="text-white/30 text-xs italic">Awaiting Property ID</span>
                            }
                            <StatusBadge status={p.status} />
                          </div>
                          <p className="text-white/35 text-[11px] font-mono">Listing ID: {p.id}</p>
                        </div>
                        {/* Edit only for pending listings — approved ones are live */}
                        {p.status === 'pending' && (
                          <Link
                            href={`/seller/property/${p.id}/edit`}
                            className="text-sm font-medium text-turmeric-400 hover:text-turmeric-300 transition-colors shrink-0 border border-turmeric-400/30 px-3 py-1.5 rounded-lg hover:bg-turmeric-400/10"
                          >
                            Edit listing →
                          </Link>
                        )}
                        {p.status === 'approved' && (
                          <Link
                            href={`/properties/${p.id}`}
                            target="_blank"
                            className="text-sm font-medium text-paddy-300 hover:text-paddy-200 transition-colors shrink-0 border border-paddy-400/30 px-3 py-1.5 rounded-lg hover:bg-paddy-400/10"
                          >
                            View live listing ↗
                          </Link>
                        )}
                      </div>

                      {/* ── Quick metrics ── */}
                      <div className="grid grid-cols-3 gap-3 text-center mb-5">
                        <div className="bg-white/5 rounded-xl py-2 px-1">
                          <p className="text-white font-semibold">{fmt(p.area_acres)}</p>
                          <p className="text-white/40 text-xs">Acres</p>
                        </div>
                        <div className="bg-white/5 rounded-xl py-2 px-1">
                          <p className="text-white font-semibold">₹{p.expected_price != null ? Number(p.expected_price).toLocaleString('en-IN') : '—'}</p>
                          <p className="text-white/40 text-xs">Per acre</p>
                        </div>
                        <div className="bg-white/5 rounded-xl py-2 px-1">
                          <p className="text-white font-semibold">{p.views ?? 0}</p>
                          <p className="text-white/40 text-xs">Views</p>
                        </div>
                      </div>

                      {/* ── Details ── */}
                      <div className="border-t border-white/10 pt-4 space-y-4">
                        <div>
                          <p className="text-white/45 text-[10px] uppercase tracking-wider mb-2">Location</p>
                          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                            <div className="flex justify-between gap-2 sm:block"><dt className="text-white/40 shrink-0">State</dt><dd className="text-white/90 text-right sm:text-left">{fmt(p.state)}</dd></div>
                            <div className="flex justify-between gap-2 sm:block"><dt className="text-white/40 shrink-0">District</dt><dd className="text-white/90 text-right sm:text-left">{fmt(p.district)}</dd></div>
                            <div className="flex justify-between gap-2 sm:block"><dt className="text-white/40 shrink-0">Mandal</dt><dd className="text-white/90 text-right sm:text-left">{fmt(p.mandal)}</dd></div>
                            <div className="flex justify-between gap-2 sm:block"><dt className="text-white/40 shrink-0">Village / area</dt><dd className="text-white/90 text-right sm:text-left">{fmt(p.village)}</dd></div>
                          </dl>
                        </div>

                        <div>
                          <p className="text-white/45 text-[10px] uppercase tracking-wider mb-2">Land</p>
                          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                            <div className="flex justify-between gap-2 sm:block"><dt className="text-white/40 shrink-0">Land use</dt><dd className="text-white/90 text-right sm:text-left">{fmt(p.land_used_type)}</dd></div>
                            <div className="flex justify-between gap-2 sm:block"><dt className="text-white/40 shrink-0">Soil</dt><dd className="text-white/90 text-right sm:text-left">{fmt(p.land_soil_type)}</dd></div>
                            <div className="sm:col-span-2 flex justify-between gap-2 sm:block"><dt className="text-white/40 shrink-0">Document type</dt><dd className="text-white/90 text-right sm:text-left break-words">{fmt(p.land_doc_type)}</dd></div>
                            <div className="sm:col-span-2 flex justify-between gap-2 sm:block"><dt className="text-white/40 shrink-0">Road access</dt><dd className="text-white/90 text-right sm:text-left">{p.road_access ? 'Yes' : 'No'}</dd></div>
                          </dl>
                        </div>

                        <div>
                          <p className="text-white/45 text-[10px] uppercase tracking-wider mb-2">Documents & Photos</p>
                          <p className="text-white/70 text-sm mb-1">
                            Land documents ({docs.length}) · Property photos ({photos.length})
                          </p>
                          {docs.length > 0 && (
                            <ul className="text-xs space-y-1 mb-2">
                              {docs.map((url, i) => (
                                <li key={`d-${i}`}>
                                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-turmeric-400/90 hover:text-turmeric-300 underline underline-offset-2 break-all">
                                    {fileLabel(url, i)}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                          {docs.length === 0 && <p className="text-red-400/70 text-xs">⚠ No land document uploaded</p>}
                          {photos.length === 0 && <p className="text-white/35 text-xs mt-1">No photos uploaded yet</p>}
                        </div>

                        <div>
                          <p className="text-white/45 text-[10px] uppercase tracking-wider mb-2">Record</p>
                          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-white/55">
                            <div><dt className="text-white/35 inline">Submitted</dt> <dd className="inline text-white/70">{created}</dd></div>
                            <div><dt className="text-white/35 inline">Last updated</dt> <dd className="inline text-white/70">{updated}</dd></div>
                          </dl>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Bottom add-more CTA */}
                {canAddMore && (
                  <div className="text-center pt-4 border-t border-white/8">
                    <Link
                      href="/seller/property/new"
                      className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-turmeric-300 transition-colors"
                    >
                      <span>+</span> Add another property ({MAX_LISTINGS - activeListings.length} slot{MAX_LISTINGS - activeListings.length !== 1 ? 's' : ''} left)
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ Appointments tab ══ */}
        {tab === 'appointments' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">My Appointments</h2>
              <button
                onClick={() => setShowPicker(true)}
                className="bg-paddy-600 hover:bg-paddy-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              >
                + Book a Call
              </button>
            </div>

            {showPicker && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                <h3 className="text-white font-medium mb-4">Book a Call with SDV Farms</h3>
                <AppointmentPicker
                  type="seller"
                  userEmail={user.email}
                  onBooked={() => setShowPicker(false)}
                  onCancel={() => setShowPicker(false)}
                />
              </div>
            )}

            {appointments.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-white/15 rounded-2xl">
                <p className="text-white/40 text-sm">No appointments scheduled yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map(a => (
                  <div key={a.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-white text-sm font-medium">{a.appointment_date} · {a.time_slot}</p>
                      {a.notes && <p className="text-white/40 text-xs mt-0.5">{a.notes}</p>}
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
