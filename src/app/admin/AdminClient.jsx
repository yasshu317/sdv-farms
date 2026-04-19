'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'
import { sendNotification } from '../../lib/notify'
import { LogOut, Users, FileText, MapPin, RefreshCw, Home, Calendar, MessageSquare } from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge'

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
  const [saving, setSaving]               = useState(null)

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
            <span className="text-xl">🌾</span>
            <span className="font-display font-bold text-white text-lg">SDV Farms</span>
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
            ['buyers',      'Buyers',      Users],
            ['plots',       'Plots',       MapPin],
            ['properties',  'Properties',  Home],
            ['appointments','Appointments',Calendar],
            ['requests',    'Requests',    MessageSquare],
          ].map(([id, label, Icon]) => (
            <button
              key={id} onClick={() => setTab(id)}
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

        {/* Buyers */}
        {tab === 'buyers' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-800">Registered Buyers ({profiles.length})</h2>
            </div>
            {profiles.length === 0 ? (
              <p className="text-center py-12 text-gray-400 text-sm">No buyers registered yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <tr>
                      {['Name','Email','Phone','Joined'].map(h => (
                        <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {profiles.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4 font-medium text-gray-800">{p.full_name || '—'}</td>
                        <td className="px-5 py-4 text-gray-500">{p.email}</td>
                        <td className="px-5 py-4 text-gray-500">{p.phone || '—'}</td>
                        <td className="px-5 py-4 text-gray-400">
                          {new Date(p.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Seller Properties ({properties.length})</h2>
              <span className="text-xs text-gray-400">{stats.propPending} pending review</span>
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
                    {properties.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
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
                          {p.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => approveProperty(p)}
                                disabled={saving === p.id}
                                className="bg-paddy-600 hover:bg-paddy-700 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                              >
                                {saving === p.id ? '…' : 'Approve'}
                              </button>
                              <button
                                onClick={() => rejectProperty(p.id)}
                                disabled={saving === p.id}
                                className="bg-red-100 hover:bg-red-200 text-red-600 text-xs px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {p.status !== 'pending' && (
                            <span className="text-gray-300 text-xs italic">No action</span>
                          )}
                        </td>
                      </tr>
                    ))}
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
      </main>
    </div>
  )
}
