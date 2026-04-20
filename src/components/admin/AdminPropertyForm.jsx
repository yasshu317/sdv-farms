'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../lib/supabase'
import StepForm from '../ui/StepForm'
import FileUpload from '../ui/FileUpload'
import locations from '../../data/locations.json'
import { urlsToInitialItems } from '../../app/seller/property/propertyFormConstants'

const STEPS = ['Location', 'Land Details', 'Documents & Photos']

const LAND_USED_TYPES = ['Agriculture', 'Estate Agriculture', 'Industrial', 'Commercial', 'Residential']
const LAND_SOIL_TYPES = ['Black', 'Red', 'Sandy', 'Mixed']
const DOC_TYPE_BY_STATE = {
  'Andhra Pradesh': 'Adangal / 1B',
  Telangana: 'Pahani / ROR-1B',
  Karnataka: 'RTC',
}

const INITIAL = {
  state: '',
  district: '',
  mandal: '',
  village: '',
  zip_code: '',
  farmer_name: '',
  land_used_type: '',
  land_soil_type: '',
  land_doc_type: '',
  road_access: false,
  area_acres: '',
  expected_price: '',
  doc_urls: [],
  photo_urls: [],
}

/**
 * @param {{ mode: 'create' | 'edit', propertyId?: string, initialForm?: object }} props
 */
