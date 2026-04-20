'use client'
import { useState } from 'react'
import locations from '../../data/locations.json'

const SOIL_TYPES = ['Black', 'Red', 'Sandy', 'Mixed', 'Any']

export const BUYER_REQUEST_INITIAL = {
  name: '',
  phone: '',
  email: '',
  state: '',
  district: '',
  mandal: '',
  land_soil_type: '',
  area_min: '',
  area_max: '',
  price_max: '',
  notes: '',
}

export function mapBuyerRequestRowToForm(row) {
  if (!row) return { ...BUYER_REQUEST_INITIAL }
  return {
    name: row.name || '',
    phone: row.phone || '',
    email: row.email || '',
    state: row.state || '',
    district: row.district || '',
    mandal: row.mandal || '',
    land_soil_type: row.land_soil_type || '',
    area_min: row.area_min != null ? String(row.area_min) : '',
    area_max: row.area_max != null ? String(row.area_max) : '',
    price_max: row.price_max != null ? String(row.price_max) : '',
    notes: row.notes || '',
  }
}

/**
 * @param {{
 *   initialForm?: object,
 *   submitLabel?: string,
 *   onSubmit: (form: object) => Promise<void>,
 * }} props
 */
export default function BuyerLandRequestForm({
  initialForm,
  submitLabel = 'Submit Request',
  onSubmit,
}) {
  const [form, setForm] = useState(() => initialForm || BUYER_REQUEST_INITIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const districts = form.state ? Object.keys(locations[form.state] || {}) : []
  const mandals = form.state && form.district ? locations[form.state]?.[form.district] || [] : []

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.name || !form.phone) {
      setError('Name and phone are required')
      return
    }
    setLoading(true)
    try {
      await onSubmit(form)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inputCls =
    'w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/35 focus:outline-none focus:border-turmeric-400 transition-colors text-sm'
  const labelCls = 'block text-white/70 text-sm mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/15 border border-red-400/30 text-red-300 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Full Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={set('name')}
            className={inputCls}
            placeholder="Your name"
          />
        </div>
        <div>
          <label className={labelCls}>Phone *</label>
          <input
            type="tel"
            required
            value={form.phone}
            onChange={set('phone')}
            className={inputCls}
            placeholder="+91 98765 43210"
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Email</label>
        <input type="email" value={form.email} onChange={set('email')} className={inputCls} placeholder="you@example.com" />
      </div>

      <div className="border-t border-white/10 pt-4">
        <p className="text-white/60 text-xs mb-3 uppercase tracking-wider">Preferred Location (optional)</p>
        <div className="space-y-3">
          <select
            value={form.state}
            onChange={e => setForm(f => ({ ...f, state: e.target.value, district: '', mandal: '' }))}
            className={inputCls}
          >
            <option value="" className="bg-gray-800">
              Any state
            </option>
            {Object.keys(locations).map(s => (
              <option key={s} value={s} className="bg-gray-800">
                {s}
              </option>
            ))}
          </select>
          {form.state && (
            <select
              value={form.district}
              onChange={e => setForm(f => ({ ...f, district: e.target.value, mandal: '' }))}
              className={inputCls}
            >
              <option value="" className="bg-gray-800">
                Any district
              </option>
              {districts.map(d => (
                <option key={d} value={d} className="bg-gray-800">
                  {d}
                </option>
              ))}
            </select>
          )}
          {form.district && (
            <select value={form.mandal} onChange={set('mandal')} className={inputCls}>
              <option value="" className="bg-gray-800">
                Any mandal
              </option>
              {mandals.map(m => (
                <option key={m} value={m} className="bg-gray-800">
                  {m}
                </option>
              ))}
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
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, land_soil_type: s }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    form.land_soil_type === s
                      ? 'bg-turmeric-500/20 border border-turmeric-400 text-white'
                      : 'bg-white/8 border border-white/15 text-white/60 hover:border-white/30'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Min Acres</label>
              <input
                type="number"
                min="1"
                value={form.area_min}
                onChange={set('area_min')}
                className={inputCls}
                placeholder="1"
              />
            </div>
            <div>
              <label className={labelCls}>Max Acres</label>
              <input
                type="number"
                min="1"
                value={form.area_max}
                onChange={set('area_max')}
                className={inputCls}
                placeholder="999"
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Max Budget / Acre (₹)</label>
            <input
              type="number"
              value={form.price_max}
              onChange={set('price_max')}
              className={inputCls}
              placeholder="e.g. 1000000"
            />
          </div>
        </div>
      </div>

      <div>
        <label className={labelCls}>Additional Notes</label>
        <textarea
          value={form.notes}
          onChange={set('notes')}
          rows={3}
          placeholder="Any specific requirements or questions…"
          className={`${inputCls} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-turmeric-500 hover:bg-turmeric-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors mt-2"
      >
        {loading ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
