import { describe, expect, it } from '@jest/globals'
import { sanitizeStorageFileName } from '../lib/storageFilename.js'

describe('sanitizeStorageFileName', () => {
  it('preserves simple ASCII names', () => {
    expect(sanitizeStorageFileName('report.pdf')).toBe('report.pdf')
    expect(sanitizeStorageFileName('IMG_001.jpg')).toBe('IMG_001.jpg')
  })

  it('replaces spaces with hyphens', () => {
    expect(sanitizeStorageFileName('my land doc.pdf')).toBe('my-land-doc.pdf')
  })

  it('normalizes unicode punctuation (en-dash) that breaks Storage keys', () => {
    const withEnDash = 'SDV-Farms-\u2013-Phase-1-_-Secure-Land-Investment.pdf'
    const out = sanitizeStorageFileName(withEnDash)
    expect(out).toMatch(/\.pdf$/)
    expect(out).not.toContain('\u2013')
    expect(out).toMatch(/^SDV-Farms-Phase-1-_-Secure-Land-Investment\.pdf$/)
  })

  it('strips path segments from names', () => {
    expect(sanitizeStorageFileName('C:\\fake\\path\\doc.pdf')).toBe('doc.pdf')
  })

  it('handles missing extension', () => {
    expect(sanitizeStorageFileName('nodots')).toBe('nodots')
  })
})