export default function AdminPropertyForm({ mode, propertyId, initialForm }) {
  const isEdit = mode === 'edit'
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(() => initialForm || INITIAL)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)

  const set = k => e => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    if (k === 'state') {
      setForm(f => ({
        ...f,
        state: val,
        district: '',
        mandal: '',
        land_doc_type: DOC_TYPE_BY_STATE[val] || '',
      }))
    } else {
      setForm(f => ({ ...f, [k]: val }))
    }
  }

  const districts = form.state ? Object.keys(locations[form.state] || {}) : []
  const mandals = form.state && form.district ? locations[form.state]?.[form.district] || [] : []

  function validateStep() {
    setError('')
    if (step === 0) {
      if (!form.state || !form.district || !form.mandal || !form.village)
        return 'Please fill in all location fields'
    }
    if (step === 1) {
      if (!form.land_used_type || !form.land_soil_type) return 'Please select land type and soil type'
      if (!form.area_acres || Number(form.area_acres) < 1 || Number(form.area_acres) > 999)
        return 'Area must be between 1 and 999 acres'
      if (!form.expected_price || Number(form.expected_price) <= 0)
        return 'Please enter expected price per acre'
    }
    return null
  }

  async function handleSubmit() {
    const err = validateStep()
    if (err) {
      setError(err)
      return
    }
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (isEdit) {
        const { data, error: dbErr } = await supabase
          .from('seller_properties')
          .update({
            state: form.state,
            district: form.district,
            mandal: form.mandal,
            village: form.village,
            zip_code: form.zip_code || null,
            farmer_name: form.farmer_name || null,
            land_used_type: form.land_used_type,
            land_soil_type: form.land_soil_type,
            land_doc_type: form.land_doc_type || null,
            road_access: form.road_access,
            area_acres: Number(form.area_acres),
            expected_price: Number(form.expected_price),
            doc_urls: form.doc_urls,
            photo_urls: form.photo_urls,
          })
          .eq('id', propertyId)
          .select('id, property_id')
          .maybeSingle()

        if (dbErr) throw dbErr
        if (!data) throw new Error('Update failed — check admin access or listing exists.')
        setSuccess({ id: data.id, propertyId: data.property_id, edit: true })
        return
      }

      const { count } = await supabase
        .from('seller_properties')
        .select('*', { count: 'exact', head: true })
        .not('property_id', 'is', null)
      const year = new Date().getFullYear()
      const newPropertyId = `SDV-${year}-${String((count ?? 0) + 1).padStart(3, '0')}`

      const { data, error: dbErr } = await supabase
        .from('seller_properties')
        .insert({
          seller_id: user.id,
          state: form.state,
          district: form.district,
          mandal: form.mandal,
          village: form.village,
          zip_code: form.zip_code || null,
          farmer_name: form.farmer_name || null,
          land_used_type: form.land_used_type,
          land_soil_type: form.land_soil_type,
          land_doc_type: form.land_doc_type || null,
          road_access: form.road_access,
          area_acres: Number(form.area_acres),
          expected_price: Number(form.expected_price),
          doc_urls: form.doc_urls,
          photo_urls: form.photo_urls,
          status: 'approved',
          property_id: newPropertyId,
        })
        .select('id')
        .single()

      if (dbErr) throw dbErr
      setSuccess({ id: data.id, propertyId: newPropertyId, edit: false })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">{success.edit ? '✓' : '✅'}</div>
          <h2 className="text-paddy-900 font-display font-bold text-2xl mb-2">
            {success.edit ? 'Listing updated' : 'Property Listed!'}
          </h2>
          {success.propertyId && (
            <p className="text-gray-500 text-sm mb-1">
              Property ID:{' '}
              <span className="font-mono font-bold text-paddy-700">{success.propertyId}</span>
            </p>
          )}
          <p className="text-gray-400 text-xs mb-6">
            {success.edit ? 'Changes are saved on the marketplace.' : 'Auto-approved and live on the marketplace.'}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href={`/properties/${success.id}`}
              className="bg-paddy-700 hover:bg-paddy-800 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              View Listing
            </Link>
            <Link
              href="/admin"
              className="border border-gray-200 text-gray-600 hover:border-paddy-300 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const field = (label, key, type = 'text', extra = {}) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={set(key)}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-paddy-500 transition-colors bg-white"
        {...extra}
      />
    </div>
  )

  const select = (label, key, options, placeholder = 'Select…') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={form[key]}
        onChange={set(key)}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-paddy-500 bg-white"
      >
        <option value="">{placeholder}</option>
        {options.map(o => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )

  const steps = [
    <div key="loc" className="space-y-4">
      {select('State', 'state', Object.keys(locations), 'Select state')}
      {select('District', 'district', districts, 'Select district')}
      {select('Mandal', 'mandal', mandals, 'Select mandal')}
      {field('Village / Area', 'village')}
      {field('Zip Code (optional)', 'zip_code')}
      {field('Farmer / Owner Name (optional)', 'farmer_name')}
    </div>,

    <div key="land" className="space-y-4">
      {select('Land Used Type', 'land_used_type', LAND_USED_TYPES)}
      {select('Soil Type', 'land_soil_type', LAND_SOIL_TYPES)}
      {field('Document Type', 'land_doc_type')}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Area (Acres)</label>
        <input
          type="number"
          min="1"
          max="999"
          step="0.5"
          value={form.area_acres}
          onChange={set('area_acres')}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-paddy-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Expected Price / Acre (₹)</label>
        <input
          type="number"
          min="1"
          value={form.expected_price}
          onChange={set('expected_price')}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-paddy-500"
        />
      </div>
      <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
        <input
          type="checkbox"
          checked={form.road_access}
          onChange={set('road_access')}
          className="w-4 h-4 accent-paddy-600"
        />
        Road access available
      </label>
    </div>,

    <div key="docs" className="space-y-6">
      <FileUpload
        key={`admin-docs-${propertyId || 'new'}`}
        label="Land Documents (Pahani / Adangal / RTC)"
        bucket="property-docs"
        folder="admin"
        accept="docs"
        maxFiles={5}
        initialItems={isEdit ? urlsToInitialItems(form.doc_urls, 'Document') : undefined}
        onUpload={urls => setForm(f => ({ ...f, doc_urls: urls }))}
      />
      <FileUpload
        key={`admin-photos-${propertyId || 'new'}`}
        label="Property Photos"
        bucket="property-photos"
        folder="admin"
        accept="photos"
        maxFiles={10}
        initialItems={isEdit ? urlsToInitialItems(form.photo_urls, 'Photo') : undefined}
        onUpload={urls => setForm(f => ({ ...f, photo_urls: urls }))}
      />
    </div>,
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/admin" className="text-gray-400 hover:text-gray-600 text-sm transition-colors">
            ← Admin
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600 text-sm font-medium">{isEdit ? 'Edit Property' : 'Add Property'}</span>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="font-display font-bold text-2xl text-paddy-900">
              {isEdit ? 'Edit property listing' : 'Add Property'}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {isEdit
                ? 'Update details, documents, or photos. Marketplace listing reflects saved changes.'
                : 'Listing is auto-approved and assigned an SDV ID instantly.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <StepForm
            steps={STEPS}
            currentStep={step}
            onNext={() => {
              const err = validateStep()
              if (err) {
                setError(err)
                return
              }
              setStep(s => s + 1)
            }}
            onBack={() => {
              setError('')
              setStep(s => s - 1)
            }}
            onSubmit={handleSubmit}
            loading={loading}
            submitLabel={isEdit ? 'Save changes' : 'Publish Property'}
          >
            {steps[step]}
          </StepForm>
        </div>
      </div>
    </div>
  )
}
