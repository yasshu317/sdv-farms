/** Indian standard: 1 acre = 4,840 sq. yd (international acre). */
export function sqYardsToAcres(sqYards) {
  if (sqYards == null || Number.isNaN(Number(sqYards))) return null
  return Number(sqYards) / 4840
}

export function formatAcresFromSqYards(sqYards, digits = 2) {
  const a = sqYardsToAcres(sqYards)
  if (a == null) return '—'
  return `${a.toFixed(digits)} ac`
}
