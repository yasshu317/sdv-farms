import * as XLSX from 'xlsx'
import locations from '../data/locations.json'

export const MAX_IMPORT_ROWS = 100

const LAND_USED_TYPES = ['Agriculture', 'Estate Agriculture', 'Industrial', 'Commercial', 'Residential']
const LAND_SOIL_TYPES = ['Black', 'Red', 'Sandy', 'Mixed']
const SELLER_INTEREST_VALUES = ['urgent_sale', 'ready_to_sale', 'interested']

const DOC_TYPE_BY_STATE = {
  'Andhra Pradesh': 'Adangal / 1B',
  Telangana: 'Pahani / ROR-1B',
  Karnataka: 'RTC',
}

/** First column header row in the downloadable template (human-readable). */
export const TEMPLATE_DISPLAY_HEADERS = [
  'State',
  'District',
  'Mandal',
  'Village',
  'Land used type',
  'Soil type',
  'Area (acres)',
  'Expected price per acre (INR)',
  'Zip code',
  'Farmer / owner name',
  'Land document type',
  'Road access (yes/no)',
  'Seller interest',
  'Latitude',
  'Longitude',
  'Document URLs',
  'Photo URLs',
]

/** Worksheet with data rows. Import reads this tab by name (or first sheet). */
export const TEMPLATE_SHEET_DATA = 'Properties'

/** Read-only instructions tab in the downloadable workbook. */
export const TEMPLATE_SHEET_HELP = 'How to fill'

const HEADER_ALIASES = {
  state: ['state'],
  district: ['district'],
  mandal: ['mandal', 'taluk', 'mandal / taluk'],
  village: ['village', 'village / area'],
  land_used_type: ['land_used_type', 'land use', 'land used type', 'land used_type'],
  land_soil_type: ['land_soil_type', 'soil type', 'soil', 'soil_type'],
  area_acres: ['area_acres', 'acres', 'area (acres)', 'area'],
  expected_price: [
    'expected_price',
    'price per acre',
    'expected price',
    'expected price / acre',
    'expected price per acre (inr)',
    'expected price per acre',
    'price',
    'price_per_acre',
  ],
  zip_code: ['zip_code', 'zip', 'pin code', 'pincode', 'zip code'],
  farmer_name: ['farmer_name', 'farmer / owner name', 'owner name', 'farmer name'],
  land_doc_type: ['land_doc_type', 'document type', 'doc type', 'land document type', 'land_doc'],
  road_access: ['road_access', 'road access', 'road access (yes/no)'],
  seller_interest: ['seller_interest', 'seller interest', 'urgency'],
  latitude: ['latitude', 'lat'],
  longitude: ['longitude', 'lng', 'lon', 'long'],
  doc_urls: ['doc_urls', 'document urls', 'documents', 'doc links'],
  photo_urls: ['photo_urls', 'photo urls', 'photos', 'photo links'],
}

function mapHeaderToCanonical(headerCell) {
  const raw = String(headerCell ?? '').trim()
  if (!raw) return null
  const lower = raw.toLowerCase()
  for (const [canonical, aliases] of Object.entries(HEADER_ALIASES)) {
    for (const a of aliases) {
      if (lower === a.toLowerCase()) return canonical
    }
  }
  const slug = lower
    .replace(/[₹]/g, '')
    .replace(/[()]/g, ' ')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
  if (Object.prototype.hasOwnProperty.call(HEADER_ALIASES, slug)) return slug
  return null
}

function splitUrls(v) {
  if (v == null || v === '') return []
  const s = String(v).trim()
  if (!s) return []
  return s
    .split(/[\n,|;]+/)
    .map(x => x.trim())
    .filter(Boolean)
}

