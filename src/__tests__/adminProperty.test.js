/**
 * Unit tests for admin property creation logic.
 * Covers: SDV ID generation, validation rules.
 */

function generatePropertyId(existingCount, year = 2025) {
  return `SDV-${year}-${String(existingCount + 1).padStart(3, '0')}`
}

function validateAdminPropertyForm(form, step) {
  if (step === 0) {
    const missing = ['state', 'district', 'mandal', 'village'].filter(k => !form[k]?.trim())
    if (missing.length > 0) return `Please fill in all location fields (${missing.join(', ')})`
    return null
  }
  if (step === 1) {
    if (!form.land_used_type || !form.land_soil_type) return 'Please select land type and soil type'
    const acres = Number(form.area_acres)
    if (!form.area_acres || acres < 1 || acres > 999) return 'Area must be between 1 and 999 acres'
    if (!form.expected_price || Number(form.expected_price) <= 0) return 'Please enter expected price per acre'
    return null
  }
  return null
}

describe('generatePropertyId', () => {
  it('generates first ID as SDV-2025-001', () => {
    expect(generatePropertyId(0, 2025)).toBe('SDV-2025-001')
  })

  it('generates second ID as SDV-2025-002', () => {
    expect(generatePropertyId(1, 2025)).toBe('SDV-2025-002')
  })

  it('pads correctly for count 9 → 010', () => {
    expect(generatePropertyId(9, 2025)).toBe('SDV-2025-010')
  })

  it('pads correctly for count 99 → 100', () => {
    expect(generatePropertyId(99, 2025)).toBe('SDV-2025-100')
  })

  it('uses the correct year', () => {
    expect(generatePropertyId(0, 2026)).toBe('SDV-2026-001')
  })
})

describe('validateAdminPropertyForm step 0 (Location)', () => {
  const base = { state: 'Telangana', district: 'Nalgonda', mandal: 'Nalgonda', village: 'Peddavoora' }

  it('passes with all location fields filled', () => {
    expect(validateAdminPropertyForm(base, 0)).toBeNull()
  })

  it('fails when state is empty', () => {
    expect(validateAdminPropertyForm({ ...base, state: '' }, 0)).toMatch(/state/)
  })

  it('fails when district is missing', () => {
    expect(validateAdminPropertyForm({ ...base, district: '' }, 0)).toMatch(/district/)
  })

  it('fails when village is missing', () => {
    expect(validateAdminPropertyForm({ ...base, village: '' }, 0)).toMatch(/village/)
  })
})

describe('validateAdminPropertyForm step 1 (Land Details)', () => {
  const base = { land_used_type: 'Agriculture', land_soil_type: 'Black', area_acres: '5', expected_price: '50000' }

  it('passes with all required land details', () => {
    expect(validateAdminPropertyForm(base, 1)).toBeNull()
  })

  it('fails when land_used_type is empty', () => {
    expect(validateAdminPropertyForm({ ...base, land_used_type: '' }, 1)).toMatch(/land type/)
  })

  it('fails when land_soil_type is empty', () => {
    expect(validateAdminPropertyForm({ ...base, land_soil_type: '' }, 1)).toMatch(/soil type/)
  })

  it('fails when area_acres is 0', () => {
    expect(validateAdminPropertyForm({ ...base, area_acres: '0' }, 1)).toMatch(/Area must be between/)
  })

  it('fails when area_acres exceeds 999', () => {
    expect(validateAdminPropertyForm({ ...base, area_acres: '1000' }, 1)).toMatch(/Area must be between/)
  })

  it('passes with area_acres at boundary (1)', () => {
    expect(validateAdminPropertyForm({ ...base, area_acres: '1' }, 1)).toBeNull()
  })

  it('passes with area_acres at boundary (999)', () => {
    expect(validateAdminPropertyForm({ ...base, area_acres: '999' }, 1)).toBeNull()
  })

  it('fails when expected_price is zero', () => {
    expect(validateAdminPropertyForm({ ...base, expected_price: '0' }, 1)).toMatch(/expected price/)
  })

  it('fails when expected_price is negative', () => {
    expect(validateAdminPropertyForm({ ...base, expected_price: '-100' }, 1)).toMatch(/expected price/)
  })
})
