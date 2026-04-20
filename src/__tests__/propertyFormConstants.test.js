import { describe, expect, it } from '@jest/globals'
import { INITIAL_FORM, mapSellerPropertyRowToForm } from '../app/seller/property/propertyFormConstants.js'

describe('mapSellerPropertyRowToForm', () => {
  it('maps numeric and array fields for edit form', () => {
    const row = {
      state: 'Telangana',
      district: 'Hyderabad',
      mandal: 'X',
      village: 'Y',
      zip_code: '500001',
      farmer_name: 'Test',
      land_used_type: 'Agriculture',
      land_soil_type: 'Black',
      land_doc_type: 'Pahani',
      road_access: true,
      area_acres: 5,
      expected_price: 100000,
      doc_urls: ['https://x/a.pdf'],
      photo_urls: ['https://x/b.jpg'],
    }
    const f = mapSellerPropertyRowToForm(row)
    expect(f.area_acres).toBe('5')
    expect(f.expected_price).toBe('100000')
    expect(f.doc_urls).toEqual(['https://x/a.pdf'])
    expect(f.road_access).toBe(true)
  })

  it('returns INITIAL_FORM for null row', () => {
    expect(mapSellerPropertyRowToForm(null)).toEqual(INITIAL_FORM)
  })
})
