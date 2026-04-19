'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../lib/supabase'
import locations from '../../data/locations.json'

const SOIL_TYPES = ['Black', 'Red', 'Sandy', 'Mixed', 'Any']

export default function BuyerRequestPage() {
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    state: '', district: '', mandal: '',
    land_soil_type: '', area_min: '', area_max: '', price_max: '', notes: '',
  })
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const districts = form.state ? Object.keys(locations[form.state] || {}) : []
  const mandals   = form.state && form.district ? (locations[form.state]?.[form.district] || []) : []

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.name || !form.phone) { setError('Name and phone are required'); return }

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error: insertErr } = await supabase.from('buyer_requests').insert({
      buyer_id:       user?.id || null,
      name:           form.name,
      phone:          form.phone,
      email:          form.email || user?.email || null,
      state:          form.state || null,
      district:       form.district || null,
      mandal:         form.mandal || null,
      land_soil_type: form.land_soil_type || null,
      area_min:       form.area_min ? Number(form.area_min) : null,
      area_max:       form.area_max ? Number(form.area_max) : null,
      price_max:      form.price_max ? Number(form.price_max) : null,
      notes:          form.notes || null,
    })

    setLoading(false)
    if (insertErr) { setError(insertErr.message); return }
    setSuccess(true)
  }

  const inputCls = 'w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/35 focus:outline-none focus:border-turmeric-400 transition-colors text-sm'
  const labelCls = 'block text-white/70 text-sm mb-1.5'
  const bg = 'linear-gradient(160deg, #071709 0%, #1a4520 60%, #286d2f 100%)'

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: bg }}>
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🌾</div>
          <h2 className="text-white font-display text-2xl font-bold mb-3">Request Submitted!</h2>
          <p className="text-white/60 mb-6">
            Our team will review your requirements and get back to you within 48 hours.
          </p>
          <Link href="/properties" className="inline-block bg-turmeric-500 hover:bg-turmeric-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
            Browse Available Properties →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-12" style={{ background: bg }}>
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <Link href="/properties" className="text-white/50 hover:text-white/70 text-sm transition-colors">
            ← Browse Properties
          </Link>
          <h1 className="text-white font-display text-2xl font-bold mt-3">Post a Land Request</h1>
          <p className="text-white/50 text-sm mt-1">Tell us what you're looking for — we'll find a match</p>
        </div>

        <div className="bg-white/8 backdrop-blur-sm border border-white/15 rounded-3xl p-8">
          {error && (
            <div className="bg-red-500/15 border border-red-400/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Full Name *</label>
                <input type="text" required value={form.name} onChange={set('name')} className={inputCls} placeholder="Your name" />
              </div>
              <div>
                <label className={labelCls}>Phone *</label>
                <input type="tel" required value={form.phone} onChange={set('phone')} className={inputCls} placeholder="+91 98765 43210" />
              </div>
            </div>

            <div>
              <label className={labelCls}>Email</label>
              <input type="email" value={form.email} onChange={set('email')} className={inputCls} placeholder="you@example.com" />
            </div>

            <div className="border-t border-white/10 pt-4">
              <p className="text-white/60 text-xs mb-3 uppercase tracking-wider">Preferred Location (optional)</p>
              <div className="space-y-3">
                <select value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value, district: '', mandal: '' }))} className={inputCls}>
                  <option value="" className="bg-gray-800">Any state</option>
                  {Object.keys(locations).map(s => <option key={s} value={s} className="bg-gray-800">{s}</option>)}
                </select>
                {form.state && (
                  <select value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value, mandal: '' }))} className={inputCls}>
                    <option value="" className="bg-gray-800">Any district</option>
                    {districts.map(d => <option key={d} value={d} className="bg-gray-800">{d}</option>)}
                  </select>
                )}
                {form.district && (
                  <select value={form.mandal} onChange={set('mandal')} className={inputCls}>
                    <option value="" className="bg-gray-800">Any mandal</option>
                    {mandals.map(m => <option key={m} value={m} className="bg-gray-800">{m}</option>)}
                  </select>
                )}
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <p className="text-white/60 text-xs mb-3 uppercase tracking-wider">Land Requirements (optional)</p>
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Preferred Soil Type</label>
                  <div className="flex flex-wrap gap-2">
                    {SOIL_TYPES.map(s => (
                      <button key={s} type="button"
                        onClick={() => setForm(f => ({ ...f, land_soil_type: s }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          form.land_soil_type === s
                            ? 'bg-turmeric-500/20 border border-turmeric-400 text-white'
                            : 'bg-white/8 border border-white/15 text-white/60 hover:border-white/30'
                        }`}
                      >{s}</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Min Acres</label>
                    <input type="number" min="1" value={form.area_min} onChange={set('area_min')} className={inputCls} placeholder="1" />
                  </div>
                  <div>
                    <label className={labelCls}>Max Acres</label>
                    <input type="number" min="1" value={form.area_max} onChange={set('area_max')} className={inputCls} placeholder="999" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Max Budget / Acre (₹)</label>
                  <input type="number" value={form.price_max} onChange={set('price_max')} className={inputCls} placeholder="e.g. 1000000" />
                </div>
              </div>
            </div>

            <div>
              <label className={labelCls}>Additional Notes</label>
              <textarea
                value={form.notes} onChange={set('notes')} rows={3}
                placeholder="Any specific requirements or questions…"
                className={`${inputCls} resize-none`}
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-turmeric-500 hover:bg-turmeric-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors mt-2"
            >
              {loading ? 'Submitting…' : 'Submit Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
