/**
 * Client-only “cart”: property UUIDs queued before login, merged into buyer_wishlist after sign-in.
 * @module pendingShortlist
 */

import { INTEREST_SHORTLIST_MAX } from './interestShortlist.js'

export const PENDING_SHORTLIST_KEY = 'sdv.pendingShortlistIds'

export function looksLikeListingUuid(id) {
  return typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
}

/** @returns {string[]} unique pending IDs */
export function peekPendingShortlistIds() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.sessionStorage.getItem(PENDING_SHORTLIST_KEY)
    const parsed = JSON.parse(raw || '[]')
    const arr = Array.isArray(parsed) ? parsed : []
    return [...new Set(arr.filter(looksLikeListingUuid))]
  } catch {
    return []
  }
}

export function queuePendingShortlistId(propertyUuid) {
  if (typeof window === 'undefined') return
  if (!looksLikeListingUuid(propertyUuid)) return
  const ids = [...new Set([...peekPendingShortlistIds(), propertyUuid])]
  window.sessionStorage.setItem(PENDING_SHORTLIST_KEY, JSON.stringify(ids))
}

export function clearPendingShortlistQueue() {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(PENDING_SHORTLIST_KEY)
}

/**
 * @param {string} userId
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 */
export async function flushPendingShortlistToWishlist(userId, supabase) {
  const backlog = peekPendingShortlistIds()
  if (!backlog.length || !userId || !supabase) {
    return { added: 0, skippedDuplicate: 0, skippedCap: false }
  }

  const { count } = await supabase
    .from('buyer_wishlist')
    .select('id', { count: 'exact', head: true })
    .eq('buyer_id', userId)

  let room = INTEREST_SHORTLIST_MAX - Number(count ?? 0)

  const { data: existing } = await supabase
    .from('buyer_wishlist')
    .select('property_id')
    .eq('buyer_id', userId)
    .in('property_id', backlog)

  const have = new Set((existing ?? []).map(r => r.property_id))

  let added = 0
  let skippedDuplicate = 0
  let skippedCap = false
  /** IDs still pending (cap hit or non-duplicate insert error); duplicates are dropped from queue intentionally */
  let keepInQueue = []

  for (const propertyId of backlog) {
    if (have.has(propertyId)) {
      skippedDuplicate++
      continue
    }
    if (room <= 0) {
      skippedCap = true
      keepInQueue.push(propertyId)
      continue
    }

    const { error } = await supabase
      .from('buyer_wishlist')
      .insert({ buyer_id: userId, property_id: propertyId })

    if (!error) {
      have.add(propertyId)
      added++
      room--
      continue
    }
    if (error.code === '23505' || String(error.message || '').toLowerCase().includes('duplicate')) {
      skippedDuplicate++
      have.add(propertyId)
      continue
    }
    keepInQueue.push(propertyId)
  }

  const uniqueKeep = [...new Set(keepInQueue.filter(looksLikeListingUuid))]
  if (typeof window !== 'undefined') {
    if (uniqueKeep.length) {
      window.sessionStorage.setItem(PENDING_SHORTLIST_KEY, JSON.stringify(uniqueKeep))
    } else {
      clearPendingShortlistQueue()
    }
  }
  return { added, skippedDuplicate, skippedCap }
}
