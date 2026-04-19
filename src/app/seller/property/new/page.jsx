'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '../../../../lib/supabase'
import StepForm from '../../../../components/ui/StepForm'
import FileUpload from '../../../../components/ui/FileUpload'
import locations from '../../../../data/locations.json'

const STEPS = ['Location', 'Land Details', 'Documents & Photos']

const LAND_USED_TYPES = ['Agriculture', 'Estate Agriculture', 'Industrial', 'Commercial', 'Residential']
const LAND_SOIL_TYPES = ['Black', 'Red', 'Sandy', 'Mixed']

const DOC_TYPE_BY_STATE = {
  'Andhra Pradesh': 'Adangal / 1B',
  'Telangana':      'Pahani / ROR-1B',
  'Karnataka':      'RTC',
}

const INITIAL = {
  state: '', district: '', mandal: '', village: '', zip_code: '', farmer_name: '',
  land_used_type: '', land_soil_type: '', land_doc_type: '', road_access: false,
  area_acres: '', expected_price: '',
  doc_urls: [], photo_urls: [],
}

export default function NewPropertyPage() {
  const router = useRouter()
  const [step, setStep]     = useState(0)
  const [form, setForm]     = useState(INITIAL)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const set = k => e => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [k]: val }))
    if (k === 'state') setForm(f => ({ ...f, state: val, district: '', mandal: '', land_doc_type: DOC_TYPE_BY_STATE[val] || '' }))
  }

  const districts = form.state ? Object.keys(locations[form.state] || {}) : []
  const mandals   = form.state && form.district ? (locations[form.state]?.[form.district] || []) : []

  function validateStep() {
    setError('')
    if (step === 0) {
      if (!form.state || !form.district || !form.mandal || !form.village)
        return 'Please fill in all location fields'
    }
    if (step === 1) {
      if (!form.land_used_type || !form.land_soil_type)
        return 'Please select land type and soil type'
      if (!form.area_acres || Number(form.area_acres) < 1 || Number(form.area_acres) > 999)
        return 'Area must be between 1 and 999 acres'
      if (!form.expected_price || Number(form.expected_price) <= 0)
        return 'Please enter expected price per acre'
    }
    return null
  }

  function handleNext() {
    const err = validateStep()
    if (err) { setError(err); return }
    setStep(s => s + 1)
  }

  async function handleSubmit() {
    const err = validateStep()
    if (err) { setError(err); return }

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    // Enforce max 2 listings per seller
    const { count } = await supabase
      .from('seller_properties')
      .select('id', { count: 'exact', head: true })
      .eq('seller_id', user.id)
      .in('status', ['pending', 'approved'])

    if (count >= 2) {
      setError('You can only have up to 2 active listings. Please wait until one is sold or contact SDV Farms.')
      setLoading(false)
      return
    }

    const { error: insertErr } = await supabase.from('seller_properties').insert({
      seller_id:      user.id,
      state:          form.state,
      district:       form.district,
      mandal:         form.mandal,
      village:        form.village,
      zip_code:       form.zip_code,
      farmer_name:    form.farmer_name || user.user_metadata?.full_name,
      land_used_type: form.land_used_type,
      land_soil_type: form.land_soil_type,
      land_doc_type:  form.land_doc_type,
      road_access:    form.road_access,
      area_acres:     Number(form.area_acres),
      expected_price: Number(form.expected_price),
      doc_urls:       form.doc_urls,
      photo_urls:     form.photo_urls,
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
          <h2 className="text-white font-display text-2xl font-bold mb-3">Listing Submitted!</h2>
          <p className="text-white/60 mb-2">Your property is under review by the SDV Farms team.</p>
          <p className="text-white/40 text-sm mb-6">We'll email you once it's approved and live on the marketplace.</p>
          <Link
            href="/seller"
            className="inline-block bg-turmeric-500 hover:bg-turmeric-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            View My Listings →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-12" style={{ background: bg }}>
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <Link href="/seller" className="text-white/50 hover:text-white/70 text-sm transition-colors">
            ← My Listings
          </Link>
          <h1 className="text-white font-display text-2xl font-bold mt-3">Post Your Property</h1>
          <p className="text-white/50 text-sm mt-1">Fill in the details and we'll review within 48 hours</p>
        </div>

        <div className="bg-white/8 backdrop-blur-sm border border-white/15 rounded-3xl p-8">
          {error && (
            <div className="bg-red-500/15 border border-red-400/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <StepForm
            steps={STEPS}
            currentStep={step}
            onNext={handleNext}
            onBack={() => { setStep(s => s - 1); setError('') }}
            onSubmit={handleSubmit}
            loading={loading}
            submitLabel="Submit for Review"
          >
            {/* ── Step 0: Location ── */}
            {step === 0 && (
              <div className="space-y-4">
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
                  <select value={form.district} onChange={set('district')} disabled={!form.state} className={inputCls}>
                    <option value="" className="bg-gray-800">Select district…</option>
                    {districts.map(d => <option key={d} value={d} className="bg-gray-800">{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Mandal *</label>
                  <select value={form.mandal} onChange={set('mandal')} disabled={!form.district} className={inputCls}>
                    <option value="" className="bg-gray-800">Select mandal…</option>
                    {mandals.map(m => <option key={m} value={m} className="bg-gray-800">{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Village / Area *</label>
                  <input type="text" value={form.village} onChange={set('village')} className={inputCls} placeholder="Village name" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Zip Code</label>
                    <input type="text" value={form.zip_code} onChange={set('zip_code')} className={inputCls} placeholder="500001" />
                  </div>
                  <div>
                    <label className={labelCls}>Farmer Name</label>
                    <input type="text" value={form.farmer_name} onChange={set('farmer_name')} className={inputCls} placeholder="As per docs" />
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 1: Land Details ── */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Land Used Type *</label>
                  <select value={form.land_used_type} onChange={set('land_used_type')} className={inputCls}>
                    <option value="" className="bg-gray-800">Select type…</option>
                    {LAND_USED_TYPES.map(t => <option key={t} value={t} className="bg-gray-800">{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Soil Type *</label>
                  <div className="grid grid-cols-4 gap-2">
                    {LAND_SOIL_TYPES.map(t => (
                      <button
                        key={t} type="button"
                        onClick={() => setForm(f => ({ ...f, land_soil_type: t }))}
                        className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                          form.land_soil_type === t
                            ? 'border-turmeric-400 bg-turmeric-500/10 text-white'
                            : 'border-white/15 text-white/60 hover:border-white/30'
                        }`}
                      >{t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Land Document Type *</label>
                  <input
                    type="text" value={form.land_doc_type}
                    onChange={set('land_doc_type')} className={inputCls}
                    placeholder={DOC_TYPE_BY_STATE[form.state] || 'e.g. Pahani / Adangal'}
                  />
                  {form.state && (
                    <p className="text-white/35 text-xs mt-1">For {form.state}: {DOC_TYPE_BY_STATE[form.state]}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Area (Acres) *</label>
                    <input type="number" min="1" max="999" value={form.area_acres} onChange={set('area_acres')} className={inputCls} placeholder="e.g. 5" />
                  </div>
                  <div>
                    <label className={labelCls}>Price per Acre (₹) *</label>
                    <input type="number" min="1" value={form.expected_price} onChange={set('expected_price')} className={inputCls} placeholder="e.g. 500000" />
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={form.road_access} onChange={set('road_access')} className="w-5 h-5 accent-turmeric-500" />
                  <span className="text-white/70 group-hover:text-white text-sm transition-colors">Road / Bata access available</span>
                </label>
              </div>
            )}

            {/* ── Step 2: Docs & Photos ── */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-yellow-500/10 border border-yellow-400/20 rounded-xl px-4 py-3">
                  <p className="text-yellow-200/80 text-xs">
                    Upload clear photos of your land documents. Accepted: PDF, JPG, PNG (max 10MB each).
                  </p>
                </div>
                <FileUpload
                  bucket="property-docs"
                  folder={`docs/${Date.now()}`}
                  accept="docs"
                  maxFiles={3}
                  label="Land Documents *"
                  hint="Pahani / Adangal / RTC / Patta — up to 3 files"
                  onUpload={urls => setForm(f => ({ ...f, doc_urls: urls }))}
                />
                <FileUpload
                  bucket="property-photos"
                  folder={`photos/${Date.now()}`}
                  accept="photos"
                  maxFiles={5}
                  label="Property Photos"
                  hint="Photos of the land — up to 5 images"
                  onUpload={urls => setForm(f => ({ ...f, photo_urls: urls }))}
                />

                {/* Review summary */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white/60 space-y-1">
                  <p className="text-white/80 font-medium mb-2">Review your listing</p>
                  <p>📍 {[form.village, form.mandal, form.district, form.state].filter(Boolean).join(', ')}</p>
                  <p>🌱 {form.land_soil_type} soil · {form.land_used_type}</p>
                  <p>📐 {form.area_acres} acres · ₹{Number(form.expected_price).toLocaleString('en-IN')}/acre</p>
                  <p>🛣️ Road access: {form.road_access ? 'Yes' : 'No'}</p>
                </div>
              </div>
            )}
          </StepForm>
        </div>
      </div>
    </div>
  )
}
