'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '../../lib/supabase'
import { LogOut, Users, FileText, MapPin, RefreshCw, CheckCircle } from 'lucide-react'

const ENQUIRY_STATUSES = ['pending', 'contacted', 'visited', 'booked', 'closed']
const PLOT_STATUSES    = ['available', 'reserved', 'sold']

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

export default function AdminClient({ enquiries: initial, profiles, plots: initialPlots }) {
  const router = useRouter()
  const [tab, setTab]             = useState('enquiries')
  const [enquiries, setEnquiries] = useState(initial)
  const [plots, setPlots]         = useState(initialPlots)
  const [saving, setSaving]       = useState(null)

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

  const stats = {
    total:     enquiries.length,
    pending:   enquiries.filter(e => e.status === 'pending').length,
    contacted: enquiries.filter(e => e.status === 'contacted').length,
    booked:    enquiries.filter(e => e.status === 'booked').length,
    available: plots.filter(p => p.status === 'available').length,
    sold:      plots.filter(p => p.status === 'sold').length,
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
        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit mb-6">
          {[['enquiries', 'Enquiries', FileText], ['buyers', 'Buyers', Users], ['plots', 'Plots', MapPin]].map(([id, label, Icon]) => (
            <button
              key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === id ? 'bg-white shadow-sm text-paddy-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Icon size={14} />{label}
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
      </main>
    </div>
  )
}
