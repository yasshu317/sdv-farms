'use client'
import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import SiteHeader from '../../components/SiteHeader'
import FilterPanel from '../../components/ui/FilterPanel'
import { createClient } from '../../lib/supabase'
import locations from '../../data/locations.json'
import { REGISTER_LIST_LAND } from '../../lib/routes'
import { INTEREST_SHORTLIST_MAX } from '../../lib/interestShortlist'
import { useLang } from '../../context/LanguageContext'
import { content } from '../../data/content'
import { queuePendingShortlistId } from '../../lib/pendingShortlist'
import { safeInternalNextPath } from '../../lib/authRedirects'

const SOIL_TYPES  = ['Black', 'Red', 'Sandy', 'Mixed']
const LAND_TYPES  = ['Agriculture', 'Estate Agriculture', 'Industrial', 'Commercial', 'Residential']
const ALL_STATES  = Object.keys(locations)

function PropertyCard({ p, user, isWishlisted, onToggleWishlist, wishlistLoading, loginNextHref, visitCtaLabel, shortlistAddLabel, shortlistAddedLabel }) {
  const router     = useRouter()
  const photo      = p.photo_urls?.[0]
  const totalPrice = (p.area_acres * p.expected_price).toLocaleString('en-IN')
  const detailHref = `/properties/${p.id}`
  const isOwner    = user && p.seller_id === user.id
  const whatsapp   = `https://wa.me/917780312525?text=Hi%2C+I'm+interested+in+${p.property_id || p.id}+at+${encodeURIComponent([p.village, p.district].filter(Boolean).join(', '))}`

  function handleWishlist(e) {
    e.preventDefault()
    if (!user) {
      if (!isWishlisted) queuePendingShortlistId(p.id)
      router.push(`/auth/login?next=${encodeURIComponent(loginNextHref)}`)
      return
    }
    if (isOwner) return
    onToggleWishlist(p.id, isWishlisted)
  }

  return (
    <div className="group bg-white/5 hover:bg-white/8 border border-white/10 hover:border-turmeric-400/30 rounded-2xl overflow-hidden transition-all flex flex-col">
      {/* ── Clickable photo + info ── */}
      <Link href={detailHref} className="block flex-1">
        <div className="relative h-44 bg-paddy-900/40 overflow-hidden">
          {photo ? (
            <Image src={photo} alt="Property" fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-5xl opacity-30">🌾</span>
            </div>
          )}
          <div className="absolute top-2 left-2">
            {p.property_id && (
              <span className="bg-black/60 text-turmeric-300 text-xs font-mono px-2 py-0.5 rounded-lg">
                {p.property_id}
              </span>
            )}
          </div>
          <div className="absolute top-2 right-2 flex gap-1.5">
            {p.road_access && (
              <span className="bg-paddy-800/85 border border-white/10 text-white/85 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md">
                Road
              </span>
            )}
          </div>
        </div>
        <div className="p-4">
          <p className="text-white font-semibold text-sm mb-0.5">
            {[p.village, p.mandal].filter(Boolean).join(', ') || p.district}
          </p>
          <p className="text-white/50 text-xs mb-3">{[p.district, p.state].filter(Boolean).join(', ')}</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">{p.area_acres} acres · {p.land_soil_type} soil</span>
            <span className="text-turmeric-400 font-bold">₹{totalPrice}</span>
          </div>
          <p className="text-white/35 text-xs mt-1">₹{Number(p.expected_price).toLocaleString('en-IN')}/acre</p>
        </div>
      </Link>

      {/* ── Quick action bar ── */}
      <div className="flex gap-2 px-4 pb-4">
        <Link
          href={`${detailHref}?book=1`}
          className="flex-1 flex items-center justify-center bg-turmeric-500 hover:bg-turmeric-600 active:scale-[0.98] text-white text-xs font-semibold py-2.5 rounded-xl transition-all border border-turmeric-400/40 shadow-[0_1px_0_0_rgba(0,0,0,0.25)]"
        >
          {visitCtaLabel}
        </Link>
        {!isOwner && (
          <button
            onClick={handleWishlist}
            disabled={wishlistLoading}
            title={isWishlisted ? shortlistAddedLabel : shortlistAddLabel}
            className={`min-w-[5.75rem] sm:min-w-0 shrink-0 px-3 rounded-xl border text-xs font-semibold transition-all disabled:opacity-50 ${
              isWishlisted
                ? 'bg-paddy-900/60 border-paddy-500/35 text-paddy-200'
                : 'bg-white/[0.06] hover:bg-white/12 border-white/14 text-white/80'
            }`}
          >
            {isWishlisted ? shortlistAddedLabel : shortlistAddLabel}
          </button>
        )}
        <a
          href={whatsapp}
          target="_blank" rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center bg-white/[0.06] hover:bg-white/12 border border-white/14 text-white/90 text-xs font-semibold py-2.5 rounded-xl transition-all"
        >
          Enquire
        </a>
      </div>
    </div>
  )
}

