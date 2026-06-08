/**
 * Tests for the /api/listing-submissions POST route validation logic.
 * We extract the pure validation concerns so tests run without Supabase.
 */

const REQUIRED = [
  'submitter_first_name',
  'submitter_last_name',
  'submitter_mobile',
  'state',
  'district',
  'mandal',
  'village',
  'farmer_name',
]

function validateBody(body) {
  for (const field of REQUIRED) {
    if (!body[field] || String(body[field]).trim() === '') {
      return { error: `Missing required field: ${field}` }
    }
  }
  return null
}

function buildRow(body) {
  return {
    submitter_first_name: String(body.submitter_first_name).trim(),
    submitter_last_name:  String(body.submitter_last_name).trim(),
    submitter_mobile:     String(body.submitter_mobile).trim(),
    submitter_email:      body.submitter_email ? String(body.submitter_email).trim() : null,
    state:                String(body.state).trim(),
    district:             String(body.district).trim(),
    mandal:               String(body.mandal).trim(),
    village:              String(body.village).trim(),
    location_notes:       body.location_notes ? String(body.location_notes).trim() : null,
    farmer_name:          String(body.farmer_name).trim(),
    farmer_phone:         body.farmer_phone ? String(body.farmer_phone).trim() : null,
    land_used_type:       body.land_used_type || null,
    land_soil_type:       body.land_soil_type || null,
    area_acres:           body.area_acres ? Number(body.area_acres) : null,
    expected_price:       body.expected_price ? Number(body.expected_price) : null,
    seller_interest:      body.seller_interest || null,
    road_access:          Boolean(body.road_access),
    doc_urls:             Array.isArray(body.doc_urls) ? body.doc_urls : [],
    photo_urls:           Array.isArray(body.photo_urls) ? body.photo_urls : [],
    status:               'new',
  }
}

const VALID_BODY = {
  submitter_first_name: 'Ravi',
  submitter_last_name:  'Kumar',
  submitter_mobile:     '9876543210',
  submitter_email:      'ravi@example.com',
  state:                'Telangana',
  district:             'Rangareddy',
  mandal:               'Chevella',
  village:              'Kongara',
  farmer_name:          'K. Suresh',
}

describe('listing submission — required field validation', () => {
  it('passes for a complete valid body', () => {
    expect(validateBody(VALID_BODY)).toBeNull()
  })

  it.each(REQUIRED)('rejects when %s is missing', (field) => {
    const body = { ...VALID_BODY, [field]: '' }
    const result = validateBody(body)
    expect(result).not.toBeNull()
    expect(result.error).toContain(field)
  })

  it('rejects whitespace-only required fields', () => {
    const body = { ...VALID_BODY, village: '   ' }
    expect(validateBody(body)).not.toBeNull()
  })
})

describe('listing submission — row builder', () => {
  it('trims whitespace from text fields', () => {
    const row = buildRow({ ...VALID_BODY, submitter_first_name: '  Ravi  ' })
    expect(row.submitter_first_name).toBe('Ravi')
  })

  it('sets email to null when omitted', () => {
    const row = buildRow({ ...VALID_BODY, submitter_email: undefined })
    expect(row.submitter_email).toBeNull()
  })

  it('sets email to null when empty string', () => {
    const row = buildRow({ ...VALID_BODY, submitter_email: '' })
    expect(row.submitter_email).toBeNull()
  })

  it('converts area_acres to a number', () => {
    const row = buildRow({ ...VALID_BODY, area_acres: '2.5' })
    expect(row.area_acres).toBe(2.5)
  })

  it('sets area_acres to null when not provided', () => {
    const row = buildRow({ ...VALID_BODY, area_acres: '' })
    expect(row.area_acres).toBeNull()
  })

  it('converts expected_price to a number', () => {
    const row = buildRow({ ...VALID_BODY, expected_price: '500000' })
    expect(row.expected_price).toBe(500000)
  })

  it('defaults road_access to false when not provided', () => {
    const row = buildRow(VALID_BODY)
    expect(row.road_access).toBe(false)
  })

  it('sets road_access to true when truthy', () => {
    const row = buildRow({ ...VALID_BODY, road_access: true })
    expect(row.road_access).toBe(true)
  })

  it('defaults doc_urls and photo_urls to empty arrays', () => {
    const row = buildRow(VALID_BODY)
    expect(row.doc_urls).toEqual([])
    expect(row.photo_urls).toEqual([])
  })

  it('preserves provided doc_urls and photo_urls', () => {
    const row = buildRow({ ...VALID_BODY, doc_urls: ['https://cdn/doc1.pdf'], photo_urls: ['https://cdn/photo1.jpg'] })
    expect(row.doc_urls).toEqual(['https://cdn/doc1.pdf'])
    expect(row.photo_urls).toEqual(['https://cdn/photo1.jpg'])
  })

  it('falls back to empty array when doc_urls is not an array', () => {
    const row = buildRow({ ...VALID_BODY, doc_urls: 'not-an-array' })
    expect(row.doc_urls).toEqual([])
  })

  it('always sets status to "new"', () => {
    const row = buildRow(VALID_BODY)
    expect(row.status).toBe('new')
  })
})
