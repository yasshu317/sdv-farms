/**
 * Unit tests for email verification banner logic.
 * Tests the condition: show banner only when user exists but email is NOT confirmed.
 */

function shouldShowVerificationBanner(user) {
  if (!user) return false
  if (user.email_confirmed_at) return false
  return true
}

describe('shouldShowVerificationBanner', () => {
  it('returns false when user is null', () => {
    expect(shouldShowVerificationBanner(null)).toBe(false)
  })

  it('returns false when user is undefined', () => {
    expect(shouldShowVerificationBanner(undefined)).toBe(false)
  })

  it('returns false when email is already confirmed', () => {
    const user = { email: 'test@test.com', email_confirmed_at: '2025-01-01T10:00:00Z' }
    expect(shouldShowVerificationBanner(user)).toBe(false)
  })

  it('returns true when email_confirmed_at is null', () => {
    const user = { email: 'test@test.com', email_confirmed_at: null }
    expect(shouldShowVerificationBanner(user)).toBe(true)
  })

  it('returns true when email_confirmed_at is undefined', () => {
    const user = { email: 'test@test.com' }
    expect(shouldShowVerificationBanner(user)).toBe(true)
  })

  it('returns true for newly registered user without confirmation', () => {
    const user = { id: 'uuid', email: 'new@sdvfarms.com', email_confirmed_at: null }
    expect(shouldShowVerificationBanner(user)).toBe(true)
  })
})
