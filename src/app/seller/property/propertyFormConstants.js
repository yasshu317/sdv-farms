export const STEPS = ['Location', 'Land Details', 'Documents & Photos']

export const LAND_USED_TYPES = ['Agriculture', 'Estate Agriculture', 'Industrial', 'Commercial', 'Residential']
export const LAND_SOIL_TYPES = ['Black', 'Red', 'Sandy', 'Mixed']

export const DOC_TYPE_BY_STATE = {
  'Andhra Pradesh': 'Adangal / 1B',
  Telangana: 'Pahani / ROR-1B',
  Karnataka: 'RTC',
}

export const OWNER_RELATIONS = ['Self', 'Wife', 'Daughter', 'Son', 'Mother', 'Father', 'G.Mother', 'G.Father']

export const SELLER_INTEREST_OPTIONS = [
  { value: 'urgent_sale',   label: 'Urgent Sale' },
  { value: 'ready_to_sale', label: 'Ready to Sell' },
  { value: 'interested',    label: 'Interested / Open' },
]

export const VERIFY_PHYSICAL_OPTIONS = [
  { value: 'pending', label: 'Physical visit — pending' },
  { value: 'verified', label: 'Physical visit — verified' },
  { value: 'none', label: 'Physical visit — not applicable / none' },
]

export const INITIAL_FORM = {
  state: '',
  district: '',
  mandal: '',
  village: '',
  zip_code: '',
  farmer_name: '',
  owner_relation: '',
  land_used_type: '',
  land_soil_type: '',
  land_doc_type: '',
  road_access: false,
  area_acres: '',
  expected_price: '',
  seller_interest: '',
  doc_urls: [],
  photo_urls: [],
}

/** @param {unknown} raw */
export function parseSellerMetadata(raw) {
  if (raw == null || raw === '') return {}
  if (typeof raw === 'string') {
    try {
      const x = JSON.parse(raw)
      return x && typeof x === 'object' ? { ...x } : {}
    } catch {
      return {}
    }
  }
  if (typeof raw === 'object') return { ...raw }
  return {}
}

/** @param {unknown} existing Previous row.metadata */
export function mergeSellerVerificationMetadata(existing, physicalStatus) {
  const m = parseSellerMetadata(existing)
  m.verification = {
    ...(typeof m.verification === 'object' && m.verification !== null ? m.verification : {}),
    physical: physicalStatus,
  }
  return m
}

/** Map DB row → form state for edit */
export function mapSellerPropertyRowToForm(row) {
  if (!row) return { ...INITIAL_FORM }
  return {
    state: row.state || '',
    district: row.district || '',
    mandal: row.mandal || '',
    village: row.village || '',
    zip_code: row.zip_code || '',
    farmer_name: row.farmer_name || '',
    owner_relation: row.owner_relation || '',
    land_used_type: row.land_used_type || '',
    land_soil_type: row.land_soil_type || '',
    land_doc_type: row.land_doc_type || '',
    road_access: !!row.road_access,
    area_acres: row.area_acres != null ? String(row.area_acres) : '',
    expected_price: row.expected_price != null ? String(row.expected_price) : '',
    seller_interest: row.seller_interest || '',
    doc_urls: Array.isArray(row.doc_urls) ? [...row.doc_urls] : [],
    photo_urls: Array.isArray(row.photo_urls) ? [...row.photo_urls] : [],
    doc_verified: !!row.doc_verified,
    metadata: parseSellerMetadata(row.metadata),
    verify_physical: (() => {
      const phy = parseSellerMetadata(row.metadata).verification?.physical
      return phy === 'verified' || phy === 'none' || phy === 'pending' ? phy : 'pending'
    })(),
  }
}

export function urlsToInitialItems(urls, labelPrefix) {
  return (urls || []).map((url, i) => ({
    name: nameFromStorageUrl(url, i, labelPrefix),
    url,
  }))
}

function nameFromStorageUrl(url, i, labelPrefix) {
  try {
    const path = decodeURIComponent(new URL(url).pathname.split('/').pop() || '')
    const cleaned = path.replace(/^[\da-f-]{36}-/i, '').replace(/^[\d]+-/, '')
    return cleaned.length > 0 && cleaned.length < 80 ? cleaned : `${labelPrefix} ${i + 1}`
  } catch {
    return `${labelPrefix} ${i + 1}`
  }
}
