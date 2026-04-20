import { describe, expect, it } from '@jest/globals'
import { adminField, storageLinkLabel } from '../lib/adminDisplay'

describe('adminField', () => {
  it('returns em dash for null, undefined, empty string', () => {
    expect(adminField(null)).toBe('—')
    expect(adminField(undefined)).toBe('—')
    expect(adminField('')).toBe('—')
  })

  it('stringifies other values', () => {
    expect(adminField(0)).toBe('0')
    expect(adminField(false)).toBe('false')
    expect(adminField('Guntur')).toBe('Guntur')
  })
})

describe('storageLinkLabel', () => {
  it('uses last path segment decoded as label', () => {
    expect(storageLinkLabel('https://x.supabase.co/storage/v1/object/public/bucket/folder/my-doc.pdf', 0)).toBe('my-doc.pdf')
  })

  it('truncates long segment names', () => {
    const long = 'a'.repeat(60) + '.pdf'
    const url = `https://x.com/${encodeURIComponent(long)}`
    const label = storageLinkLabel(url, 0)
    expect(label.length).toBeLessThanOrEqual(52)
    expect(label.endsWith('…')).toBe(true)
  })

  it('falls back to File n when segment empty', () => {
    expect(storageLinkLabel('https://x.com/', 2)).toBe('File 3')
  })

  it('falls back on malformed URL decode', () => {
    // decodeURIComponent throws on invalid % sequences in some engines; helper catches
    expect(storageLinkLabel('%E0%A4%A', 0)).toBe('File 1')
  })
})
