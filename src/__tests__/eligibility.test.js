// Eligibility logic from /auth/register — which land types are blocked

const DISALLOWED_LAND_TYPES = [
  'Government land', 'Poramboke', 'Assigned land', 'Forest land',
  'Ceiling land', 'Inam land', 'Civil Dispute land',
]

const isEligible = landType => !DISALLOWED_LAND_TYPES.includes(landType)

describe('Seller registration — land eligibility', () => {
  it('blocks all disallowed land types', () => {
    DISALLOWED_LAND_TYPES.forEach(type => {
      expect(isEligible(type)).toBe(false)
    })
  })

  it('allows Agriculture land', () => {
    expect(isEligible('Agriculture')).toBe(true)
  })

  it('allows Estate Agriculture land', () => {
    expect(isEligible('Estate Agriculture')).toBe(true)
  })

  it('blocks Poramboke specifically', () => {
    expect(isEligible('Poramboke')).toBe(false)
  })

  it('blocks Forest land specifically', () => {
    expect(isEligible('Forest land')).toBe(false)
  })

  it('blocks Government land specifically', () => {
    expect(isEligible('Government land')).toBe(false)
  })

  it('has exactly 7 blocked land types', () => {
    expect(DISALLOWED_LAND_TYPES).toHaveLength(7)
  })
})
