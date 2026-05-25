const { deriveVerificationSignals } = require('../lib/propertyVerification')

describe('deriveVerificationSignals', () => {
  it('uses doc_verified for legal tier when metadata silent', () => {
    expect(deriveVerificationSignals({ doc_verified: true }).legal).toBe('verified')
    expect(deriveVerificationSignals({ doc_verified: false }).legal).toBe('pending')
  })

  it('respects explicit legal override', () => {
    expect(
      deriveVerificationSignals({ doc_verified: false, metadata: { verification: { legal: 'none' } } }).legal,
    ).toBe('none')

    expect(
      deriveVerificationSignals({ doc_verified: true, metadata: { verification: { legal: 'pending' } } }).legal,
    ).toBe('pending')
  })

  it('defaults physical to pending', () => {
    expect(deriveVerificationSignals({ doc_verified: true }).physical).toBe('pending')
  })

  it('parses stringified metadata JSON', () => {
    const row = { doc_verified: false, metadata: JSON.stringify({ verification: { legal: 'verified' } }) }
    expect(deriveVerificationSignals(row).legal).toBe('verified')
  })
})
