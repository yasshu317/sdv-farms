'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import StatusBadge from '../../components/ui/StatusBadge'
import AppointmentPicker from '../../components/AppointmentPicker'
import EmailVerificationBanner from '../../components/EmailVerificationBanner'

export default function SellerClient({ user, properties, appointments }) {
  const router = useRouter()
  const [tab, setTab] = useState('listings')
  const [showPicker, setShowPicker] = useState(false)

  const canPost = properties.filter(p => ['pending','approved'].includes(p.status)).length < 2

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const tabs = ['listings', 'appointments']

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

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #071709 0%, #0e2c13 50%, #071709 100%)' }}>
      {/* Header */}
      <div className="border-b border-white/8 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl">🌾</Link>
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
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Listings', value: properties.length },
            { label: 'Live', value: properties.filter(p => p.status === 'approved').length },
            { label: 'Total Views', value: properties.reduce((acc, p) => acc + (p.views || 0), 0) },
          ].map(s => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-turmeric-400">{s.value}</p>
              <p className="text-white/50 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6 w-fit">
          {tabs.map(t => (
            <button
              key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                tab === t ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white/70'
              }`}
            >{t}</button>
          ))}
        </div>

        {/* Listings tab */}
        {tab === 'listings' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">My Properties</h2>
              {canPost ? (
                <Link
                  href="/seller/property/new"
                  className="bg-turmeric-500 hover:bg-turmeric-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                >
                  + Post Property
                </Link>
              ) : (
                <span className="text-white/40 text-xs">Max 2 active listings reached</span>
              )}
            </div>

            {properties.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-white/15 rounded-2xl">
                <div className="text-4xl mb-3">🌾</div>
                <p className="text-white/60 mb-4">No listings yet</p>
                <Link
                  href="/seller/property/new"
                  className="bg-turmeric-500 hover:bg-turmeric-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
                >
                  Post Your First Property
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {properties.map(p => {
                  const docs = Array.isArray(p.doc_urls) ? p.doc_urls : []
                  const photos = Array.isArray(p.photo_urls) ? p.photo_urls : []
                  const created = p.created_at
                    ? new Date(p.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                    : '—'
                  const updated = p.updated_at
                    ? new Date(p.updated_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                    : '—'

                  return (
                    <div key={p.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
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
                        {p.status === 'pending' && (
                          <Link
                            href={`/seller/property/${p.id}/edit`}
                            className="text-sm font-medium text-turmeric-400 hover:text-turmeric-300 transition-colors shrink-0"
                          >
                            Edit listing →
                          </Link>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-center sm:text-center mb-5">
                        <div className="bg-white/5 rounded-xl py-2 px-1">
                          <p className="text-white font-semibold">{fmt(p.area_acres)}</p>
                          <p className="text-white/40 text-xs">Acres</p>
                        </div>
                        <div className="bg-white/5 rounded-xl py-2 px-1">
                          <p className="text-white font-semibold">₹{p.expected_price != null ? Number(p.expected_price).toLocaleString('en-IN') : '—'}</p>
                          <p className="text-white/40 text-xs">Per acre (₹)</p>
                        </div>
                        <div className="bg-white/5 rounded-xl py-2 px-1">
                          <p className="text-white font-semibold">{p.views ?? 0}</p>
                          <p className="text-white/40 text-xs">Views</p>
                        </div>
                      </div>

                      <div className="border-t border-white/10 pt-4 space-y-4">
                        <div>
                          <p className="text-white/45 text-[10px] uppercase tracking-wider mb-2">Location</p>
                          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                            <div className="flex justify-between gap-2 sm:block"><dt className="text-white/40 shrink-0">State</dt><dd className="text-white/90 text-right sm:text-left">{fmt(p.state)}</dd></div>
                            <div className="flex justify-between gap-2 sm:block"><dt className="text-white/40 shrink-0">District</dt><dd className="text-white/90 text-right sm:text-left">{fmt(p.district)}</dd></div>
                            <div className="flex justify-between gap-2 sm:block"><dt className="text-white/40 shrink-0">Mandal</dt><dd className="text-white/90 text-right sm:text-left">{fmt(p.mandal)}</dd></div>
                            <div className="flex justify-between gap-2 sm:block"><dt className="text-white/40 shrink-0">Village / area</dt><dd className="text-white/90 text-right sm:text-left">{fmt(p.village)}</dd></div>
                            <div className="flex justify-between gap-2 sm:block"><dt className="text-white/40 shrink-0">PIN / Zip</dt><dd className="text-white/90 text-right sm:text-left">{fmt(p.zip_code)}</dd></div>
                            <div className="flex justify-between gap-2 sm:block"><dt className="text-white/40 shrink-0">Farmer name</dt><dd className="text-white/90 text-right sm:text-left">{fmt(p.farmer_name)}</dd></div>
                          </dl>
                        </div>

                        <div>
                          <p className="text-white/45 text-[10px] uppercase tracking-wider mb-2">Land</p>
                          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                            <div className="flex justify-between gap-2 sm:block"><dt className="text-white/40 shrink-0">Land use</dt><dd className="text-white/90 text-right sm:text-left">{fmt(p.land_used_type)}</dd></div>
                            <div className="flex justify-between gap-2 sm:block"><dt className="text-white/40 shrink-0">Soil</dt><dd className="text-white/90 text-right sm:text-left">{fmt(p.land_soil_type)}</dd></div>
                            <div className="sm:col-span-2 flex justify-between gap-2 sm:block"><dt className="text-white/40 shrink-0">Document type</dt><dd className="text-white/90 text-right sm:text-left break-words">{fmt(p.land_doc_type)}</dd></div>
                            <div className="sm:col-span-2 flex justify-between gap-2 sm:block"><dt className="text-white/40 shrink-0">Road / bata access</dt><dd className="text-white/90 text-right sm:text-left">{p.road_access ? 'Yes' : 'No'}</dd></div>
                          </dl>
                        </div>

                        <div>
                          <p className="text-white/45 text-[10px] uppercase tracking-wider mb-2">Uploads</p>
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
                          {photos.length > 0 && (
                            <ul className="text-xs space-y-1">
                              {photos.map((url, i) => (
                                <li key={`ph-${i}`}>
                                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-turmeric-400/90 hover:text-turmeric-300 underline underline-offset-2 break-all">
                                    Photo {i + 1} — {fileLabel(url, i)}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                          {docs.length === 0 && photos.length === 0 && (
                            <p className="text-white/35 text-xs">No files uploaded yet.</p>
                          )}
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
              </div>
            )}
          </div>
        )}

        {/* Appointments tab */}
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
