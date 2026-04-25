'use client'
import { useState, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'
import { sendNotification } from '../../lib/notify'
import { LogOut, Users, FileText, MapPin, RefreshCw, Home, Calendar, MessageSquare, ShieldCheck, Search, Plus } from 'lucide-react'
import NextLink from 'next/link'
import StatusBadge from '../../components/ui/StatusBadge'
import { adminField, storageLinkLabel } from '../../lib/adminDisplay'

const ENQUIRY_STATUSES = ['pending', 'contacted', 'visited', 'booked', 'closed']
const PLOT_STATUSES    = ['available', 'reserved', 'sold']
const APPT_STATUSES    = ['pending', 'confirmed', 'cancelled']
const REQUEST_STATUSES = ['open', 'matched', 'closed']

const ENQUIRY_COLORS = {
  pending:   'bg-yellow-100 text-yellow-700',
  contacted: 'bg-blue-100 text-blue-700',
  visited:   'bg-purple-100 text-purple-700',
  booked:    'bg-green-100 text-green-700',
  closed:    'bg-gray-100 text-gray-500',
}
const PLOT_COLORS = {
  available: 'bg-green-500',
  reserved:  'bg-yellow-400',
  sold:      'bg-red-400',
}

export default function AdminClient({ enquiries: initial, profiles, plots: initialPlots, sellerProperties: initialProps, appointments: initialAppts, buyerRequests: initialRequests }) {
  const router = useRouter()
  const [tab, setTab]                     = useState('enquiries')
  const [enquiries, setEnquiries]         = useState(initial)
  const [plots, setPlots]                 = useState(initialPlots)
  const [properties, setProperties]       = useState(initialProps)
  const [appointments, setAppointments]   = useState(initialAppts)
  const [buyerRequests, setBuyerRequests] = useState(initialRequests)
  const [expandedPropId, setExpandedPropId] = useState(null)
  const [saving, setSaving]               = useState(null)
  const [allUsers, setAllUsers]           = useState(null)
  const [usersLoading, setUsersLoading]   = useState(false)
  const [userSearch, setUserSearch]       = useState('')
  const [roleFilter, setRoleFilter]       = useState('all')
  const [serviceBookings, setServiceBookings] = useState(null)
  const [svcLoading, setSvcLoading]       = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  async function updateEnquiryStatus(id, status) {
    setSaving(id)
    const supabase = createClient()
    await supabase.from('enquiries').update({ status }).eq('id', id)
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status } : e))
    setSaving(null)
  }

  async function updatePlotStatus(id, status) {
    setSaving(id)
    const supabase = createClient()
    await supabase.from('plots').update({ status }).eq('id', id)
    setPlots(prev => prev.map(p => p.id === id ? { ...p, status } : p))
    setSaving(null)
  }

  async function approveProperty(prop) {
    setSaving(prop.id)
    const supabase = createClient()
    const year = new Date().getFullYear()
    const approved = properties.filter(p => p.property_id).length + 1
    const propertyId = `SDV-${year}-${String(approved).padStart(3, '0')}`
    await supabase.from('seller_properties').update({ status: 'approved', property_id: propertyId }).eq('id', prop.id)
    setProperties(prev => prev.map(p => p.id === prop.id ? { ...p, status: 'approved', property_id: propertyId } : p))
    // Notify seller
    const { data: { user } } = await supabase.auth.admin ? { data: {} } : { data: {} }
    setSaving(null)
  }

  async function rejectProperty(id) {
    setSaving(id)
    const supabase = createClient()
    await supabase.from('seller_properties').update({ status: 'rejected' }).eq('id', id)
    setProperties(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected' } : p))
    setSaving(null)
  }

  async function updateAppointmentStatus(id, status) {
    setSaving(id)
    const supabase = createClient()
    await supabase.from('appointments').update({ status }).eq('id', id)
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    setSaving(null)
  }

  async function loadUsers() {
    if (usersLoading) return
    setUsersLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      setAllUsers(data.users ?? [])
    } catch {
      setAllUsers([])
    } finally {
      setUsersLoading(false)
    }
  }

  async function changeUserRole(userId, newRole) {
    setSaving(userId)
    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      })
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } finally {
      setSaving(null)
    }
  }

  async function loadServiceBookings() {
    if (svcLoading) return
    setSvcLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('service_bookings')
      .select('*')
      .order('created_at', { ascending: false })
    setServiceBookings(data ?? [])
    setSvcLoading(false)
  }

  async function updateServiceStatus(id, status) {
    setSaving(id)
    const supabase = createClient()
    await supabase.from('service_bookings').update({ status }).eq('id', id)
    setServiceBookings(prev => prev.map(s => s.id === id ? { ...s, status } : s))
    setSaving(null)
  }

  async function updateRequestStatus(id, status) {
    setSaving(id)
    const supabase = createClient()
    await supabase.from('buyer_requests').update({ status }).eq('id', id)
    setBuyerRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    setSaving(null)
  }

  const stats = {
    total:        enquiries.length,
    pending:      enquiries.filter(e => e.status === 'pending').length,
    contacted:    enquiries.filter(e => e.status === 'contacted').length,
    booked:       enquiries.filter(e => e.status === 'booked').length,
    available:    plots.filter(p => p.status === 'available').length,
    sold:         plots.filter(p => p.status === 'sold').length,
    propPending:  properties.filter(p => p.status === 'pending').length,
    propApproved: properties.filter(p => p.status === 'approved').length,
    apptPending:  appointments.filter(a => a.status === 'pending').length,
    reqOpen:      buyerRequests.filter(r => r.status === 'open').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-paddy-900 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NextLink
              href="/"
              aria-label="SDV Farms — Home"
              title="Home"
              className="flex items-center gap-2 text-white hover:text-turmeric-200 transition-colors rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              <span className="text-xl" aria-hidden>🌾</span>
              <span className="font-display font-bold text-white text-lg">SDV Farms</span>
            </NextLink>
            <span className="bg-turmeric-500/20 text-turmeric-300 text-xs px-2 py-0.5 rounded-full font-medium border border-turmeric-500/30">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.refresh()} className="text-white/60 hover:text-white transition-colors">
              <RefreshCw size={16} />
            </button>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-white/60 hover:text-red-400 transition-colors">
              <LogOut size={15} />
              <span className="hidden sm:block">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display text-2xl font-bold text-paddy-900 mb-6">Admin Dashboard</h1>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total Leads',  value: stats.total,     color: 'bg-blue-50 text-blue-600' },
            { label: 'Pending',      value: stats.pending,   color: 'bg-yellow-50 text-yellow-600' },
            { label: 'Contacted',    value: stats.contacted, color: 'bg-purple-50 text-purple-600' },
            { label: 'Booked',       value: stats.booked,    color: 'bg-green-50 text-green-600' },
            { label: 'Plots Avail.', value: stats.available, color: 'bg-paddy-50 text-paddy-600' },
            { label: 'Plots Sold',   value: stats.sold,      color: 'bg-red-50 text-red-500' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <p className={`text-2xl font-bold ${c.color.split(' ')[1]}`}>{c.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-2xl w-fit mb-6">
          {[
            ['enquiries',   'Enquiries',   FileText],
            ['users',       'Users',       ShieldCheck],
            ['plots',       'Plots',       MapPin],
            ['properties',  'Properties',  Home],
            ['appointments','Appointments',Calendar],
            ['requests',    'Requests',    MessageSquare],
            ['services',    'Services',    Users],
          ].map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => {
                setTab(id)
                if (id === 'users' && allUsers === null) loadUsers()
                if (id === 'services' && serviceBookings === null) loadServiceBookings()
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === id ? 'bg-white shadow-sm text-paddy-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Icon size={14} />{label}
              {id === 'properties' && stats.propPending > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{stats.propPending}</span>
              )}
              {id === 'appointments' && stats.apptPending > 0 && (
                <span className="bg-yellow-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{stats.apptPending}</span>
              )}
              {id === 'requests' && stats.reqOpen > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{stats.reqOpen}</span>
              )}
            </button>
          ))}
        </div>

        {/* Enquiries */}
        {tab === 'enquiries' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-800">All Enquiries ({enquiries.length})</h2>
            </div>
            {enquiries.length === 0 ? (
              <p className="text-center py-12 text-gray-400 text-sm">No enquiries yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <tr>
                      {['Name','Email','Phone','Message','Date','Status','Action'].map(h => (
                        <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {enquiries.map(eq => (
                      <tr key={eq.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4 font-medium text-gray-800 whitespace-nowrap">{eq.name}</td>
                        <td className="px-5 py-4 text-gray-500">{eq.email}</td>
                        <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                          <a href={`tel:${eq.phone}`} className="hover:text-paddy-600">{eq.phone}</a>
                        </td>
                        <td className="px-5 py-4 text-gray-500 max-w-xs truncate">{eq.message}</td>
                        <td className="px-5 py-4 text-gray-400 whitespace-nowrap">
                          {new Date(eq.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${ENQUIRY_COLORS[eq.status] ?? ENQUIRY_COLORS.pending}`}>
                            {eq.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={eq.status}
                            onChange={e => updateEnquiryStatus(eq.id, e.target.value)}
                            disabled={saving === eq.id}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:border-paddy-400 bg-white"
                          >
                            {ENQUIRY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Users & Permissions */}
        {tab === 'users' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="px-6 py-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <h2 className="font-semibold text-gray-800">
                  All Users & Permissions
                  {allUsers && <span className="text-gray-400 font-normal text-sm ml-2">({allUsers.length} total)</span>}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Change roles using the dropdown. Takes effect on next login.</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Role filter */}
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 focus:outline-none focus:border-paddy-400 bg-white"
                >
                  <option value="all">All roles</option>
                  <option value="buyer">Buyers</option>
                  <option value="seller">Sellers</option>
                  <option value="admin">Admins</option>
                </select>
                {/* Search */}
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    placeholder="Search name / email…"
                    className="text-xs border border-gray-200 rounded-lg pl-7 pr-3 py-1.5 text-gray-600 focus:outline-none focus:border-paddy-400 w-44"
                  />
                </div>
                <button
                  onClick={loadUsers}
                  disabled={usersLoading}
                  className="text-xs border border-gray-200 text-gray-500 hover:text-paddy-700 hover:border-paddy-300 rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1"
                >
                  <RefreshCw size={12} className={usersLoading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Role summary pills */}
            {allUsers && (
              <div className="px-6 py-3 border-b border-gray-50 flex gap-3 flex-wrap">
                {[
                  { role: 'buyer',  label: 'Buyers',  color: 'bg-blue-50 text-blue-600 border-blue-100' },
                  { role: 'seller', label: 'Sellers', color: 'bg-green-50 text-green-600 border-green-100' },
                  { role: 'admin',  label: 'Admins',  color: 'bg-purple-50 text-purple-600 border-purple-100' },
                ].map(({ role, label, color }) => (
                  <span key={role} className={`text-xs font-semibold px-3 py-1 rounded-full border ${color}`}>
                    {allUsers.filter(u => u.role === role).length} {label}
                  </span>
                ))}
                <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-gray-50 text-gray-500 border-gray-100">
                  {allUsers.filter(u => !u.confirmed).length} Unverified email
                </span>
              </div>
            )}

            {/* Table */}
            {usersLoading && allUsers === null ? (
              <div className="text-center py-16">
                <RefreshCw size={24} className="animate-spin text-paddy-400 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Loading users…</p>
              </div>
            ) : !allUsers ? (
              <div className="text-center py-16 px-6">
                <ShieldCheck size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-medium mb-1">Service role key required</p>
                <p className="text-gray-400 text-xs max-w-sm mx-auto">
                  Add <code className="bg-gray-100 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> to your
                  Vercel environment variables. Find it in:<br />
                  <strong>Supabase Dashboard → Project Settings → API → service_role key</strong>
                </p>
              </div>
            ) : (() => {
              const q = userSearch.toLowerCase()
              const filtered = allUsers.filter(u =>
                (roleFilter === 'all' || u.role === roleFilter) &&
                (!q || u.email?.toLowerCase().includes(q) || u.full_name?.toLowerCase().includes(q))
              )
              return filtered.length === 0 ? (
                <p className="text-center py-12 text-gray-400 text-sm">No users match your search</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                      <tr>
                        {['Name', 'Email', 'Phone', 'Role', 'Seller Type', 'Email Verified', 'Last Login', 'Joined', 'Change Role'].map(h => (
                          <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filtered.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3.5 font-medium text-gray-800 whitespace-nowrap">{u.full_name}</td>
                          <td className="px-4 py-3.5 text-gray-500 max-w-[180px] truncate">{u.email}</td>
                          <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                            {u.phone !== '—' ? <a href={`tel:${u.phone}`} className="hover:text-paddy-600">{u.phone}</a> : '—'}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              u.role === 'admin'  ? 'bg-purple-100 text-purple-700' :
                              u.role === 'seller' ? 'bg-green-100 text-green-700'  :
                                                    'bg-blue-100 text-blue-700'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-gray-400 text-xs">
                            {u.seller_type ?? '—'}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {u.confirmed
                              ? <span className="text-green-500 text-base" title="Email verified">✓</span>
                              : <span className="text-yellow-400 text-base" title="Not verified">⚠</span>}
                          </td>
                          <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                            {u.last_sign_in
                              ? new Date(u.last_sign_in).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                              : 'Never'}
                          </td>
                          <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                            {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-3.5">
                            <select
                              value={u.role}
                              onChange={e => changeUserRole(u.id, e.target.value)}
                              disabled={saving === u.id}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:border-paddy-400 bg-white disabled:opacity-50"
                            >
                              <option value="buyer">buyer</option>
                              <option value="seller">seller</option>
                              <option value="admin">admin</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })()}
          </div>
        )}

        {/* Plots */}
        {tab === 'plots' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Plot Inventory ({plots.length})</h2>
              <div className="flex gap-4 text-xs">
                {[['available','Available','bg-green-500'],['reserved','Reserved','bg-yellow-400'],['sold','Sold','bg-red-400']].map(([s,l,c])=>(
                  <span key={s} className="flex items-center gap-1.5 text-gray-500">
                    <span className={`w-2.5 h-2.5 rounded-full ${c}`}/>
                    {l}: {plots.filter(p=>p.status===s).length}
                  </span>
                ))}
              </div>
            </div>
            {plots.length === 0 ? (
              <p className="text-center py-12 text-gray-400 text-sm">No plots added yet. Add plots in your Supabase dashboard.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <tr>
                      {['Plot #','Area (sq.yds)','Price/sq.yd','Status','Update'].map(h => (
                        <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {plots.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4 font-bold text-paddy-800">#{p.plot_number}</td>
                        <td className="px-5 py-4 text-gray-600">{p.area_sqyds}</td>
                        <td className="px-5 py-4 text-gray-600">₹{p.price_per_sqyd?.toLocaleString('en-IN')}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full text-white ${PLOT_COLORS[p.status]}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={p.status}
                            onChange={e => updatePlotStatus(p.id, e.target.value)}
                            disabled={saving === p.id}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:border-paddy-400 bg-white"
                          >
                            {PLOT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {/* Seller Properties */}
        {tab === 'properties' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="font-semibold text-gray-800">Seller Properties ({properties.length})</h2>
                <p className="text-xs text-gray-400 mt-0.5">{stats.propPending} pending review</p>
              </div>
              <NextLink
                href="/admin/property/new"
                className="flex items-center gap-1.5 bg-paddy-700 hover:bg-paddy-800 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              >
                <Plus size={14} /> Add Property
              </NextLink>
            </div>
            {properties.length === 0 ? (
              <p className="text-center py-12 text-gray-400 text-sm">No seller properties submitted yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <tr>
                      {['Property ID','Location','Land','Acres','Price/Acre','Status','Actions'].map(h => (
                        <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {properties.map(p => {
                      const docs = Array.isArray(p.doc_urls) ? p.doc_urls : []
                      const photos = Array.isArray(p.photo_urls) ? p.photo_urls : []
                      const open = expandedPropId === p.id
                      return (
                        <Fragment key={p.id}>
                          <tr className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-5 py-4 font-mono text-xs text-paddy-700 font-bold">
                              {p.property_id || <span className="text-gray-300 italic">Pending</span>}
                            </td>
                            <td className="px-5 py-4 text-gray-700">
                              <div>{p.village}, {p.mandal}</div>
                              <div className="text-xs text-gray-400">{p.district}, {p.state}</div>
                            </td>
                            <td className="px-5 py-4 text-gray-500">
                              <div>{p.land_soil_type} soil</div>
                              <div className="text-xs">{p.land_used_type}</div>
                            </td>
                            <td className="px-5 py-4 text-gray-600">{p.area_acres}</td>
                            <td className="px-5 py-4 text-gray-600">₹{Number(p.expected_price).toLocaleString('en-IN')}</td>
                            <td className="px-5 py-4">
                              <StatusBadge status={p.status} />
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setExpandedPropId(open ? null : p.id)}
                                  className="text-gray-500 hover:text-gray-800 text-xs font-medium"
                                >
                                  {open ? 'Hide details' : 'All details'}
                                </button>
                                <NextLink
                                  href={`/admin/property/${p.id}/edit`}
                                  className="text-paddy-700 hover:text-paddy-900 text-xs font-medium underline-offset-2 hover:underline"
                                >
                                  Edit
                                </NextLink>
                                {p.status === 'pending' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => approveProperty(p)}
                                      disabled={saving === p.id}
                                      className="bg-paddy-600 hover:bg-paddy-700 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                      {saving === p.id ? '…' : 'Approve'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => rejectProperty(p.id)}
                                      disabled={saving === p.id}
                                      className="bg-red-100 hover:bg-red-200 text-red-600 text-xs px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                          {open && (
                            <tr className="bg-slate-50/90">
                              <td colSpan={7} className="px-5 py-4 text-xs text-gray-600 border-t border-gray-100">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-3">Full listing data</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3">
                                  <div>
                                    <p className="text-gray-400 mb-1">IDs</p>
                                    <p><span className="text-gray-500">Row ID:</span> <span className="font-mono text-[11px] break-all">{p.id}</span></p>
                                    <p className="mt-1"><span className="text-gray-500">Seller ID:</span> <span className="font-mono text-[11px] break-all">{adminField(p.seller_id)}</span></p>
                                  </div>
                                  <div>
                                    <p className="text-gray-400 mb-1">Location</p>
                                    <p>State: {adminField(p.state)}</p>
                                    <p>District: {adminField(p.district)}</p>
                                    <p>Mandal: {adminField(p.mandal)}</p>
                                    <p>Village: {adminField(p.village)}</p>
                                    <p>PIN: {adminField(p.zip_code)}</p>
                                    <p>Farmer: {adminField(p.farmer_name)}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-400 mb-1">Land & docs</p>
                                    <p>Doc type: {adminField(p.land_doc_type)}</p>
                                    <p>Road access: {p.road_access ? 'Yes' : 'No'}</p>
                                    <p>Views: {p.views ?? 0}</p>
                                  </div>
                                </div>
                                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-gray-400 mb-1">Land documents ({docs.length})</p>
                                    {docs.length === 0 ? (
                                      <p className="text-gray-400">None</p>
                                    ) : (
                                      <ul className="space-y-1">
                                        {docs.map((url, i) => (
                                          <li key={`d-${p.id}-${i}`}>
                                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-paddy-700 hover:underline break-all">
                                              {storageLinkLabel(url, i)}
                                            </a>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-gray-400 mb-1">Photos ({photos.length})</p>
                                    {photos.length === 0 ? (
                                      <p className="text-gray-400">None</p>
                                    ) : (
                                      <ul className="space-y-1">
                                        {photos.map((url, i) => (
                                          <li key={`ph-${p.id}-${i}`}>
                                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-paddy-700 hover:underline break-all">
                                              {storageLinkLabel(url, i)}
                                            </a>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                </div>
                                <p className="mt-3 text-gray-400">
                                  Submitted {p.created_at ? new Date(p.created_at).toLocaleString('en-IN') : '—'}
                                  {' · '}
                                  Updated {p.updated_at ? new Date(p.updated_at).toLocaleString('en-IN') : '—'}
                                </p>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Appointments */}
        {tab === 'appointments' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-800">All Appointments ({appointments.length})</h2>
            </div>
            {appointments.length === 0 ? (
              <p className="text-center py-12 text-gray-400 text-sm">No appointments booked yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <tr>
                      {['Date','Slot','Type','Notes','Status','Update'].map(h => (
                        <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {appointments.map(a => (
                      <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4 text-gray-700 whitespace-nowrap font-medium">{a.appointment_date}</td>
                        <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{a.time_slot}</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${a.appointment_type === 'seller' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                            {a.appointment_type || 'buyer'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-400 max-w-xs truncate">{a.notes || '—'}</td>
                        <td className="px-5 py-4"><StatusBadge status={a.status} /></td>
                        <td className="px-5 py-4">
                          <select
                            value={a.status}
                            onChange={e => updateAppointmentStatus(a.id, e.target.value)}
                            disabled={saving === a.id}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:border-paddy-400 bg-white"
                          >
                            {APPT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Buyer Requests */}
        {tab === 'requests' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-800">Buyer Land Requests ({buyerRequests.length})</h2>
            </div>
            {buyerRequests.length === 0 ? (
              <p className="text-center py-12 text-gray-400 text-sm">No land requests submitted yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <tr>
                      {['Name','Phone','Location','Requirements','Notes','Status','Update'].map(h => (
                        <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {buyerRequests.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4 font-medium text-gray-800">{r.name}</td>
                        <td className="px-5 py-4 text-gray-500">
                          <a href={`tel:${r.phone}`} className="hover:text-paddy-600">{r.phone}</a>
                        </td>
                        <td className="px-5 py-4 text-gray-500">
                          {[r.mandal, r.district, r.state].filter(Boolean).join(', ') || '—'}
                        </td>
                        <td className="px-5 py-4 text-gray-500">
                          <div>{r.land_soil_type ? `${r.land_soil_type} soil` : '—'}</div>
                          {(r.area_min || r.area_max) && (
                            <div className="text-xs">{r.area_min || 0}–{r.area_max || '∞'} acres</div>
                          )}
                          {r.price_max && <div className="text-xs">Max ₹{Number(r.price_max).toLocaleString('en-IN')}/acre</div>}
                        </td>
                        <td className="px-5 py-4 text-gray-400 max-w-xs truncate">{r.notes || '—'}</td>
                        <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                        <td className="px-5 py-4">
                          <select
                            value={r.status}
                            onChange={e => updateRequestStatus(r.id, e.target.value)}
                            disabled={saving === r.id}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:border-paddy-400 bg-white"
                          >
                            {REQUEST_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {/* Service Bookings */}
        {tab === 'services' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-800">
                  Service Enquiries {serviceBookings && <span className="text-gray-400 font-normal text-sm">({serviceBookings.length})</span>}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Phase II service booking requests from customers</p>
              </div>
              <button onClick={loadServiceBookings} disabled={svcLoading}
                className="text-xs border border-gray-200 text-gray-500 hover:text-paddy-700 hover:border-paddy-300 rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1">
                <RefreshCw size={12} className={svcLoading ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>

            {svcLoading && !serviceBookings ? (
              <div className="text-center py-12">
                <RefreshCw size={20} className="animate-spin text-paddy-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Loading…</p>
              </div>
            ) : !serviceBookings || serviceBookings.length === 0 ? (
              <p className="text-center py-12 text-gray-400 text-sm">No service enquiries yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <tr>
                      {['Name', 'Phone', 'Email', 'Service', 'Location', 'Area', 'Notes', 'Date', 'Status', 'Update'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {serviceBookings.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3.5 font-medium text-gray-800 whitespace-nowrap">{s.full_name}</td>
                        <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                          <a href={`tel:${s.phone}`} className="hover:text-paddy-600">{s.phone}</a>
                        </td>
                        <td className="px-4 py-3.5 text-gray-500 max-w-[160px] truncate">{s.email}</td>
                        <td className="px-4 py-3.5">
                          <span className="bg-turmeric-50 text-turmeric-700 border border-turmeric-100 text-xs px-2 py-0.5 rounded-full font-medium capitalize whitespace-nowrap">
                            {s.service_type?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-gray-500 text-xs max-w-[140px] truncate">{s.property_location || '—'}</td>
                        <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">{s.area_acres ? `${s.area_acres} ac` : '—'}</td>
                        <td className="px-4 py-3.5 text-gray-400 text-xs max-w-[160px] truncate">{s.notes || '—'}</td>
                        <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                          {new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={s.status} />
                        </td>
                        <td className="px-4 py-3.5">
                          <select
                            value={s.status}
                            onChange={e => updateServiceStatus(s.id, e.target.value)}
                            disabled={saving === s.id}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:border-paddy-400 bg-white disabled:opacity-50"
                          >
                            {['pending', 'contacted', 'in_progress', 'completed', 'cancelled'].map(st => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
