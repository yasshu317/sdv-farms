'use client'
import { useState, Fragment, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'
import { LogOut, Users, FileText, MapPin, RefreshCw, Home, Calendar, MessageSquare, ShieldCheck, Search, Plus, Flag, Star } from 'lucide-react'
import NextLink from 'next/link'
import StatusBadge from '../../components/ui/StatusBadge'
import { adminField, storageLinkLabel } from '../../lib/adminDisplay'
import { isAdminOnly } from '../../lib/roles'
import { formatAcresFromSqYards } from '../../lib/plotDisplay'
import BrandHeadingAccent from '../../components/BrandHeadingAccent'

const ENQUIRY_STATUSES = ['pending', 'contacted', 'visited', 'booked', 'closed']
const PLOT_STATUSES    = ['available', 'reserved', 'sold']
const VERIFY_STATUSES = ['pending', 'in_review', 'verified', 'rejected', 'na']
const APPT_STATUSES    = ['pending', 'confirmed', 'cancelled', 'completed', 'no_show', 'rescheduled']
const REQUEST_STATUSES = ['open', 'in_progress', 'matched', 'closed']
const SDVF_STATUSES = ['checking', 'approved', 'rejected']
const SELLER_INTEREST_OPTIONS = [
  { value: '', label: '—' },
  { value: 'urgent_sale', label: 'Urgent sale' },
  { value: 'ready_to_sale', label: 'Ready to sell' },
  { value: 'interested', label: 'Interested' },
]

const FLAG_KEY_RE = /^[a-z][a-z0-9_]*$/

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

function isoToDatetimeLocal(val) {
  if (!val) return ''
  const d = new Date(val)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function datetimeLocalToIso(local) {
  if (!local) return null
  const d = new Date(local)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

function payloadTextMap(flags) {
  const m = {}
  for (const f of flags || []) m[f.id] = JSON.stringify(f.payload ?? {}, null, 2)
  return m
}

function flagRowFieldsMap(flags) {
  const m = {}
  for (const f of flags || []) {
    m[f.id] = { description: f.description ?? '', sort: String(f.sort_order ?? 0) }
  }
  return m
}

export default function AdminClient({
  viewerRole = 'admin',
  buyerRequestNotesById: initialNotesById = {},
  enquiries: initial,
  plots: initialPlots,
  sellerProperties: initialProps,
  appointments: initialAppts,
  buyerRequests: initialRequests,
  featureFlags: initialFeatureFlags = [],
}) {
  const canManageUsers = isAdminOnly(viewerRole)
  const isStaffViewer = viewerRole === 'staff'

  const TAB_DEFS = [
    ['enquiries',   'Enquiries',   FileText],
    ['users',       'Users',       ShieldCheck],
    ['plots',       'Plots',       MapPin],
    ['properties',  'Properties',  Home],
    ['appointments','Appointments',Calendar],
    ['requests',    'Requests',    MessageSquare],
    ['flags',       'Flags',       Flag],
    ['services',    'Services',    Users],
    ['feedback',    'Feedback',    Star],
  ]
  const visibleTabs = canManageUsers ? TAB_DEFS : TAB_DEFS.filter(([id]) => id !== 'users')

  const router = useRouter()
  const [tab, setTab]                     = useState('enquiries')
  const [enquiries, setEnquiries]         = useState(initial)
  const [plots, setPlots]                 = useState(initialPlots)
  const [properties, setProperties]       = useState(initialProps)
  const [appointments, setAppointments]   = useState(initialAppts)
  const [buyerRequests, setBuyerRequests] = useState(initialRequests)
  const [notesByRequest, setNotesByRequest] = useState(() =>
    typeof structuredClone === 'function' ? structuredClone(initialNotesById) : { ...initialNotesById },
  )
  const [expandedRequestId, setExpandedRequestId] = useState(null)
  const [newNoteByRequest, setNewNoteByRequest] = useState({})
  const [expandedPropId, setExpandedPropId] = useState(null)
  const [saving, setSaving]               = useState(null)
  const [allUsers, setAllUsers]           = useState(null)
  const [usersLoading, setUsersLoading]   = useState(false)
  const [userSearch, setUserSearch]       = useState('')
  const [roleFilter, setRoleFilter]       = useState('all')
  const [serviceBookings, setServiceBookings] = useState(null)
  const [svcLoading, setSvcLoading]       = useState(false)

  const [feedback, setFeedback]           = useState(null)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [expandedFeedbackId, setExpandedFeedbackId] = useState(null)
  const [feedbackNoteEdit, setFeedbackNoteEdit]     = useState({})

  const [featureFlags, setFeatureFlags]   = useState(initialFeatureFlags ?? [])
  const [payloadTexts, setPayloadTexts]   = useState(() => payloadTextMap(initialFeatureFlags))
  const [flagRowFields, setFlagRowFields] = useState(() => flagRowFieldsMap(initialFeatureFlags))
  const [flagBanner, setFlagBanner]       = useState('')
  const [flagDraft, setFlagDraft]         = useState({
    key: '', enabled: false, description: '', sort_order: '100', payload: '{}',
  })

  useEffect(() => {
    const list = initialFeatureFlags ?? []
    setFeatureFlags(list)
    setPayloadTexts(payloadTextMap(list))
    setFlagRowFields(flagRowFieldsMap(list))
  }, [initialFeatureFlags])

  useEffect(() => {
    if (!canManageUsers && tab === 'users') setTab('enquiries')
  }, [canManageUsers, tab])

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
    await patchAppointment(id, { status })
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

  async function loadFeedback() {
    if (feedbackLoading) return
    setFeedbackLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('business_feedback')
      .select('*')
      .order('created_at', { ascending: false })
    setFeedback(data ?? [])
    setFeedbackLoading(false)
  }

  async function updateFeedbackStatus(id, status) {
    setSaving(id)
    const supabase = createClient()
    await supabase.from('business_feedback').update({ status }).eq('id', id)
    setFeedback(prev => prev.map(f => f.id === id ? { ...f, status } : f))
    setSaving(null)
  }

  async function saveFeedbackNote(id) {
    const notes = (feedbackNoteEdit[id] ?? '').trim()
    setSaving(id)
    const supabase = createClient()
    await supabase.from('business_feedback').update({ admin_notes: notes || null, status: 'read' }).eq('id', id)
    setFeedback(prev => prev.map(f => f.id === id ? { ...f, admin_notes: notes || null, status: f.status === 'new' ? 'read' : f.status } : f))
    setSaving(null)
  }

  async function patchBuyerRequest(id, patch) {
    setSaving(id)
    const supabase = createClient()
    await supabase.from('buyer_requests').update(patch).eq('id', id)
    setBuyerRequests(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)))
    setSaving(null)
  }

  async function addBuyerRequestNote(requestId) {
    const body = (newNoteByRequest[requestId] || '').trim()
    if (!body) return
    setSaving(requestId)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('buyer_request_notes')
      .insert({ buyer_request_id: requestId, body, author_user_id: user?.id ?? null })
      .select('*')
      .maybeSingle()
    if (!error && data) {
      setNotesByRequest(prev => ({
        ...prev,
        [requestId]: [...(prev[requestId] || []), data],
      }))
      setNewNoteByRequest(prev => ({ ...prev, [requestId]: '' }))
    }
    setSaving(null)
  }

  async function updatePlotVerify(id, patch) {
    setSaving(id)
    const supabase = createClient()
    await supabase.from('plots').update(patch).eq('id', id)
    setPlots(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)))
    setSaving(null)
  }

  async function updateSellerInterest(id, seller_interest) {
    setSaving(id)
    const supabase = createClient()
    const val = seller_interest || null
    await supabase.from('seller_properties').update({ seller_interest: val }).eq('id', id)
    setProperties(prev => prev.map(p => (p.id === id ? { ...p, seller_interest: val } : p)))
    setSaving(null)
  }

  async function patchAppointment(id, patch) {
    setSaving(id)
    const supabase = createClient()
    await supabase.from('appointments').update(patch).eq('id', id)
    setAppointments(prev => prev.map(a => (a.id === id ? { ...a, ...patch } : a)))
    setSaving(null)
  }

  async function saveUserOccupation(userId, occupation) {
    setSaving(userId)
    const supabase = createClient()
    await supabase.from('profiles').update({ occupation: occupation || null }).eq('id', userId)
    setAllUsers(prev =>
      prev ? prev.map(u => (u.id === userId ? { ...u, occupation: occupation || null } : u)) : prev,
    )
    setSaving(null)
  }

  async function updateRequestStatus(id, status) {
    await patchBuyerRequest(id, { status })
  }

  async function setFlagEnabledOnly(row, enabled) {
    setFlagBanner('')
    setSaving(row.id)
    const supabase = createClient()
    const { error } = await supabase.from('feature_flags').update({ enabled }).eq('id', row.id)
    setSaving(null)
    if (error) setFlagBanner(error.message)
    else {
      router.refresh()
      await reloadFeatureFlags()
    }
  }

  async function reloadFeatureFlags() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('key', { ascending: true })
    if (!error && data) {
      setFeatureFlags(data)
      setPayloadTexts(payloadTextMap(data))
      setFlagRowFields(flagRowFieldsMap(data))
    }
  }

  function parseFlagPayload(jsonText, label = 'payload') {
    const t = jsonText.trim() || '{}'
    let parsed
    try {
      parsed = JSON.parse(t)
    } catch (e) {
      throw new Error(`${label}: invalid JSON (${e.message})`)
    }
    if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed
    throw new Error(`${label} must be a JSON object (not array or primitive)`)
  }

  async function saveFeatureFlagRow(row) {
    setFlagBanner('')
    let payloadObj
    try {
      payloadObj = parseFlagPayload(payloadTexts[row.id] ?? JSON.stringify(row.payload ?? {}))
    } catch (e) {
      setFlagBanner(e.message)
      return
    }
    const rf = flagRowFields[row.id]
    const description = rf?.description ?? ''
    const so = Number.parseInt(rf?.sort ?? '', 10)
    const sort_order = Number.isNaN(so) ? row.sort_order ?? 0 : so
    setSaving(row.id)
    const supabase = createClient()
    const { error } = await supabase.from('feature_flags').update({
      enabled: row.enabled,
      description: description?.trim() || null,
      sort_order,
      payload: payloadObj,
    }).eq('id', row.id)
    setSaving(null)
    if (error) setFlagBanner(error.message)
    else {
      router.refresh()
      await reloadFeatureFlags()
    }
  }

  async function createFeatureFlag() {
    setFlagBanner('')
    const key = flagDraft.key.trim().toLowerCase().replace(/\s+/g, '_')
    if (!FLAG_KEY_RE.test(key)) {
      setFlagBanner('Key must match: lowercase letters, digits, underscores; start with a letter (e.g. new_home_hero)')
      return
    }
    let payloadObj = {}
    try {
      payloadObj = parseFlagPayload(flagDraft.payload ?? '{}')
    } catch (e) {
      setFlagBanner(e.message)
      return
    }
    setSaving('new-flag')
    const supabase = createClient()
    const so = Number.parseInt(flagDraft.sort_order, 10)
    const sort_order = Number.isNaN(so) ? 100 : so
    const { error } = await supabase.from('feature_flags').insert({
      key,
      enabled: !!flagDraft.enabled,
      description: flagDraft.description?.trim() || null,
      sort_order,
      payload: payloadObj,
      metadata: {},
    })
    setSaving(null)
    if (error) {
      setFlagBanner(error.message.includes('duplicate') ? `Key "${key}" already exists.` : error.message)
      return
    }
    setFlagDraft({ key: '', enabled: false, description: '', sort_order: '100', payload: '{}' })
    router.refresh()
    await reloadFeatureFlags()
  }

  async function deleteFeatureFlag(row) {
    if (!confirm(`Remove flag "${row.key}" permanently? Apps using this key stop seeing it.`)) return
    setSaving(row.id)
    const supabase = createClient()
    await supabase.from('feature_flags').delete().eq('id', row.id)
    setSaving(null)
    router.refresh()
    await reloadFeatureFlags()
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
    reqOpen:      buyerRequests.filter(r => r.status === 'open' || r.status === 'in_progress').length,
    feedbackNew:  feedback ? feedback.filter(f => f.status === 'new').length : 0,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-paddy-900 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🌾</span>
            <div className="inline-flex flex-col items-stretch leading-tight">
              <span className="font-display font-bold text-white text-lg">SDV Farms</span>
              <BrandHeadingAccent variant="navbar" className="max-w-[7rem] opacity-95" />
            </div>
            <span className="bg-turmeric-500/20 text-turmeric-300 text-xs px-2 py-0.5 rounded-full font-medium border border-turmeric-500/30">
              {isStaffViewer ? 'Staff' : 'Admin'}
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
        <h1 className="font-display text-2xl font-bold text-paddy-900 mb-6">
          {isStaffViewer ? 'Operations hub' : 'Admin Dashboard'}
        </h1>

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
          {visibleTabs.map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => {
                setTab(id)
                if (id === 'users' && allUsers === null) loadUsers()
                if (id === 'services' && serviceBookings === null) loadServiceBookings()
                if (id === 'feedback' && feedback === null) loadFeedback()
                if (id === 'flags') {
                  setFlagBanner('')
                  reloadFeatureFlags()
                }
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
              {id === 'feedback' && stats.feedbackNew > 0 && (
                <span className="bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{stats.feedbackNew}</span>
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
                  <option value="staff">Staff</option>
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
                  { role: 'staff',  label: 'Staff',   color: 'bg-amber-50 text-amber-700 border-amber-100' },
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
                        {['Name', 'Email', 'Phone', 'Role', 'Occupation', 'Seller Type', 'Email Verified', 'Last Login', 'Joined', 'Change Role'].map(h => (
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
                              u.role === 'staff' ? 'bg-amber-100 text-amber-800' :
                              u.role === 'seller' ? 'bg-green-100 text-green-700'  :
                                                    'bg-blue-100 text-blue-700'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <input
                              defaultValue={u.occupation ?? ''}
                              onBlur={(e) => {
                                const v = e.target.value.trim()
                                if (v !== (u.occupation || '')) saveUserOccupation(u.id, v)
                              }}
                              disabled={saving === u.id}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:border-paddy-400 w-36 max-w-full disabled:opacity-50"
                              placeholder="—"
                            />
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
                              <option value="staff">staff</option>
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
                      {['Plot #', 'Area (sq.yds)', 'Acres', 'Price/sq.yd', 'Status', 'Docs', 'Legal', 'Physical', 'Update'].map(h => (
                        <th key={h} className="px-3 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {plots.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-3 py-4 font-bold text-paddy-800 whitespace-nowrap">#{p.plot_number}</td>
                        <td className="px-3 py-4 text-gray-600 whitespace-nowrap">{p.area_sqyds}</td>
                        <td className="px-3 py-4 text-gray-500 text-xs whitespace-nowrap">{formatAcresFromSqYards(p.area_sqyds)}</td>
                        <td className="px-3 py-4 text-gray-600 whitespace-nowrap">₹{p.price_per_sqyd?.toLocaleString('en-IN')}</td>
                        <td className="px-3 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full text-white ${PLOT_COLORS[p.status]}`}>
                            {p.status}
                          </span>
                        </td>
                        {(['document_status', 'legal_verify_status', 'physical_verify_status']).map(field => (
                          <td key={field} className="px-3 py-4">
                            <select
                              value={p[field] || 'pending'}
                              onChange={e => updatePlotVerify(p.id, { [field]: e.target.value })}
                              disabled={saving === p.id}
                              className="text-xs border border-gray-200 rounded-lg px-1.5 py-1 text-gray-600 focus:outline-none focus:border-paddy-400 bg-white max-w-[110px]"
                            >
                              {VERIFY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                        ))}
                        <td className="px-3 py-4">
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
              {!isStaffViewer && (
              <div className="flex flex-wrap items-center gap-2 justify-end">
                <NextLink
                  href="/admin/property/import"
                  className="flex items-center gap-1.5 border border-gray-200 hover:border-paddy-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                >
                  Import Excel
                </NextLink>
                <NextLink
                  href="/admin/property/new"
                  className="flex items-center gap-1.5 bg-paddy-700 hover:bg-paddy-800 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                >
                  <Plus size={14} /> Add Property
                </NextLink>
              </div>
              )}
            </div>
            {properties.length === 0 ? (
              <p className="text-center py-12 text-gray-400 text-sm">No seller properties submitted yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <tr>
                      {['Property ID','Location','Land','Acres','Price/Acre','Seller interest','Status','Actions'].map(h => (
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
                              <select
                                value={p.seller_interest || ''}
                                onChange={e => updateSellerInterest(p.id, e.target.value)}
                                disabled={saving === p.id}
                                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:border-paddy-400 bg-white max-w-[140px]"
                              >
                                {SELLER_INTEREST_OPTIONS.map(o => (
                                  <option key={o.value || 'none'} value={o.value}>{o.label}</option>
                                ))}
                              </select>
                            </td>
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
                                {p.status === 'pending' && !isStaffViewer && (
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
                              <td colSpan={8} className="px-5 py-4 text-xs text-gray-600 border-t border-gray-100">
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
              <p className="text-xs text-gray-400 mt-1">Assign staff (user UUID), link a buyer land request id, optional SLA reminder.</p>
            </div>
            {appointments.length === 0 ? (
              <p className="text-center py-12 text-gray-400 text-sm">No appointments booked yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[980px]">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <tr>
                      {['Date', 'Slot', 'Type', 'Notes', 'Status', 'Assignee', 'Buyer req.', 'SLA target', 'Update'].map(h => (
                        <th key={h} className="px-3 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {appointments.map(a => (
                      <tr key={a.id} className="hover:bg-gray-50/50 transition-colors align-top">
                        <td className="px-3 py-4 text-gray-700 whitespace-nowrap font-medium">{a.appointment_date}</td>
                        <td className="px-3 py-4 text-gray-600 whitespace-nowrap">{a.time_slot}</td>
                        <td className="px-3 py-4">
                          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${a.appointment_type === 'seller' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                            {a.appointment_type || 'buyer'}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-gray-400 max-w-[160px] text-xs truncate" title={a.notes}>{a.notes || '—'}</td>
                        <td className="px-3 py-4"><StatusBadge status={a.status} /></td>
                        <td className="px-3 py-4">
                          <input
                            defaultValue={a.assigned_to || ''}
                            onBlur={(e) => {
                              const v = e.target.value.trim()
                              const next = v || null
                              if (next !== (a.assigned_to || null)) patchAppointment(a.id, { assigned_to: next })
                            }}
                            disabled={saving === a.id}
                            placeholder="User UUID"
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 font-mono w-[120px]"
                          />
                        </td>
                        <td className="px-3 py-4">
                          <input
                            defaultValue={a.related_buyer_request_id || ''}
                            onBlur={(e) => {
                              const v = e.target.value.trim()
                              const next = v || null
                              if (next !== (a.related_buyer_request_id || null))
                                patchAppointment(a.id, { related_buyer_request_id: next })
                            }}
                            disabled={saving === a.id}
                            placeholder="Request UUID"
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 font-mono w-[120px]"
                          />
                        </td>
                        <td className="px-3 py-4">
                          <input
                            type="datetime-local"
                            defaultValue={isoToDatetimeLocal(a.sla_target_at)}
                            onBlur={(e) => {
                              const iso = datetimeLocalToIso(e.target.value)
                              const prev = a.sla_target_at
                              const same = (!iso && !prev) || (iso && prev && new Date(prev).toISOString() === iso)
                              if (!same) patchAppointment(a.id, { sla_target_at: iso })
                            }}
                            disabled={saving === a.id}
                            className="text-xs border border-gray-200 rounded-lg px-1 py-1"
                          />
                        </td>
                        <td className="px-3 py-4">
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
              <p className="text-xs text-gray-400 mt-1">
                Preferred search area uses state / district / mandal below; buyer residence is separate (expand row).
              </p>
            </div>
            {buyerRequests.length === 0 ? (
              <p className="text-center py-12 text-gray-400 text-sm">No land requests submitted yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <tr>
                      {['Name', 'Phone', 'Residence', 'Preferred search', 'SDVF', 'Notes', 'Status', 'Ops', ''].map(h => (
                        <th key={h || 'expand'} className="px-4 py-3 text-left font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {buyerRequests.map(r => {
                      const open = expandedRequestId === r.id
                      const pref = [r.mandal, r.district, r.state].filter(Boolean).join(', ') || '—'
                      const res = [r.buyer_residence_city, r.buyer_residence_state].filter(Boolean).join(', ')
                      const thread = notesByRequest[r.id] || []
                      const sdvf = r.sdvf_status || 'checking'

                      return (
                        <Fragment key={r.id}>
                          <tr className="hover:bg-gray-50/50 transition-colors align-top">
                            <td className="px-4 py-4 font-medium text-gray-800 whitespace-nowrap">{r.name}</td>
                            <td className="px-4 py-4 text-gray-500 whitespace-nowrap">
                              <a href={`tel:${r.phone}`} className="hover:text-paddy-600">{r.phone}</a>
                            </td>
                            <td className="px-4 py-4 text-gray-500 text-xs max-w-[120px]" title={r.buyer_residence_notes || ''}>
                              {res || <span className="text-gray-400">—</span>}
                            </td>
                            <td className="px-4 py-4 text-gray-500 text-xs">{pref}</td>
                            <td className="px-4 py-4">
                              <select
                                value={sdvf}
                                onChange={e =>
                                  patchBuyerRequest(r.id, { sdvf_status: e.target.value })}
                                disabled={saving === r.id}
                                className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 bg-white max-w-[100px]"
                              >
                                {SDVF_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </td>
                            <td className="px-4 py-4 text-gray-400 max-w-[140px] truncate text-xs" title={r.notes}>{r.notes || '—'}</td>
                            <td className="px-4 py-4"><StatusBadge status={r.status} /></td>
                            <td className="px-4 py-4">
                              <textarea
                                defaultValue={r.ops_comment || ''}
                                rows={2}
                                onBlur={e => {
                                  const v = e.target.value
                                  if (v !== (r.ops_comment || '')) patchBuyerRequest(r.id, { ops_comment: v || null })
                                }}
                                placeholder="Ops note…"
                                disabled={saving === r.id}
                                className="text-xs border border-gray-200 rounded-lg px-2 py-1 w-[140px] resize-y min-h-[2.25rem]"
                              />
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => setExpandedRequestId(open ? null : r.id)}
                                className="text-xs text-paddy-700 font-medium hover:underline"
                              >
                                {open ? 'Hide' : 'More'}
                              </button>
                              <select
                                value={r.status}
                                onChange={e => updateRequestStatus(r.id, e.target.value)}
                                disabled={saving === r.id}
                                className="mt-1 block text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 bg-white"
                              >
                                {REQUEST_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </td>
                          </tr>
                          {open && (
                            <tr className="bg-slate-50/80 border-t border-gray-100">
                              <td colSpan={9} className="px-6 py-4 space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs">
                                  <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">Buyer residence</p>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                      <span className="text-gray-500">City:</span>
                                      <span>{r.buyer_residence_city || '—'}</span>
                                      <span className="text-gray-500 ml-3">State:</span>
                                      <span>{r.buyer_residence_state || '—'}</span>
                                    </div>
                                    <p className="text-gray-600 whitespace-pre-wrap">{r.buyer_residence_notes || 'No residence notes.'}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">Search requirements</p>
                                    <div>{r.land_soil_type ? `${r.land_soil_type} soil` : '—'}</div>
                                    {(r.area_min || r.area_max) && (
                                      <div className="mt-1">{r.area_min || 0}–{r.area_max || '∞'} acres</div>
                                    )}
                                    {r.price_max && (
                                      <div className="mt-1">Max ₹{Number(r.price_max).toLocaleString('en-IN')}/acre</div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">SDVF reason</p>
                                    <textarea
                                      defaultValue={r.sdvf_reason || ''}
                                      rows={3}
                                      className="w-full text-xs border border-gray-200 rounded-lg px-2 py-2"
                                      placeholder="Reason for SDVF outcome…"
                                      disabled={saving === r.id}
                                      onBlur={e => {
                                        const v = e.target.value
                                        if (v !== (r.sdvf_reason || '')) patchBuyerRequest(r.id, { sdvf_reason: v || null })
                                      }}
                                    />
                                  </div>
                                </div>

                                <div className="border-t border-gray-100 pt-3 mt-3">
                                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
                                    Ops notes ({thread.length})
                                  </p>
                                  <ul className="space-y-2 max-h-52 overflow-y-auto mb-3">
                                    {thread.length === 0 ? (
                                      <li className="text-gray-400">No threaded notes yet.</li>
                                    ) : (
                                      thread.map(n => (
                                        <li key={n.id} className="text-gray-700 border border-gray-100 rounded-lg px-3 py-2 bg-white">
                                          <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                            {new Date(n.created_at).toLocaleString('en-IN')}
                                          </span>
                                          <div className="mt-1 whitespace-pre-wrap">{n.body}</div>
                                        </li>
                                      ))
                                    )}
                                  </ul>
                                  <div className="flex flex-wrap gap-2 items-end">
                                    <textarea
                                      value={newNoteByRequest[r.id] ?? ''}
                                      onChange={e =>
                                        setNewNoteByRequest(prev => ({ ...prev, [r.id]: e.target.value }))
                                      }
                                      placeholder="Add an internal note…"
                                      rows={2}
                                      className="flex-1 min-w-[220px] text-xs border border-gray-200 rounded-lg px-2 py-2 bg-white"
                                    />
                                    <button
                                      type="button"
                                      disabled={saving === r.id}
                                      onClick={() => addBuyerRequestNote(r.id)}
                                      className="text-xs bg-paddy-700 text-white px-3 py-2 rounded-lg hover:bg-paddy-800 disabled:opacity-50"
                                    >
                                      Post note
                                    </button>
                                  </div>
                                  {r.buyer_id && (
                                    <p className="text-[10px] text-gray-400 mt-2 font-mono">Buyer user id: {r.buyer_id}</p>
                                  )}
                                </div>
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

        {/* Feature flags / remote config */}
        {tab === 'flags' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h2 className="font-semibold text-gray-800">Feature flags & remote config</h2>
                <p className="text-xs text-gray-400 mt-1 max-w-2xl">
                  Each row is a stable{' '}
                  <code className="bg-gray-100 px-1 rounded text-[11px]">key</code>.{' '}
                  <code className="bg-gray-100 px-1 rounded text-[11px]">payload</code>{' '}
                  is merged into{' '}
                  <code className="bg-gray-100 px-1 rounded text-[11px]">GET /api/feature-flags</code>{' '}
                  (cached briefly; JSON is public — do not store secrets). Extra fields can live in{' '}
                  <code className="bg-gray-100 px-1 rounded text-[11px]">metadata</code> in Supabase SQL only for now.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFlagBanner('')
                  reloadFeatureFlags()
                }}
                className="shrink-0 text-xs border border-gray-200 text-gray-500 hover:text-paddy-700 hover:border-paddy-300 rounded-lg px-3 py-1.5 flex items-center gap-1"
              >
                <RefreshCw size={12} /> Reload
              </button>
            </div>
            {flagBanner && (
              <div className="mx-6 mt-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{flagBanner}</div>
            )}
            <div className="px-6 py-5 space-y-8">
              <section>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Add flag</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <input
                    placeholder="key_snake_case"
                    value={flagDraft.key}
                    onChange={e => setFlagDraft(f => ({ ...f, key: e.target.value }))}
                    className="text-xs border border-gray-200 rounded-lg px-3 py-2 font-mono"
                  />
                  <input
                    type="number"
                    placeholder="Sort order"
                    value={flagDraft.sort_order}
                    onChange={e => setFlagDraft(f => ({ ...f, sort_order: e.target.value }))}
                    className="text-xs border border-gray-200 rounded-lg px-3 py-2"
                  />
                  <label className="flex items-center gap-2 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={flagDraft.enabled}
                      onChange={e => setFlagDraft(f => ({ ...f, enabled: e.target.checked }))}
                    />
                    Enabled
                  </label>
                  <input
                    placeholder="Description"
                    value={flagDraft.description}
                    onChange={e => setFlagDraft(f => ({ ...f, description: e.target.value }))}
                    className="text-xs border border-gray-200 rounded-lg px-3 py-2 sm:col-span-2 lg:col-span-1"
                  />
                </div>
                <textarea
                  value={flagDraft.payload}
                  onChange={e => setFlagDraft(f => ({ ...f, payload: e.target.value }))}
                  rows={4}
                  placeholder='JSON object e.g. {}'
                  className="mt-3 w-full font-mono text-xs border border-gray-200 rounded-xl px-3 py-2 bg-gray-50"
                />
                <button
                  type="button"
                  disabled={saving === 'new-flag'}
                  onClick={createFeatureFlag}
                  className="mt-3 text-xs bg-paddy-700 hover:bg-paddy-800 text-white font-medium px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  Create flag
                </button>
              </section>

              <section>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Flags ({featureFlags.length})
                </p>
                {featureFlags.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    No rows yet — apply <code className="bg-gray-100 px-1 rounded">phase9_feature_flags.sql</code> then refresh, or create a flag above.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {featureFlags.map(ff => (
                      <div key={ff.id} className="border border-gray-100 rounded-2xl p-4 bg-gray-50/80">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <span className="font-mono text-sm font-bold text-paddy-800">{ff.key}</span>
                          <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!ff.enabled}
                              disabled={saving === ff.id}
                              onChange={e => setFlagEnabledOnly(ff, e.target.checked)}
                            />
                            On
                          </label>
                          <button
                            type="button"
                            disabled={saving === ff.id}
                            onClick={() => deleteFeatureFlag(ff)}
                            className="text-xs text-red-600 hover:underline ml-auto"
                          >
                            Delete
                          </button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="text-[10px] uppercase text-gray-400 block mb-1">Sort</label>
                            <input
                              value={flagRowFields[ff.id]?.sort ?? '0'}
                              onChange={e => setFlagRowFields(prev => ({
                                ...prev,
                                [ff.id]: {
                                  description: prev[ff.id]?.description ?? ff.description ?? '',
                                  sort: e.target.value,
                                },
                              }))}
                              className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase text-gray-400 block mb-1">Description</label>
                            <input
                              value={flagRowFields[ff.id]?.description ?? ''}
                              onChange={e => setFlagRowFields(prev => ({
                                ...prev,
                                [ff.id]: {
                                  description: e.target.value,
                                  sort: prev[ff.id]?.sort ?? String(ff.sort_order ?? 0),
                                },
                              }))}
                              className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
                            />
                          </div>
                        </div>
                        <label className="text-[10px] uppercase text-gray-400 block mt-3 mb-1">Payload (JSON object)</label>
                        <textarea
                          value={payloadTexts[ff.id] ?? '{}'}
                          onChange={e => setPayloadTexts(prev => ({ ...prev, [ff.id]: e.target.value }))}
                          rows={5}
                          className="w-full font-mono text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white"
                        />
                        <button
                          type="button"
                          disabled={saving === ff.id}
                          onClick={() => saveFeatureFlagRow(ff)}
                          className="mt-2 text-xs bg-white border border-paddy-200 text-paddy-800 font-medium px-3 py-1.5 rounded-lg hover:bg-paddy-50 disabled:opacity-50"
                        >
                          Save changes
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
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
        {/* Business Feedback */}
        {tab === 'feedback' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-800">
                  Business Feedback
                  {feedback && <span className="text-gray-400 font-normal text-sm ml-2">({feedback.length})</span>}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Feedback submitted by businesses via the feedback form</p>
              </div>
              <button
                onClick={loadFeedback}
                disabled={feedbackLoading}
                className="text-xs border border-gray-200 text-gray-500 hover:text-paddy-700 hover:border-paddy-300 rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1"
              >
                <RefreshCw size={12} className={feedbackLoading ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>

            {/* Status summary pills */}
            {feedback && feedback.length > 0 && (
              <div className="px-6 py-3 border-b border-gray-50 flex gap-3 flex-wrap">
                {[
                  { status: 'new',      label: 'New',      color: 'bg-orange-50 text-orange-600 border-orange-100' },
                  { status: 'read',     label: 'Read',     color: 'bg-blue-50 text-blue-600 border-blue-100' },
                  { status: 'replied',  label: 'Replied',  color: 'bg-green-50 text-green-600 border-green-100' },
                  { status: 'archived', label: 'Archived', color: 'bg-gray-50 text-gray-500 border-gray-200' },
                ].map(({ status, label, color }) => (
                  <span key={status} className={`text-xs font-semibold px-3 py-1 rounded-full border ${color}`}>
                    {feedback.filter(f => f.status === status).length} {label}
                  </span>
                ))}
              </div>
            )}

            {feedbackLoading && !feedback ? (
              <div className="text-center py-12">
                <RefreshCw size={20} className="animate-spin text-paddy-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Loading feedback…</p>
              </div>
            ) : !feedback || feedback.length === 0 ? (
              <div className="text-center py-16 px-6">
                <Star size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-medium mb-1">No feedback yet</p>
                <p className="text-gray-400 text-xs max-w-sm mx-auto">
                  Share the feedback form with businesses:{' '}
                  <a
                    href="/feedback"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-turmeric-600 hover:underline font-medium"
                  >
                    /feedback
                  </a>
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {feedback.map(fb => {
                  const isExpanded = expandedFeedbackId === fb.id
                  const TYPE_COLORS = {
                    general:     'bg-gray-100 text-gray-600',
                    suggestion:  'bg-blue-50 text-blue-700',
                    complaint:   'bg-red-50 text-red-700',
                    partnership: 'bg-purple-50 text-purple-700',
                    other:       'bg-gray-100 text-gray-600',
                  }
                  const STATUS_COLORS = {
                    new:      'bg-orange-100 text-orange-700',
                    read:     'bg-blue-100 text-blue-700',
                    replied:  'bg-green-100 text-green-700',
                    archived: 'bg-gray-100 text-gray-500',
                  }
                  return (
                    <div key={fb.id} className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-start gap-4">
                        {/* Rating stars */}
                        <div className="flex-shrink-0 pt-0.5">
                          {fb.rating ? (
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(n => (
                                <Star
                                  key={n}
                                  size={13}
                                  className={n <= fb.rating ? 'text-turmeric-500 fill-turmeric-500' : 'text-gray-200 fill-gray-200'}
                                />
                              ))}
                            </div>
                          ) : (
                            <Star size={13} className="text-gray-200" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-800 text-sm">{fb.business_name}</span>
                            {fb.contact_name && (
                              <span className="text-xs text-gray-400">· {fb.contact_name}</span>
                            )}
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${TYPE_COLORS[fb.feedback_type] ?? TYPE_COLORS.other}`}>
                              {fb.feedback_type}
                            </span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[fb.status] ?? STATUS_COLORS.new}`}>
                              {fb.status}
                            </span>
                            <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">
                              {new Date(fb.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>

                          {/* Contact info */}
                          <div className="flex flex-wrap gap-3 mb-2 text-xs text-gray-400">
                            {fb.email && <a href={`mailto:${fb.email}`} className="hover:text-paddy-600">{fb.email}</a>}
                            {fb.phone && <a href={`tel:${fb.phone}`} className="hover:text-paddy-600">{fb.phone}</a>}
                          </div>

                          {/* Message preview / full */}
                          <p className={`text-sm text-gray-600 ${isExpanded ? '' : 'line-clamp-2'}`}>
                            {fb.message}
                          </p>

                          {/* Admin notes preview */}
                          {!isExpanded && fb.admin_notes && (
                            <p className="text-xs text-gray-400 mt-1 italic line-clamp-1">
                              Note: {fb.admin_notes}
                            </p>
                          )}

                          {/* Expanded section */}
                          {isExpanded && (
                            <div className="mt-3 space-y-3">
                              <div>
                                <label className="text-[10px] uppercase text-gray-400 block mb-1">Admin Notes (internal)</label>
                                <textarea
                                  rows={3}
                                  value={feedbackNoteEdit[fb.id] ?? fb.admin_notes ?? ''}
                                  onChange={e => setFeedbackNoteEdit(prev => ({ ...prev, [fb.id]: e.target.value }))}
                                  placeholder="Add internal notes…"
                                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white resize-none focus:outline-none focus:border-paddy-400"
                                />
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <button
                                  type="button"
                                  disabled={saving === fb.id}
                                  onClick={() => saveFeedbackNote(fb.id)}
                                  className="text-xs bg-white border border-paddy-200 text-paddy-800 font-medium px-3 py-1.5 rounded-lg hover:bg-paddy-50 disabled:opacity-50"
                                >
                                  Save note
                                </button>
                                <select
                                  value={fb.status}
                                  onChange={e => updateFeedbackStatus(fb.id, e.target.value)}
                                  disabled={saving === fb.id}
                                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:border-paddy-400 bg-white disabled:opacity-50"
                                >
                                  {['new', 'read', 'replied', 'archived'].map(s => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setExpandedFeedbackId(isExpanded ? null : fb.id)
                              if (!isExpanded) {
                                setFeedbackNoteEdit(prev => ({ ...prev, [fb.id]: fb.admin_notes ?? '' }))
                                if (fb.status === 'new') updateFeedbackStatus(fb.id, 'read')
                              }
                            }}
                            className="text-xs text-paddy-600 hover:text-paddy-800 mt-2 font-medium"
                          >
                            {isExpanded ? 'Collapse' : 'View & manage'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  )
}
