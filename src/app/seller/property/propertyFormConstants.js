export const STEPS = ['Location', 'Land Details', 'Documents & Photos']

export const LAND_USED_TYPES = ['Agriculture', 'Estate Agriculture', 'Industrial', 'Commercial', 'Residential']
export const LAND_SOIL_TYPES = ['Black', 'Red', 'Sandy', 'Mixed']

export const DOC_TYPE_BY_STATE = {
  'Andhra Pradesh': 'Adangal / 1B',
  Telangana: 'Pahani / ROR-1B',
  Karnataka: 'RTC',
}

export const INITIAL_FORM = {
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
    land_used_type: row.land_used_type || '',
    land_soil_type: row.land_soil_type || '',
    land_doc_type: row.land_doc_type || '',
    road_access: !!row.road_access,
    area_acres: row.area_acres != null ? String(row.area_acres) : '',
    expected_price: row.expected_price != null ? String(row.expected_price) : '',
    doc_urls: Array.isArray(row.doc_urls) ? [...row.doc_urls] : [],
    photo_urls: Array.isArray(row.photo_urls) ? [...row.photo_urls] : [],
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
