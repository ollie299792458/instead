import { Alternative, AlternativeCategory, TimeOfDayPref } from '../../types/instead';

export function getTimeOfDay(date: Date = new Date()): TimeOfDayPref {
  const hour = date.getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'workday';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'late_night';
}

/**
 * Selects 3 alternatives:
 * 1. Guarantees diversity across categories (e.g. Study, Read, Work/Other)
 * 2. Time-of-day weighting:
 *    - Morning/Workday boosts Study & Work (Duolingo, Anki, Emails, DIY tasks)
 *    - Evening/Late-night boosts Read & Other (Books, Instapaper, Meditation, Watch the dock)
 * 3. Shuffle support
 */
export function selectAlternatives(
  alternatives: Alternative[],
  count: number = 3,
  currentTime: Date = new Date(),
  excludedIds: string[] = []
): Alternative[] {
  const enabled = alternatives.filter((a) => a.enabled && !excludedIds.includes(a.id));
  if (enabled.length <= count) return enabled;

  const currentPeriod = getTimeOfDay(currentTime);

  // Group by category
  const categories: AlternativeCategory[] = ['Study', 'Read', 'Work', 'Other'];
  const poolByCategory = new Map<AlternativeCategory, Alternative[]>();

  for (const cat of categories) {
    poolByCategory.set(cat, []);
  }

  for (const item of enabled) {
    poolByCategory.get(item.category)?.push(item);
  }

  // Weight function for an item
  const calculateWeight = (item: Alternative): number => {
    let weight = 1.0;

    // Time of day matching
    if (item.timeOfDayPref === currentPeriod) {
      weight += 0.8;
    } else if (item.timeOfDayPref === 'any') {
      weight += 0.3;
    }

    // Late night dampening for stressful work tasks
    if (currentPeriod === 'late_night') {
      if (item.category === 'Work') weight *= 0.2;
      if (item.category === 'Read' || item.category === 'Other') weight *= 1.5;
    } else if (currentPeriod === 'morning' || currentPeriod === 'workday') {
      if (item.category === 'Work' || item.category === 'Study') weight *= 1.3;
    }

    // Give subtle boost to under-chosen or well-performing alternatives
    const conversion = (item.timesChosen + 1) / (item.timesSuggested + 2);
    weight *= 0.7 + conversion;

    return weight * (0.8 + Math.random() * 0.4);
  };

  // Pick categories in prioritized order based on time of day
  const prioritizedCategories: AlternativeCategory[] =
    currentPeriod === 'late_night' || currentPeriod === 'evening'
      ? ['Read', 'Other', 'Study', 'Work']
      : ['Study', 'Work', 'Read', 'Other'];

  const selected: Alternative[] = [];
  const chosenCategories = new Set<AlternativeCategory>();

  // 1. Try to pick 1 item from distinct categories
  for (const cat of prioritizedCategories) {
    if (selected.length >= count) break;
    const items = poolByCategory.get(cat) || [];
    if (items.length > 0) {
      // Pick highest weighted in this category
      const ranked = items.map((it) => ({ it, w: calculateWeight(it) })).sort((a, b) => b.w - a.w);
      selected.push(ranked[0].it);
      chosenCategories.add(cat);
    }
  }

  // 2. If we still need more to reach count, pick from remaining highest weighted across all
  if (selected.length < count) {
    const remaining = enabled.filter((item) => !selected.some((s) => s.id === item.id));
    const ranked = remaining.map((it) => ({ it, w: calculateWeight(it) })).sort((a, b) => b.w - a.w);
    for (const r of ranked) {
      if (selected.length >= count) break;
      selected.push(r.it);
    }
  }

  return selected;
}
