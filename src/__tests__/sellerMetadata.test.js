const {
  parseSellerMetadata,
  mergeSellerVerificationMetadata,
} = require('../app/seller/property/propertyFormConstants')

describe('parseSellerMetadata', () => {
  it('returns empty object for null', () => {
    expect(parseSellerMetadata(null)).toEqual({})
  })

  it('parses JSON string', () => {
    expect(parseSellerMetadata('{"a":1}')).toEqual({ a: 1 })
  })

  it('clones object', () => {
    const x = { verification: { physical: 'verified' } }
    const out = parseSellerMetadata(x)
    expect(out).toEqual(x)
    expect(out).not.toBe(x)
  })
})

describe('mergeSellerVerificationMetadata', () => {
  it('writes physical tier', () => {
    const out = mergeSellerVerificationMetadata({}, 'verified')
    expect(out.verification.physical).toBe('verified')
  })

  it('preserves other metadata keys', () => {
    const out = mergeSellerVerificationMetadata({ source: 'x', verification: { other: true } }, 'pending')
    expect(out.source).toBe('x')
    expect(out.verification.other).toBe(true)
    expect(out.verification.physical).toBe('pending')
  })
})
