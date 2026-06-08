'use client'
import { useState, useRef } from 'react'
import NextLink from 'next/link'
import locations from '../../data/locations.json'
import {
  LAND_USED_TYPES,
  LAND_SOIL_TYPES,
  SELLER_INTEREST_OPTIONS,
} from '../../app/seller/property/propertyFormConstants'

const STEPS = ['Your Details & Location', 'Land Information']

const bg = 'linear-gradient(160deg, #071709 0%, #1a4520 60%, #286d2f 100%)'
const inputCls = 'w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/35 focus:outline-none focus:border-turmeric-400 transition-colors text-sm'
const labelCls = 'block text-white/70 text-sm mb-1.5'

const INITIAL = {
  submitter_first_name: '',
  submitter_last_name: '',
  submitter_mobile: '',
  submitter_email: '',
  state: '',
  district: '',
  mandal: '',
  village: '',
  location_notes: '',
  farmer_name: '',
  farmer_phone: '',
  land_used_type: '',
  land_soil_type: '',
  area_acres: '',
  expected_price: '',
  seller_interest: '',
  road_access: false,
  doc_urls: [],
  photo_urls: [],
}

export default function ListingSubmissionForm() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(INITIAL)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const folderRef = useRef(String(Date.now()))
  const docsInputRef = useRef()
  const photosInputRef = useRef()
  const [docUploading, setDocUploading] = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  function set(k) {
    return e => {
      const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
      if (k === 'state') {
        setForm(f => ({ ...f, state: val, district: '', mandal: '' }))
      } else {
        setForm(f => ({ ...f, [k]: val }))
      }
    }
  }

  const districts = form.state ? Object.keys(locations[form.state] || {}) : []
  const mandals = form.state && form.district ? locations[form.state]?.[form.district] || [] : []

  function validateStep0() {
    if (!form.submitter_first_name.trim()) return 'Please enter your first name'
    if (!form.submitter_last_name.trim())  return 'Please enter your last name'
    if (!form.submitter_mobile.trim())     return 'Please enter your mobile number'
    if (!/^[6-9]\d{9}$/.test(form.submitter_mobile.trim()))
      return 'Enter a valid 10-digit Indian mobile number'
    if (!form.state)    return 'Please select a state'
    if (!form.district) return 'Please select a district'
    if (!form.mandal)   return 'Please select a mandal'
    if (!form.village.trim()) return 'Please enter the village name'
    return null
  }

  function validateStep1() {
    if (!form.farmer_name.trim()) return 'Please enter the farmer name as on the land document'
    return null
  }

  async function uploadFiles(files, type, setter, setUploading) {
    setUploadError('')
    setUploading(true)
    const urls = []
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', type)
      fd.append('folder', folderRef.current)
      const res = await fetch('/api/listing-submissions/upload', { method: 'POST', body: fd })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        setUploadError(payload.error || `Upload failed (${res.status})`)
        setUploading(false)
        return
      }
      urls.push(payload.url)
    }
    setter(prev => [...prev, ...urls])
    setUploading(false)
  }

  function removeUrl(type, idx) {
    if (type === 'doc') {
      setForm(f => ({ ...f, doc_urls: f.doc_urls.filter((_, i) => i !== idx) }))
    } else {
      setForm(f => ({ ...f, photo_urls: f.photo_urls.filter((_, i) => i !== idx) }))
    }
  }

  function handleNext() {
    const err = validateStep0()
    if (err) { setError(err); return }
    setError('')
    setStep(1)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const err = validateStep1()
    if (err) { setError(err); return }
    setError('')
    setLoading(true)

    const res = await fetch('/api/listing-submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        area_acres: form.area_acres ? Number(form.area_acres) : null,
        expected_price: form.expected_price ? Number(form.expected_price) : null,
      }),
    })
    const data = await res.json().catch(() => ({}))
    setLoading(false)
    if (!res.ok) {
      setError(data.error || 'Something went wrong. Please try again.')
      return
    }
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: bg }}>
        <div className="text-center max-w-md w-full">
          <div className="text-6xl mb-5">🌾</div>
          <h2 className="text-white font-display text-2xl font-bold mb-3">Submission Received!</h2>
          <p className="text-white/60 mb-2">
            Thank you. The SDV Farms team will call you within <strong className="text-turmeric-400">2 working days</strong>.
          </p>
          <p className="text-white/40 text-sm mb-8">
            We&apos;ll review your land details and get in touch on <strong className="text-white/60">{form.submitter_mobile}</strong>.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/919876543210?text=Hi%2C+I+just+submitted+my+land+on+SDV+Farms.+Need+help."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              <span>💬</span> Chat on WhatsApp
            </a>
            <NextLink
              href="/properties"
              className="inline-flex items-center justify-center bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium px-6 py-3 rounded-xl transition-colors text-sm"
            >
              Browse Properties →
            </NextLink>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:py-14" style={{ background: bg }}>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <NextLink href="/" className="text-white/40 hover:text-white/60 text-sm transition-colors">
            ← SDV Farms
          </NextLink>
          <h1 className="text-white font-display text-2xl sm:text-3xl font-bold mt-3">
            List Your Land
          </h1>
          <p className="text-white/50 text-sm mt-2">
            No sign-in needed — fill this form and our team will contact you
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`flex items-center gap-2 text-xs font-medium ${i === step ? 'text-turmeric-400' : i < step ? 'text-white/50' : 'text-white/25'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                  i === step ? 'border-turmeric-400 bg-turmeric-400/20 text-turmeric-400' :
                  i < step  ? 'border-white/40 bg-white/10 text-white/50' :
                              'border-white/15 text-white/25'
                }`}>{i + 1}</span>
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-px ${i < step ? 'bg-white/40' : 'bg-white/15'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white/8 backdrop-blur-sm border border-white/15 rounded-3xl p-6 sm:p-8">
          {error && (
            <div className="bg-red-500/15 border border-red-400/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-6">
              {error}
            </div>
          )}

          {step === 0 && (
            <form onSubmit={e => { e.preventDefault(); handleNext() }} noValidate>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>First name *</label>
                    <input
                      type="text"
                      value={form.submitter_first_name}
                      onChange={set('submitter_first_name')}
                      placeholder="First name"
                      className={inputCls}
                      autoComplete="given-name"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Last name *</label>
                    <input
                      type="text"
                      value={form.submitter_last_name}
                      onChange={set('submitter_last_name')}
                      placeholder="Last name"
                      className={inputCls}
                      autoComplete="family-name"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Your mobile number *</label>
                  <input
                    type="tel"
                    value={form.submitter_mobile}
                    onChange={set('submitter_mobile')}
                    placeholder="10-digit mobile number"
                    className={inputCls}
                    maxLength={10}
                    autoComplete="tel"
                  />
                </div>

                <div>
                  <label className={labelCls}>Email <span className="text-white/35">(optional)</span></label>
                  <input
                    type="email"
                    value={form.submitter_email}
                    onChange={set('submitter_email')}
                    placeholder="your@email.com"
                    className={inputCls}
                    autoComplete="email"
                  />
                </div>

                <div className="pt-2 border-t border-white/10">
                  <p className="text-white/40 text-xs mb-3 uppercase tracking-wider font-semibold">Land Location</p>
                </div>

                <div>
                  <label className={labelCls}>State *</label>
                  <select value={form.state} onChange={set('state')} className={inputCls}>
                    <option value="" className="bg-gray-800">Select state…</option>
                    {Object.keys(locations).map(s => (
                      <option key={s} value={s} className="bg-gray-800">{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>District *</label>
                  <select
                    value={form.district}
                    onChange={set('district')}
                    disabled={!form.state}
                    className={inputCls}
                  >
                    <option value="" className="bg-gray-800">Select district…</option>
                    {districts.map(d => (
                      <option key={d} value={d} className="bg-gray-800">{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Mandal *</label>
                  <select
                    value={form.mandal}
                    onChange={set('mandal')}
                    disabled={!form.district}
                    className={inputCls}
                  >
                    <option value="" className="bg-gray-800">Select mandal…</option>
                    {mandals.map(m => (
                      <option key={m} value={m} className="bg-gray-800">{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Village *</label>
                  <input
                    type="text"
                    value={form.village}
                    onChange={set('village')}
                    placeholder="Village name"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    Location notes <span className="text-white/35">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.location_notes}
                    onChange={set('location_notes')}
                    placeholder="Survey no., Google Maps link, landmark…"
                    className={inputCls}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-8 w-full bg-turmeric-500 hover:bg-turmeric-600 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
              >
                Next: Land Details →
              </button>
            </form>
          )}

          {step === 1 && (
            <form onSubmit={handleSubmit} noValidate>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Farmer name (as on land document) *</label>
                  <input
                    type="text"
                    value={form.farmer_name}
                    onChange={set('farmer_name')}
                    placeholder="Exact name on Pahani / ROR-1B"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Farmer phone <span className="text-white/35">(optional)</span></label>
                  <input
                    type="tel"
                    value={form.farmer_phone}
                    onChange={set('farmer_phone')}
                    placeholder="Farmer's mobile number"
                    className={inputCls}
                    maxLength={10}
                  />
                </div>

                <div>
                  <label className={labelCls}>Land type</label>
                  <select value={form.land_used_type} onChange={set('land_used_type')} className={inputCls}>
                    <option value="" className="bg-gray-800">Select type…</option>
                    {LAND_USED_TYPES.map(t => (
                      <option key={t} value={t} className="bg-gray-800">{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Soil type</label>
                  <select value={form.land_soil_type} onChange={set('land_soil_type')} className={inputCls}>
                    <option value="" className="bg-gray-800">Select soil type…</option>
                    {LAND_SOIL_TYPES.map(t => (
                      <option key={t} value={t} className="bg-gray-800">{t}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Area (acres)</label>
                    <input
                      type="number"
                      value={form.area_acres}
                      onChange={set('area_acres')}
                      placeholder="e.g. 2.5"
                      min="0.1"
                      max="999"
                      step="0.1"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Expected price (₹/acre)</label>
                    <input
                      type="number"
                      value={form.expected_price}
                      onChange={set('expected_price')}
                      placeholder="e.g. 500000"
                      min="0"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Selling intent</label>
                  <select value={form.seller_interest} onChange={set('seller_interest')} className={inputCls}>
                    <option value="" className="bg-gray-800">Select…</option>
                    {SELLER_INTEREST_OPTIONS.map(o => (
                      <option key={o.value} value={o.value} className="bg-gray-800">{o.label}</option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.road_access}
                    onChange={set('road_access')}
                    className="w-4 h-4 accent-turmeric-500 shrink-0"
                  />
                  <span className="text-white/70 text-sm group-hover:text-white/90 transition-colors">
                    Road access available
                  </span>
                </label>

                {/* Document upload */}
                <div className="pt-2 border-t border-white/10">
                  <p className="text-white/40 text-xs mb-3 uppercase tracking-wider font-semibold">
                    Documents <span className="normal-case text-white/30 font-normal">(optional — Pahani, ROR-1B, etc.)</span>
                  </p>
                  <div
                    onClick={() => !docUploading && docsInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 hover:border-turmeric-400/60 rounded-xl p-5 text-center cursor-pointer transition-colors"
                  >
                    <div className="text-2xl mb-1.5">📄</div>
                    <p className="text-white/55 text-sm">{docUploading ? 'Uploading…' : 'Click to upload documents'}</p>
                    <p className="text-white/30 text-xs mt-1">PDF, JPG, PNG · max 10 MB each</p>
                    <input
                      ref={docsInputRef}
                      type="file"
                      multiple
                      accept="application/pdf,image/jpeg,image/png,image/webp"
                      className="hidden"
                      disabled={docUploading}
                      onChange={e => {
                        uploadFiles(e.target.files, 'docs',
                          urls => setForm(f => ({ ...f, doc_urls: [...f.doc_urls, ...urls] })),
                          setDocUploading,
                        )
                        e.target.value = ''
                      }}
                    />
                  </div>
                  {form.doc_urls.length > 0 && (
                    <ul className="mt-2 space-y-1.5">
                      {form.doc_urls.map((url, i) => (
                        <li key={i} className="flex items-center gap-2 bg-white/8 rounded-lg px-3 py-2 text-sm">
                          <span className="text-turmeric-400 mr-1">✓</span>
                          <span className="text-white/60 truncate flex-1 text-xs">Document {i + 1}</span>
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-turmeric-400/80 hover:text-turmeric-300 text-xs shrink-0">Open</a>
                          <button type="button" onClick={() => removeUrl('doc', i)} className="text-red-400/70 hover:text-red-400 text-xs shrink-0">Remove</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Photo upload */}
                <div>
                  <p className="text-white/40 text-xs mb-3 uppercase tracking-wider font-semibold">
                    Photos <span className="normal-case text-white/30 font-normal">(optional — land or site photos)</span>
                  </p>
                  <div
                    onClick={() => !photoUploading && photosInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 hover:border-turmeric-400/60 rounded-xl p-5 text-center cursor-pointer transition-colors"
                  >
                    <div className="text-2xl mb-1.5">🖼️</div>
                    <p className="text-white/55 text-sm">{photoUploading ? 'Uploading…' : 'Click to upload photos'}</p>
                    <p className="text-white/30 text-xs mt-1">JPG, PNG · max 10 MB each</p>
                    <input
                      ref={photosInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      disabled={photoUploading}
                      onChange={e => {
                        uploadFiles(e.target.files, 'photos',
                          urls => setForm(f => ({ ...f, photo_urls: [...f.photo_urls, ...urls] })),
                          setPhotoUploading,
                        )
                        e.target.value = ''
                      }}
                    />
                  </div>
                  {form.photo_urls.length > 0 && (
                    <ul className="mt-2 space-y-1.5">
                      {form.photo_urls.map((url, i) => (
                        <li key={i} className="flex items-center gap-2 bg-white/8 rounded-lg px-3 py-2 text-sm">
                          <span className="text-turmeric-400 mr-1">✓</span>
                          <span className="text-white/60 truncate flex-1 text-xs">Photo {i + 1}</span>
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-turmeric-400/80 hover:text-turmeric-300 text-xs shrink-0">Open</a>
                          <button type="button" onClick={() => removeUrl('photo', i)} className="text-red-400/70 hover:text-red-400 text-xs shrink-0">Remove</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {uploadError && (
                  <p className="text-red-400 text-xs">{uploadError}</p>
                )}
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => { setStep(0); setError('') }}
                  className="flex-1 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium py-3.5 rounded-xl transition-colors text-sm"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-2 flex-grow bg-turmeric-500 hover:bg-turmeric-600 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
                >
                  {loading ? 'Submitting…' : 'Submit Listing'}
                </button>
              </div>

              <p className="text-white/30 text-xs text-center mt-4">
                By submitting you agree for SDV Farms to contact you regarding this listing.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