export default function PropertiesClient({ properties, user = null, wishlistIds: initialWishlistIds = [] }) {
  const { lang } = useLang()
  const nav = content[lang].nav
  const ctaLabels = content[lang].cta
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const loginNextHref = useMemo(() => {
    const q = searchParams.toString()
    const raw = q ? `${pathname}?${q}` : pathname || '/properties'
    return safeInternalNextPath(raw) ?? '/properties'
  }, [pathname, searchParams])
  const [filterValues, setFilterValues] = useState({
    state: '', district: '', mandal: '', soil: [], land_type: '', acres: {}, price: {},
  })
  const [wishlistIds, setWishlistIds] = useState(() => new Set(initialWishlistIds))
  const [wishlistLoading, setWishlistLoading] = useState(false)

  const handleToggleWishlist = useCallback(async (propertyId, currentlyWishlisted) => {
    setWishlistLoading(true)
    const supabase = createClient()
    if (currentlyWishlisted) {
      await supabase.from('buyer_wishlist').delete().eq('buyer_id', user.id).eq('property_id', propertyId)
      setWishlistIds(prev => { const s = new Set(prev); s.delete(propertyId); return s })
    } else {
      const { count } = await supabase
        .from('buyer_wishlist')
        .select('id', { count: 'exact', head: true })
        .eq('buyer_id', user.id)
      if (count >= INTEREST_SHORTLIST_MAX) {
        alert(`${ctaLabels.shortlistLimitPart1}${INTEREST_SHORTLIST_MAX}${ctaLabels.shortlistLimitPart2}`)
        setWishlistLoading(false)
        return
      }
      await supabase.from('buyer_wishlist').insert({ buyer_id: user.id, property_id: propertyId })
      setWishlistIds(prev => new Set([...prev, propertyId]))
    }
    setWishlistLoading(false)
  }, [user])
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const districts = filterValues.state ? Object.keys(locations[filterValues.state] || {}) : []
  const mandals   = filterValues.state && filterValues.district
    ? (locations[filterValues.state]?.[filterValues.district] || [])
    : []

  const filters = [
    { id: 'state', label: 'State', type: 'select', value: filterValues.state,
      options: ALL_STATES.map(s => ({ value: s, label: s })) },
    ...(districts.length ? [{
      id: 'district', label: 'District', type: 'select', value: filterValues.district,
      options: districts.map(d => ({ value: d, label: d })),
    }] : []),
    ...(mandals.length ? [{
      id: 'mandal', label: 'Mandal', type: 'select', value: filterValues.mandal,
      options: mandals.map(m => ({ value: m, label: m })),
    }] : []),
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
    if (id === 'state') {
      setFilterValues(f => ({ ...f, state: val, district: '', mandal: '' }))
    } else if (id === 'district') {
      setFilterValues(f => ({ ...f, district: val, mandal: '' }))
    } else {
      setFilterValues(f => ({ ...f, [id]: val }))
    }
  }

  function handleReset() {
    setFilterValues({ state: '', district: '', mandal: '', soil: [], land_type: '', acres: {}, price: {} })
  }

  const filtered = useMemo(() => properties.filter(p => {
    if (filterValues.state    && p.state    !== filterValues.state)    return false
    if (filterValues.district && p.district !== filterValues.district) return false
    if (filterValues.mandal   && p.mandal   !== filterValues.mandal)   return false
    if (filterValues.soil.length && !filterValues.soil.includes(p.land_soil_type)) return false
    if (filterValues.land_type && p.land_used_type !== filterValues.land_type) return false
    if (filterValues.acres.min && p.area_acres < Number(filterValues.acres.min)) return false
    if (filterValues.acres.max && p.area_acres > Number(filterValues.acres.max)) return false
    if (filterValues.price.max && p.expected_price > Number(filterValues.price.max)) return false
    return true
  }), [properties, filterValues])

  const hasActiveFilters = filterValues.state || filterValues.district || filterValues.mandal ||
    filterValues.soil.length || filterValues.land_type ||
    filterValues.acres.min || filterValues.acres.max || filterValues.price.max

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #071709 0%, #0e2c13 50%, #071709 100%)' }}>
      <SiteHeader active="properties" />

      {/* Hero banner */}
      <div
        className="relative overflow-hidden border-b border-white/8 px-4 sm:px-6 py-10 text-center"
        style={{ background: 'linear-gradient(135deg, #0e2c13 0%, #1a4520 50%, #0e2c13 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(212,160,23,0.8) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <div className="relative max-w-6xl mx-auto">
          <p className="text-white/40 text-xs">
            <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
            <span className="mx-1.5">·</span>
            <span className="text-white/55">{nav.properties}</span>
          </p>
          <h1 className="text-white font-display text-3xl sm:text-4xl font-bold mt-3 mb-2">
            Find Your Agricultural Land
          </h1>
          <p className="text-white/50 text-sm mb-5">
            Browse verified listings across Telangana, Andhra Pradesh & Karnataka
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-white/45">
            <span className="text-white/55">Clear title</span>
            <span className="text-white/25" aria-hidden>·</span>
            <span className="text-white/55">Documents verified</span>
            <span className="text-white/25" aria-hidden>·</span>
            <span className="text-white/55">{ctaLabels.interestedShort}</span>
          </div>

          {/* Mobile filter toggle */}
          <button
            className="sm:hidden mt-5 bg-white/10 border border-white/15 text-white text-sm px-4 py-2 rounded-xl"
            onClick={() => setMobileFiltersOpen(o => !o)}
          >
            {mobileFiltersOpen ? 'Hide Filters ↑' : `Filters ${hasActiveFilters ? '●' : '+'}`}
          </button>
        </div>
      </div>

      {/* Results count bar */}
      <div className="border-b border-white/6 px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p
            className="text-white/50 text-sm"
            data-testid="properties-results-summary"
          >
            <span className="text-white font-semibold">{filtered.length}</span> listing{filtered.length !== 1 ? 's' : ''} found
            {hasActiveFilters && <span className="text-turmeric-400/70"> (filtered)</span>}
          </p>
          {hasActiveFilters && (
            <button onClick={handleReset} className="text-turmeric-400 hover:text-turmeric-300 text-xs transition-colors">
              Clear all filters ×
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-6 items-start">
          {/* Filters sidebar — sticky on desktop */}
          <div className={`${mobileFiltersOpen ? 'block' : 'hidden'} sm:block w-full sm:w-64 shrink-0 sm:sticky sm:top-20`}>
            <FilterPanel
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleReset}
            />
          </div>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {filtered.length === 0 && properties.length === 0 ? (
              /* No properties at all — invite sellers */
              <div className="text-center py-20 border border-dashed border-white/15 rounded-2xl px-6">
                <div className="text-5xl mb-4">🌾</div>
                <h3 className="text-white font-semibold text-lg mb-2">No properties listed yet</h3>
                <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">
                  Be the first to list your agricultural land on SDV Farms. Free, fast, and government-verified.
                </p>
                <Link
                  href={REGISTER_LIST_LAND}
                  className="inline-block btn-gold px-6 py-2.5 text-sm rounded-xl"
                >
                  List Your Land →
                </Link>
                <div className="mt-4">
                  <Link href="/buyer-request" className="text-white/35 hover:text-white/55 text-sm transition-colors">
                    Or post a land request →
                  </Link>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              /* Has properties but filter returns 0 */
              <div className="text-center py-20 border border-dashed border-white/15 rounded-2xl">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-white/60 mb-1 font-medium">No properties match your filters</p>
                <p className="text-white/35 text-sm mb-4">Try removing some filters to see more results</p>
                <button onClick={handleReset} className="text-turmeric-400 hover:text-turmeric-300 text-sm font-medium transition-colors">
                  Reset all filters
                </button>
                <div className="mt-6 border-t border-white/8 pt-6">
                  <p className="text-white/35 text-sm mb-2">Can't find what you're looking for?</p>
                  <Link href="/buyer-request" className="text-white/50 hover:text-white/70 text-sm transition-colors font-medium">
                    Post a Land Request →
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map(p => (
                    <PropertyCard
                      key={p.id}
                      p={p}
                      user={user}
                      isWishlisted={wishlistIds.has(p.id)}
                      onToggleWishlist={handleToggleWishlist}
                      wishlistLoading={wishlistLoading}
                      loginNextHref={loginNextHref}
                      visitCtaLabel={ctaLabels.interested}
                      shortlistAddLabel={ctaLabels.shortlistAddTo}
                      shortlistAddedLabel={ctaLabels.shortlistAdded}
                    />
                  ))}
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
