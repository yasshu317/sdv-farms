const { normalizeMarketingRpc, normalizeMarketingFallback } = require('../lib/marketing-stats')

describe('normalizeMarketingRpc', () => {
  it('maps rpc json keys to frontend payload', () => {
    const out = normalizeMarketingRpc({
      available: 11,
      clear_documented: 4,
      sold: 1,
      members: 30,
      listing_partners: 7,
      enquiries: 12,
    })
    expect(out.propertiesListed).toBe(11)
    expect(out.propertiesClearDocumentation).toBe(4)
    expect(out.propertiesSold).toBe(1)
    expect(out.subscribedMembers).toBe(30)
    expect(out.listingPartnersDistinct).toBe(7)
    expect(out.propertyEnquiries).toBe(12)
    expect(out.source).toBe('rpc')
  })
})

describe('normalizeMarketingFallback', () => {
  it('fills defaults', () => {
    const out = normalizeMarketingFallback({
      listings: 2,
      membersCount: 5,
      soldFallback: 0,
      enquiriesFallback: 3,
      clearDocumentation: 1,
      listingPartners: 2,
      fallbackSource: 'unit',
    })
    expect(out.propertiesListed).toBe(2)
    expect(out.listingPartnersDistinct).toBe(2)
    expect(out.source).toBe('unit')
  })
})
