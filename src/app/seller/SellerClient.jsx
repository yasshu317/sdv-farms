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
                {properties.map(p => (
                  <div key={p.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {p.property_id
                            ? <span className="text-turmeric-400 font-mono text-sm font-bold">{p.property_id}</span>
                            : <span className="text-white/30 text-xs italic">Awaiting Property ID</span>
                          }
                          <StatusBadge status={p.status} />
                        </div>
                        <p className="text-white font-medium">
                          {[p.village, p.mandal, p.district, p.state].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center mt-4">
                      <div className="bg-white/5 rounded-xl py-2">
                        <p className="text-white font-semibold">{p.area_acres}</p>
                        <p className="text-white/40 text-xs">Acres</p>
                      </div>
                      <div className="bg-white/5 rounded-xl py-2">
                        <p className="text-white font-semibold">₹{Number(p.expected_price).toLocaleString('en-IN')}</p>
                        <p className="text-white/40 text-xs">Per Acre</p>
                      </div>
                      <div className="bg-white/5 rounded-xl py-2">
                        <p className="text-white font-semibold">{p.views || 0}</p>
                        <p className="text-white/40 text-xs">Views</p>
                      </div>
                    </div>
                    {p.land_soil_type && (
                      <p className="text-white/40 text-xs mt-3">
                        {p.land_soil_type} soil · {p.land_used_type} · {p.road_access ? '🛣️ Road access' : 'No road access'}
                      </p>
                    )}
                    {p.status === 'pending' && (
                      <div className="mt-4 pt-3 border-t border-white/10">
                        <Link
                          href={`/seller/property/${p.id}/edit`}
                          className="inline-flex text-sm font-medium text-turmeric-400 hover:text-turmeric-300 transition-colors"
                        >
                          Edit listing →
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
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
