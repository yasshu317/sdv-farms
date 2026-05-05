/**
 * Feature flags / remote config from `feature_flags` table (see phase9 migration).
 * Do not store secrets in payload — values may be readable anonymously via RLS + /api/feature-flags.
 */

/** @typedef {{ enabled: boolean, payload?: object }} FlagEntry */

/**
 * @param {Array<{ key: string, enabled: boolean, payload?: object | null }>} rows
 * @returns {Record<string, FlagEntry>}
 */
export function featureFlagsToMap(rows) {
  const m = {}
  for (const r of rows || []) {
    if (!r?.key) continue
    m[r.key] = {
      enabled: !!r.enabled,
      payload: r.payload && typeof r.payload === 'object' ? r.payload : {},
    }
  }
  return m
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @returns {Promise<Record<string, FlagEntry>>}
 */
export async function fetchFeatureFlagsMap(supabase) {
  const { data, error } = await supabase
    .from('feature_flags')
    .select('key, enabled, payload')
    .order('sort_order', { ascending: true })
    .order('key', { ascending: true })

  if (error) return {}
  return featureFlagsToMap(data ?? [])
}

/**
 * @param {Record<string, FlagEntry>} map
 * @param {string} key
 */
export function isFlagEnabled(map, key) {
  const f = map[key]
  if (!f) return false
  return !!f.enabled
}
