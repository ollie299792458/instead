import { Reason } from '../../types/instead';

/**
 * Selects 1 reason with anti-habituation weighting:
 * - Recency penalty: strong penalty for reasons shown in the last sessions
 * - Conversion bonus: reasons with higher redirected/shown ratio get higher probability
 * - True weighted random sampling (so it doesn't just pick the same highest scored item)
 */
export function selectBestReason(reasons: Reason[], lastShownReasonIds: string[] = []): Reason | null {
  const activeReasons = reasons.filter((r) => !r.archived);
  if (activeReasons.length === 0) return null;
  if (activeReasons.length === 1) return activeReasons[0];

  // If there are unshown reasons (or reasons not in recent history), filter down candidate pool
  const nonRecentReasons = activeReasons.filter((r) => !lastShownReasonIds.includes(r.id));
  const candidatePool = nonRecentReasons.length > 0 ? nonRecentReasons : activeReasons;

  const scored = candidatePool.map((reason) => {
    let weight = 1.0;

    // Recency penalty if we had to fall back to the full pool
    const recentIndex = lastShownReasonIds.indexOf(reason.id);
    if (recentIndex !== -1) {
      weight *= recentIndex === 0 ? 0.05 : 0.25;
    }

    // Conversion rate bonus (Laplace smoothing)
    const conversionRate = (reason.timesRedirected + 1) / (reason.timesShown + 2);
    weight *= 0.5 + conversionRate;

    // Favor less shown reasons to ensure all reasons get exposure
    const exposureBonus = 1 / Math.sqrt(reason.timesShown + 1);
    weight += exposureBonus * 0.5;

    return { reason, weight: Math.max(0.01, weight) };
  });

  // Weighted random selection
  const totalWeight = scored.reduce((sum, item) => sum + item.weight, 0);
  let randomVal = Math.random() * totalWeight;

  for (const item of scored) {
    randomVal -= item.weight;
    if (randomVal <= 0) {
      return item.reason;
    }
  }

  return scored[0].reason;
}
