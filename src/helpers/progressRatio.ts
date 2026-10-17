/** Part apprise (0 → 1), plafonnée et sûre même si le total est inconnu. */
export function learnedRatio(learnedCount: number, totalCount: number): number {
  if (!totalCount || totalCount <= 0 || !Number.isFinite(learnedCount)) return 0;
  return Math.min(1, Math.max(0, learnedCount / totalCount));
}
