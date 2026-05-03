/**
 * Seller listing entry — skips the buyer/seller role picker on /auth/register.
 * Flow: List your land → eligibility → credentials → email verify → login → /seller
 */
export const REGISTER_LIST_LAND = '/auth/register?flow=seller'
