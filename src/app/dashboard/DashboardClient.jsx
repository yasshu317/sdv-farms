'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '../../lib/supabase'
import { LogOut, Home, FileText, MapPin, Phone, CheckCircle, Clock, XCircle } from 'lucide-react'
import EmailVerificationBanner from '../../components/EmailVerificationBanner'

const STATUS_BADGE = {
  pending:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  contacted: { label: 'Contacted', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  visited:   { label: 'Site Visited', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  booked:    { label: 'Booked',    color: 'bg-green-100 text-green-700 border-green-200' },
  closed:    { label: 'Closed',    color: 'bg-gray-100 text-gray-500 border-gray-200' },
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
  open: { label: 'Open', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  matched: { label: 'Matched', color: 'bg-green-100 text-green-700 border-green-200' },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-600 border-gray-200' },
}

function LandRequestBadge({ status }) {
  const s = LAND_REQ_STATUS[status] ?? LAND_REQ_STATUS.open
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${s.color}`}>
      {s.label}
    </span>
  )
}

export default function DashboardClient({ user, enquiries, interests, landRequests = [], initialTab = 'overview' }) {
  const router = useRouter()
  const [tab, setTab] = useState(initialTab)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const name = user.full_name || user.email?.split('@')[0] || 'Buyer'
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xl">🌾</span>
            <span className="font-display font-bold text-paddy-900 text-lg">SDV Farms</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-paddy-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
            <span className="text-sm text-gray-700 hidden sm:block font-medium">{name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors ml-1"
            >
              <LogOut size={15} />
              <span className="hidden sm:block">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <EmailVerificationBanner user={user} />

        {/* Welcome */}
        <div className="mb-8 mt-4">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-paddy-900">
            Welcome back, {name.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Track your SDV Farms enquiries and plot interests below.</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: FileText, label: 'Enquiries',     value: enquiries.length,                    color: 'bg-blue-50 text-blue-600' },
            { icon: MapPin,   label: 'Plot Interests', value: interests.length,                    color: 'bg-green-50 text-green-600' },
            { icon: CheckCircle, label: 'Contacted',  value: enquiries.filter(e => e.status === 'contacted' || e.status === 'visited').length, color: 'bg-purple-50 text-purple-600' },
            { icon: Clock,    label: 'Pending',        value: enquiries.filter(e => e.status === 'pending').length, color: 'bg-yellow-50 text-yellow-600' },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color} mb-3`}>
                <card.icon size={18} />
              </div>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-2xl w-fit mb-6">
          {[
            ['overview', 'Overview'],
            ['enquiries', 'Enquiries'],
            ['interests', 'Plot Interests'],
            ['land-requests', 'Land requests'],
          ].map(([id, label]) => (
            <button
              key={id} onClick={() => setTab(id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === id ? 'bg-white shadow-sm text-paddy-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {tab === 'overview' && (
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Account info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Account Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium text-gray-800">{name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-medium text-gray-800 truncate ml-4">{user.email}</span></div>
                {user.phone && <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-medium text-gray-800">{user.phone}</span></div>}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <a href="tel:7780312525" className="flex items-center gap-3 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
                  <Phone size={16} className="text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Call us now</p>
                    <p className="text-xs text-green-600">7780312525</p>
                  </div>
                </a>
                <Link href="/#contact" className="flex items-center gap-3 p-3 rounded-xl bg-turmeric-50 hover:bg-turmeric-100 transition-colors">
                  <Home size={16} className="text-turmeric-600" />
                  <div>
                    <p className="text-sm font-medium text-turmeric-800">Book a site visit</p>
                    <p className="text-xs text-turmeric-600">Fill the enquiry form</p>
                  </div>
                </Link>
                <Link href="/buyer-request" className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
                  <MapPin size={16} className="text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Post a land request</p>
                    <p className="text-xs text-blue-600">Tell us what you&apos;re looking for</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Journey status */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:col-span-2">
              <h2 className="font-semibold text-gray-800 mb-5">Your Journey</h2>
              <div className="flex items-center gap-0">
                {[
                  { step: 1, label: 'Registered',    done: true },
                  { step: 2, label: 'Enquired',      done: enquiries.length > 0 },
                  { step: 3, label: 'Site Visit',    done: enquiries.some(e => ['visited','booked'].includes(e.status)) },
                  { step: 4, label: 'Plot Booked',   done: enquiries.some(e => e.status === 'booked') },
                ].map((s, idx, arr) => (
                  <div key={s.step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                        s.done ? 'bg-paddy-600 border-paddy-600 text-white' : 'bg-white border-gray-200 text-gray-400'
                      }`}>
                        {s.done ? '✓' : s.step}
                      </div>
                      <p className={`text-xs mt-1.5 text-center ${s.done ? 'text-paddy-700 font-medium' : 'text-gray-400'}`}>
                        {s.label}
                      </p>
                    </div>
                    {idx < arr.length - 1 && (
                      <div className={`h-0.5 flex-1 mb-5 ${s.done && arr[idx+1].done ? 'bg-paddy-400' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Enquiries tab */}
        {tab === 'enquiries' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {enquiries.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <FileText size={32} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium">No enquiries yet</p>
                <p className="text-sm mt-1">Fill the contact form on the home page to get started</p>
                <Link href="/#contact" className="inline-block mt-4 text-sm text-turmeric-600 hover:underline">
                  Make an enquiry →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {enquiries.map(eq => (
                  <div key={eq.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{eq.message || 'General enquiry'}</p>
                        <p className="text-xs text-gray-400 mt-1">
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

        {/* Plot interests tab */}
        {tab === 'interests' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {interests.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <MapPin size={32} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium">No plot interests yet</p>
                <p className="text-sm mt-1">Express interest in a plot from the plot layout section</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {interests.map(pi => (
                  <div key={pi.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          Plot #{pi.plots?.plot_number ?? pi.plot_id}
                        </p>
                        {pi.plots && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {pi.plots.area_sqyds} sq.yds · ₹{pi.plots.price_per_sqyd?.toLocaleString('en-IN')}/sq.yd
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">
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

        {/* Land requests tab */}
        {tab === 'land-requests' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {landRequests.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <MapPin size={32} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium">No land requests yet</p>
                <p className="text-sm mt-1">Tell us what kind of land you&apos;re looking for</p>
                <Link
                  href="/buyer-request"
                  className="inline-block mt-4 text-sm text-turmeric-600 hover:underline font-medium"
                >
                  Post a land request →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {landRequests.map(r => (
                  <div key={r.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {[r.state, r.district].filter(Boolean).join(' · ') || 'Any location'}
                        </p>
                        {r.notes && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.notes}</p>}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(r.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <LandRequestBadge status={r.status} />
                        {r.status === 'open' && (
                          <Link
                            href={`/buyer-request/${r.id}/edit`}
                            className="text-xs font-medium text-turmeric-600 hover:text-turmeric-700"
                          >
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
