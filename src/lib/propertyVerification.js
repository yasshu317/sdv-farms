/**
 * Derive PDP verification badges from seller_properties.doc_verified and optional metadata.
 * Optional metadata.verification object: `{ legal?, physical?, ... }`
 * Accepted values per field: `'verified'` | `'pending'` | `'none'` | `'rejected'` or boolean true/false.
 *
 * @param {{ doc_verified?: boolean | null, metadata?: Record<string, unknown> | string | null }} row
 * @returns {{ legal: 'verified'|'pending'|'none', physical: 'verified'|'pending'|'none' }}
 */
export function deriveVerificationSignals(row) {
  let meta = row?.metadata
  if (typeof meta === 'string') {
    try {
      meta = JSON.parse(meta)
    } catch {
      meta = {}
    }
  }
  if (!meta || typeof meta !== 'object') meta = {}

  const v =
    typeof meta.verification === 'object' && meta.verification !== null ? meta.verification : {}

  return {
    legal: coerceStatus(v.legal ?? v.legal_status, !!row?.doc_verified),
    physical: coerceStatus(v.physical ?? v.physical_status ?? v.site_verification, false),
  }
}

/** @param {unknown} explicit @param {boolean} inferredFromDocs */
function coerceStatus(explicit, inferredFromDocs) {
  if (explicit === true || explicit === 'verified') return 'verified'
  if (explicit === false || explicit === 'none' || explicit === 'rejected') return 'none'
  if (explicit === 'pending') return 'pending'
  return inferredFromDocs ? 'verified' : 'pending'
}
