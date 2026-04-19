'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import FilterPanel from '../../components/ui/FilterPanel'
import locations from '../../data/locations.json'

const SOIL_TYPES  = ['Black', 'Red', 'Sandy', 'Mixed']
const LAND_TYPES  = ['Agriculture', 'Estate Agriculture', 'Industrial', 'Commercial', 'Residential']
const ALL_STATES  = Object.keys(locations)

function PropertyCard({ p }) {
  const photo = p.photo_urls?.[0]
  const totalPrice = (p.area_acres * p.expected_price).toLocaleString('en-IN')
  return (
    <Link href={`/properties/${p.id}`} className="group block bg-white/5 hover:bg-white/8 border border-white/10 hover:border-turmeric-400/30 rounded-2xl overflow-hidden transition-all">
      {/* Photo */}
      <div className="relative h-44 bg-paddy-900/40 overflow-hidden">
        {photo ? (
          <Image src={photo} alt="Property" fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-5xl opacity-30">🌾</span>
          </div>
        )}
        {p.property_id && (
          <span className="absolute top-2 left-2 bg-black/60 text-turmeric-300 text-xs font-mono px-2 py-0.5 rounded-lg">
            {p.property_id}
          </span>
        )}
        {p.road_access && (
          <span className="absolute top-2 right-2 bg-paddy-700/80 text-white text-xs px-2 py-0.5 rounded-lg">🛣️ Road</span>
        )}
      </div>

      {/* Details */}
      <div className="p-4">
        <p className="text-white font-semibold text-sm mb-0.5">
          {[p.village, p.mandal].filter(Boolean).join(', ')}
        </p>
        <p className="text-white/50 text-xs mb-3">{[p.district, p.state].filter(Boolean).join(', ')}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/70">{p.area_acres} acres · {p.land_soil_type} soil</span>
          <span className="text-turmeric-400 font-bold">₹{totalPrice}</span>
        </div>
        <p className="text-white/35 text-xs mt-1">₹{Number(p.expected_price).toLocaleString('en-IN')}/acre</p>
      </div>
    </Link>
  )
}

export default function PropertiesClient({ properties }) {
  const [filterValues, setFilterValues] = useState({
    state: '', soil: [], land_type: '', acres: {}, price: {},
  })
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Always show all states from locations.json — not just states that have listings
  const filters = [
    { id: 'state', label: 'State', type: 'select', value: filterValues.state,
      options: ALL_STATES.map(s => ({ value: s, label: s })) },
    { id: 'soil', label: 'Soil Type', type: 'checkboxes', value: filterValues.soil,
      options: SOIL_TYPES.map(s => ({ value: s, label: s })) },
    { id: 'land_type', label: 'Land Type', type: 'select', value: filterValues.land_type,
      options: LAND_TYPES.map(t => ({ value: t, label: t })) },
    { id: 'acres', label: 'Area (Acres)', type: 'range', value: filterValues.acres,
      minPlaceholder: 'Min', maxPlaceholder: 'Max' },
    { id: 'price', label: 'Max Price / Acre (₹)', type: 'range', value: filterValues.price,
      maxPlaceholder: 'Max price' },
  ]

  function handleFilterChange(id, val) {
    setFilterValues(f => ({ ...f, [id]: val }))
  }

  function handleReset() {
    setFilterValues({ state: '', soil: [], land_type: '', acres: {}, price: {} })
  }

  const filtered = useMemo(() => properties.filter(p => {
    if (filterValues.state && p.state !== filterValues.state) return false
    if (filterValues.soil.length && !filterValues.soil.includes(p.land_soil_type)) return false
    if (filterValues.land_type && p.land_used_type !== filterValues.land_type) return false
    if (filterValues.acres.min && p.area_acres < Number(filterValues.acres.min)) return false
    if (filterValues.acres.max && p.area_acres > Number(filterValues.acres.max)) return false
    if (filterValues.price.max && p.expected_price > Number(filterValues.price.max)) return false
    return true
  }), [properties, filterValues])

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #071709 0%, #0e2c13 50%, #071709 100%)' }}>
      {/* Header */}
      <div className="border-b border-white/8 px-4 sm:px-6 py-5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-white/50 hover:text-white/70 text-sm transition-colors">← SDV Farms</Link>
              <h1 className="text-white font-display text-2xl font-bold mt-1">Browse Properties</h1>
              <p className="text-white/50 text-sm">{filtered.length} listing{filtered.length !== 1 ? 's' : ''} available</p>
            </div>
            <button
              className="sm:hidden bg-white/10 text-white text-sm px-3 py-2 rounded-xl"
              onClick={() => setMobileFiltersOpen(o => !o)}
            >
              {mobileFiltersOpen ? 'Hide Filters' : 'Filters'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-6">
          {/* Filters sidebar */}
          <div className={`${mobileFiltersOpen ? 'block' : 'hidden'} sm:block w-full sm:w-64 shrink-0`}>
            <FilterPanel
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleReset}
            />
          </div>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-white/15 rounded-2xl">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-white/60 mb-2">No properties match your filters</p>
                <button onClick={handleReset} className="text-turmeric-400 hover:text-turmeric-300 text-sm transition-colors">
                  Reset filters
                </button>
                <div className="mt-6">
                  <Link href="/buyer-request" className="text-white/40 hover:text-white/60 text-sm transition-colors">
                    Can't find what you need? Post a land request →
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map(p => <PropertyCard key={p.id} p={p} />)}
                </div>
                <div className="mt-10 text-center border-t border-white/8 pt-8">
                  <p className="text-white/40 text-sm mb-3">Didn't find the right land?</p>
                  <Link
                    href="/buyer-request"
                    className="inline-block bg-white/10 hover:bg-white/15 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
                  >
                    Post a Land Request →
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
