import { INTEREST_SHORTLIST_MAX } from '../lib/interestShortlist'

describe('interestShortlist', () => {
  it('exports a reasonable cap for buyer wishlist / shortlist', () => {
    expect(INTEREST_SHORTLIST_MAX).toBeGreaterThanOrEqual(4)
    expect(INTEREST_SHORTLIST_MAX).toBeLessThanOrEqual(20)
  })
})
