import { Reason } from '../../types/instead';

/**
 * Selects 1 reason with anti-habituation weighting:
 * - Recency penalty: downranks reasons shown in the last 2 sessions
 * - Conversion bonus: reasons with higher redirected/shown ratio get higher probability
 * - Random jitter to prevent strict determinism
 */
export function selectBestReason(reasons: Reason[], lastShownReasonIds: string[] = []): Reason | null {
  const activeReasons = reasons.filter((r) => !r.archived);
  if (activeReasons.length === 0) return null;
  if (activeReasons.length === 1) return activeReasons[0];

  const scored = activeReasons.map((reason) => {
    let score = 1.0;

    // Check recency
    const recentIndex = lastShownReasonIds.indexOf(reason.id);
    if (recentIndex !== -1) {
      // 0 = most recent, 1 = second most recent
      score *= recentIndex === 0 ? 0.05 : 0.2;
    }

    // Conversion rate bonus (Laplace smoothing)
    const conversionRate = (reason.timesRedirected + 1) / (reason.timesShown + 2);
    score *= 0.5 + conversionRate;

    // Small jitter [0.85, 1.15]
    const jitter = 0.85 + Math.random() * 0.3;
    score *= jitter;

    return { reason, score };
  });

  // Pick via weighted random or highest score
  scored.sort((a, b) => b.score - a.score);
  return scored[0].reason;
}