export function parseNum(v) {
  if (v === '' || v == null) return null
  const s = String(v).replace(/,/g, '').replace(/^\s*₹?\s*/, '').trim()
  if (s === '') return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

function parseBool(v) {
  if (v === true || v === false) return v
  const s = String(v ?? '')
    .trim()
    .toLowerCase()
  if (['yes', 'y', 'true', '1', '✓', 'x'].includes(s)) return true
  if (['no', 'n', 'false', '0', ''].includes(s)) return false
  return null
}

function resolveState(input) {
  const raw = String(input ?? '').trim()
  if (!raw) return { ok: false, error: 'state is required' }
  if (locations[raw]) return { ok: true, state: raw }
  const found = Object.keys(locations).find(k => k.toLowerCase() === raw.toLowerCase())
  if (found) return { ok: true, state: found }
  return { ok: false, error: `Unknown state "${raw}"` }
}

function resolveDistrict(state, input) {
  const raw = String(input ?? '').trim()
  if (!raw) return { ok: false, error: 'district is required' }
  const dists = locations[state]
  if (!dists) return { ok: false, error: 'internal: invalid state' }
  if (dists[raw]) return { ok: true, district: raw }
  const found = Object.keys(dists).find(k => k.toLowerCase() === raw.toLowerCase())
  if (found) return { ok: true, district: found }
  return { ok: false, error: `District "${raw}" is not in ${state}` }
}

function resolveMandal(state, district, input) {
  const raw = String(input ?? '').trim()
  if (!raw) return { ok: false, error: 'mandal is required' }
  const mandals = locations[state]?.[district]
  if (!Array.isArray(mandals)) return { ok: false, error: 'internal: invalid district' }
  if (mandals.includes(raw)) return { ok: true, mandal: raw }
  const found = mandals.find(m => m.toLowerCase() === raw.toLowerCase())
  if (found) return { ok: true, mandal: found }
  return { ok: false, error: `Mandal "${raw}" is not listed under ${district}` }
}

function matchEnum(raw, allowed, field) {
  const s = String(raw ?? '').trim()
  if (!s) return { ok: false, error: `${field} is required` }
  if (allowed.includes(s)) return { ok: true, value: s }
  const found = allowed.find(a => a.toLowerCase() === s.toLowerCase())
  if (found) return { ok: true, value: found }
  return { ok: false, error: `${field} must be one of: ${allowed.join(', ')}` }
}

function normalizeSellerInterest(v) {
  const s = String(v ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
  if (!s) return { ok: true, value: null }
  if (SELLER_INTEREST_VALUES.includes(s)) return { ok: true, value: s }
  if (s === 'ready_to_sell') return { ok: true, value: 'ready_to_sale' }
  if (s === 'urgent' || s === 'urgent_sale') return { ok: true, value: 'urgent_sale' }
  return { ok: false, error: `seller_interest must be empty or one of: ${SELLER_INTEREST_VALUES.join(', ')}` }
}

/** Human-readable rows for the "How to fill" tab (column A). */
export const TEMPLATE_HELP_LINES = [
  ['SDV Farms — property bulk import'],
  [''],
  ['STEP 1 — Work on the "' + TEMPLATE_SHEET_DATA + '" tab'],
  ['• Row 1 is the header row — do not rename, delete, or reorder columns.'],
  ['• Row 2 is a complete SAMPLE row (real values that pass validation, including example https URLs).'],
  ['   Delete row 2 before uploading if you do NOT want that sample listing created.'],
  ['• Add your listings from row 3 downward — one row per property. Extra blank rows are ignored.'],
  [''],
  ['STEP 2 — Required columns (every listing)'],
  ['State, District, Mandal, Village, Land used type, Soil type, Area (acres), Expected price per acre (INR).'],
  [''],
  ['STEP 3 — Location values'],
  ['Must match the same State → District → Mandal lists as Admin → Add Property in the app.'],
  ['Typo or value not in the list → that row will fail with an error on import.'],
  [''],
  ['STEP 4 — Allowed text values'],
  ['Land used type: Agriculture | Estate Agriculture | Industrial | Commercial | Residential'],
  ['Soil type: Black | Red | Sandy | Mixed'],
  ['Road access: yes or no (blank = no).'],
  ['Seller interest (optional): urgent_sale | ready_to_sale | interested — or leave blank.'],
  [''],
  ['STEP 5 — Optional columns'],
  ['Zip code, Farmer / owner name, Land document type (or leave blank — default by state),'],
  ['Latitude, Longitude, Document URLs, Photo URLs.'],
  [''],
  ['STEP 6 — URLs in the sheet'],
  ['Use full https:// links. Separate multiple URLs with comma, semicolon, pipe, or newline.'],
  [''],
  ['STEP 7 — Upload'],
  ['Admin → Import Excel. Max ' + String(MAX_IMPORT_ROWS) + ' data rows per file, 2 MB max.'],
]

/**
 * Choose which worksheet to import: sheet named "Properties" (case-insensitive), else first sheet.
 */
export function pickDataSheetName(sheetNames) {
  if (!sheetNames?.length) return null
  const found = sheetNames.find(n => String(n).trim().toLowerCase() === TEMPLATE_SHEET_DATA.toLowerCase())
  return found ?? sheetNames[0]
}

/** Full sample row (same order as TEMPLATE_DISPLAY_HEADERS) — valid for import. */
const TEMPLATE_SAMPLE_ROW = [
  'Telangana',
  'Nalgonda',
  'Nalgonda',
  'Bhongir',
  'Agriculture',
  'Black',
  '4.5',
  '1850000',
  '508116',
  'K. Sample Reddy',
  'Pahani / ROR-1B',
  'yes',
  'ready_to_sale',
  '17.8715',
  '79.0844',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  'https://example.com/sample-land-photo.jpg',
]

/** Build template .xlsx: Properties (headers + sample + empty rows) + How to fill (instructions). */
export function buildTemplateBuffer() {
  const headerAndSample = [TEMPLATE_DISPLAY_HEADERS, TEMPLATE_SAMPLE_ROW]
  const emptyRows = Array.from({ length: 6 }, () => TEMPLATE_DISPLAY_HEADERS.map(() => ''))
  const propMatrix = [...headerAndSample, ...emptyRows]

  const wb = XLSX.utils.book_new()

  const wsProps = XLSX.utils.aoa_to_sheet(propMatrix)
  wsProps['!cols'] = TEMPLATE_DISPLAY_HEADERS.map((h, i) => ({ wch: i >= 15 ? 28 : Math.max(14, String(h).length + 2) }))

  XLSX.utils.book_append_sheet(wb, wsProps, TEMPLATE_SHEET_DATA)

  const wsHelp = XLSX.utils.aoa_to_sheet(TEMPLATE_HELP_LINES.map(r => (Array.isArray(r) ? r : [r])))
  wsHelp['!cols'] = [{ wch: 92 }]
  XLSX.utils.book_append_sheet(wb, wsHelp, TEMPLATE_SHEET_HELP)

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
}

/**
 * @param {Buffer} buffer
 * @returns {{ rows: object[], parseWarnings: string[] }}
 */
export function parseImportBuffer(buffer) {
  const wb = XLSX.read(buffer, { type: 'buffer', cellDates: false, dense: false })
  const name = pickDataSheetName(wb.SheetNames)
  if (!name) return { rows: [], rowNumbers: [], parseWarnings: ['Workbook has no sheets'], sheetName: null }

  const sheet = wb.Sheets[name]
  const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', blankrows: false })

  const parseWarnings = []
  if (!matrix.length) return { rows: [], rowNumbers: [], parseWarnings: ['Sheet is empty'], sheetName: name }

  const headerRow = matrix[0]
  const colMap = []
  for (let c = 0; c < headerRow.length; c++) {
    const canon = mapHeaderToCanonical(headerRow[c])
    colMap[c] = canon
    const h = String(headerRow[c] ?? '').trim()
    if (h && !canon) parseWarnings.push(`Unknown column skipped: "${h}"`)
  }

  const rows = []
  /** Parallel 1-based Excel row numbers aligned with sheet (header row = 1). */
  const rowNumbers = []
  for (let r = 1; r < matrix.length; r++) {
    const line = matrix[r]
    const obj = {}
    for (let c = 0; c < line.length; c++) {
      const key = colMap[c]
      if (!key) continue
      let val = line[c]
      if (val != null && typeof val !== 'string') val = String(val)
      if (typeof val === 'string') val = val.trim()
      obj[key] = val
    }
    const blank =
      !String(obj.state ?? '').trim() &&
      !String(obj.district ?? '').trim() &&
      !String(obj.village ?? '').trim() &&
      !String(obj.area_acres ?? '').trim()
    if (blank) continue
    rows.push(obj)
    rowNumbers.push(r + 1)
  }

  return { rows, rowNumbers, sheetName: name, parseWarnings }
}

/**
 * @param {object} row normalized key object
 * @param {number} _sheetRow 1-based data row index (for callers; unused here)
 */
export function validateAndBuildPayload(row, _sheetRow = 0) {
  const errors = []
  const st = resolveState(row.state)
  if (!st.ok) errors.push(st.error)
  let district = ''
  let mandal = ''
  let state = ''
  if (st.ok) {
    state = st.state
    const d = resolveDistrict(state, row.district)
    if (!d.ok) errors.push(d.error)
    else district = d.district
    if (d.ok) {
      const m = resolveMandal(state, district, row.mandal)
      if (!m.ok) errors.push(m.error)
      else mandal = m.mandal
    }
  }

  const village = String(row.village ?? '').trim()
  if (!village) errors.push('village is required')

  const lut = matchEnum(row.land_used_type, LAND_USED_TYPES, 'land_used_type')
  if (!lut.ok) errors.push(lut.error)

  const soil = matchEnum(row.land_soil_type, LAND_SOIL_TYPES, 'land_soil_type')
  if (!soil.ok) errors.push(soil.error)

  const acres = parseNum(row.area_acres)
  if (acres == null || acres < 1 || acres > 999) errors.push('area_acres must be a number from 1 to 999')

  const price = parseNum(row.expected_price)
  if (price == null || price <= 0) errors.push('expected_price must be a positive number (per acre)')

  const roadRaw = row.road_access
  let road_access = false
  if (roadRaw !== '' && roadRaw != null) {
    const pb = parseBool(roadRaw)
    if (pb === null) errors.push('road_access must be yes/no (or leave blank for no)')
    else road_access = pb
  }

  const si = normalizeSellerInterest(row.seller_interest)
  if (!si.ok) errors.push(si.error)

  const lat = row.latitude !== '' && row.latitude != null ? parseNum(row.latitude) : null
  const lng = row.longitude !== '' && row.longitude != null ? parseNum(row.longitude) : null
  if (lat != null && (lat < -90 || lat > 90)) errors.push('latitude must be between -90 and 90')
  if (lng != null && (lng < -180 || lng > 180)) errors.push('longitude must be between -180 and 180')

  const doc_urls = splitUrls(row.doc_urls)
  const photo_urls = splitUrls(row.photo_urls)
  for (const u of [...doc_urls, ...photo_urls]) {
    try {
      const parsed = new URL(u)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        errors.push(`Only http/https URLs allowed: ${u}`)
      }
    } catch {
      errors.push(`Invalid URL in doc/photo list: ${u}`)
    }
  }

  if (errors.length) {
    return { ok: false, errors }
  }

  const zip = String(row.zip_code ?? '').trim()
  const farmer = String(row.farmer_name ?? '').trim()
  let land_doc_type = String(row.land_doc_type ?? '').trim()
  if (!land_doc_type && state) land_doc_type = DOC_TYPE_BY_STATE[state] || ''

  return {
    ok: true,
    payload: {
      state,
      district,
      mandal,
      village,
      zip_code: zip || null,
      farmer_name: farmer || null,
      land_used_type: lut.value,
      land_soil_type: soil.value,
      land_doc_type: land_doc_type || null,
      road_access,
      area_acres: acres,
      expected_price: price,
      seller_interest: si.value,
      latitude: lat,
      longitude: lng,
      doc_urls,
      photo_urls,
      listing_type: 'sale',
      doc_verified: false,
    },
  }
}
