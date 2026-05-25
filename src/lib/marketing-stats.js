/**
 * Normalizes marketing stats for `/api/platform-stats` and the homepage KPI strip.
 * @typedef {Record<string, unknown>} JsonRow
 */

/**
 * @param {JsonRow} row
 */
export function normalizeMarketingRpc(row) {
  const n = x => {
    const v = Number(x)
    return Number.isFinite(v) ? v : 0
  }

  return {
    propertiesListed: n(row.available),
    propertiesClearDocumentation: n(row.clear_documented),
    propertiesSold: n(row.sold),
    subscribedMembers: n(row.members),
    listingPartnersDistinct: n(row.listing_partners),
    propertyEnquiries: n(row.enquiries),
    totalEnquiries: n(row.enquiries),
    registeredMembers: n(row.members),
    source: 'rpc',
  }
}

/**
 * @param {{
 *   listings: number,
 *   membersCount: number,
 *   soldFallback: number,
 *   enquiriesFallback: number,
 *   clearDocumentation: number,
 *   listingPartners: number,
 *   fallbackSource: string,
 * }} p
 */
export function normalizeMarketingFallback(p) {
  return {
    propertiesListed: p.listings ?? 0,
    propertiesClearDocumentation: p.clearDocumentation ?? 0,
    propertiesSold: p.soldFallback ?? 0,
    subscribedMembers: p.membersCount ?? 0,
    listingPartnersDistinct: p.listingPartners ?? 0,
    propertyEnquiries: p.enquiriesFallback ?? 0,
    totalEnquiries: p.enquiriesFallback ?? 0,
    registeredMembers: p.membersCount ?? 0,
    source: p.fallbackSource ?? 'fallback',
  }
}
