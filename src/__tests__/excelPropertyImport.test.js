import { describe, expect, it } from '@jest/globals'
import * as XLSX from 'xlsx'
import {
  TEMPLATE_SHEET_DATA,
  TEMPLATE_SHEET_HELP,
  buildTemplateBuffer,
  parseImportBuffer,
  parseNum,
  pickDataSheetName,
  validateAndBuildPayload,
} from '../lib/excelPropertyImport.js'

describe('parseNum', () => {
  it('strips commas and optional rupee symbol', () => {
    expect(parseNum('1,85,000')).toBe(185000)
    expect(parseNum('₹ 2500')).toBe(2500)
  })

  it('returns null for empty or invalid', () => {
    expect(parseNum('')).toBe(null)
    expect(parseNum('  ')).toBe(null)
    expect(parseNum('abc')).toBe(null)
  })
})

describe('pickDataSheetName', () => {
  it('prefers sheet named Properties (case-insensitive)', () => {
    expect(pickDataSheetName(['How to fill', 'Properties'])).toBe('Properties')
    expect(pickDataSheetName(['properties'])).toBe('properties')
  })

  it('falls back to first sheet', () => {
    expect(pickDataSheetName(['Data only'])).toBe('Data only')
  })

  it('returns null for empty workbook', () => {
    expect(pickDataSheetName([])).toBe(null)
  })
})

describe('buildTemplateBuffer + parseImportBuffer', () => {
  it('emits a workbook with Properties and How to fill tabs', () => {
    const buf = buildTemplateBuffer()
    expect(Buffer.isBuffer(buf)).toBe(true)
    const wb = XLSX.read(buf, { type: 'buffer' })
    expect(wb.SheetNames).toContain(TEMPLATE_SHEET_DATA)
    expect(wb.SheetNames).toContain(TEMPLATE_SHEET_HELP)
  })

  it('parses the Properties sheet and yields the sample data row (empty rows skipped)', () => {
    const buf = buildTemplateBuffer()
    const { rows, rowNumbers, parseWarnings } = parseImportBuffer(buf)
    expect(parseWarnings.length).toBe(0)
    expect(rows).toHaveLength(1)
    expect(rowNumbers[0]).toBe(2)
    expect(rows[0].state).toBe('Telangana')
    expect(rows[0].village).toBe('Bhongir')
    expect(rows[0].area_acres).toBe('4.5')
  })
})

describe('validateAndBuildPayload', () => {
  const baseValid = {
    state: 'Telangana',
    district: 'Nalgonda',
    mandal: 'Nalgonda',
    village: 'Bhongir',
    land_used_type: 'Agriculture',
    land_soil_type: 'Black',
    area_acres: '4.5',
    expected_price: '1850000',
    zip_code: '508116',
    farmer_name: 'Test Farmer',
    land_doc_type: 'Pahani / ROR-1B',
    road_access: 'yes',
    seller_interest: 'interested',
    latitude: '',
    longitude: '',
    doc_urls: 'https://example.com/a.pdf',
    photo_urls: 'https://example.com/b.jpg',
  }

  it('accepts a valid row', () => {
    const r = validateAndBuildPayload({ ...baseValid })
    expect(r.ok).toBe(true)
    expect(r.payload.state).toBe('Telangana')
    expect(r.payload.area_acres).toBe(4.5)
    expect(r.payload.doc_urls).toEqual(['https://example.com/a.pdf'])
    expect(r.payload.road_access).toBe(true)
  })

  it('rejects unknown state', () => {
    const r = validateAndBuildPayload({ ...baseValid, state: 'Mars' })
    expect(r.ok).toBe(false)
    expect(r.errors.some(e => e.includes('Unknown'))).toBe(true)
  })

  it('rejects district not in state', () => {
    const r = validateAndBuildPayload({ ...baseValid, district: 'Not A Real District' })
    expect(r.ok).toBe(false)
  })

  it('rejects non-http URL', () => {
    const r = validateAndBuildPayload({
      ...baseValid,
      doc_urls: 'ftp://bad.example/doc.pdf',
    })
    expect(r.ok).toBe(false)
  })
})
