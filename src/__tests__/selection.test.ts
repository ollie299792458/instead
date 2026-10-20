import { Alternative, Reason } from '../types/instead';
import { selectBestReason } from '../features/pause/selectReason';
import { getTimeOfDay, selectAlternatives } from '../features/pause/selectAlternatives';

describe('selectBestReason', () => {
  const mockReasons: Reason[] = [
    { id: 'r1', text: 'Reason 1', source: 'onboarding', timesShown: 5, timesRedirected: 4, lastShownAt: 100, archived: false, createdAt: 1 },
    { id: 'r2', text: 'Reason 2', source: 'onboarding', timesShown: 5, timesRedirected: 0, lastShownAt: 200, archived: false, createdAt: 2 },
    { id: 'r3', text: 'Reason 3', source: 'onboarding', timesShown: 0, timesRedirected: 0, lastShownAt: null, archived: false, createdAt: 3 },
  ];

  it('downranks most recently shown reasons', () => {
    // If r1 was shown most recently, r3 or r2 should be favored
    const chosen = selectBestReason(mockReasons, ['r1']);
    expect(chosen?.id).not.toBe('r1');
  });

  it('ignores archived reasons', () => {
    const archivedReasons: Reason[] = [
      { id: 'r1', text: 'Archived', source: 'manual', timesShown: 0, timesRedirected: 0, lastShownAt: null, archived: true, createdAt: 1 },
      { id: 'r2', text: 'Active', source: 'manual', timesShown: 0, timesRedirected: 0, lastShownAt: null, archived: false, createdAt: 2 },
    ];
    const chosen = selectBestReason(archivedReasons);
    expect(chosen?.id).toBe('r2');
  });
});

describe('selectAlternatives', () => {
  const mockAlternatives: Alternative[] = [
    { id: 'a1', title: 'Duolingo', category: 'Study', subtitle: '', timeOfDayPref: 'any', enabled: true, timesSuggested: 0, timesChosen: 0, lastChosenAt: null, createdAt: 1 },
    { id: 'a2', title: 'Book', category: 'Read', subtitle: '', timeOfDayPref: 'evening', enabled: true, timesSuggested: 0, timesChosen: 0, lastChosenAt: null, createdAt: 2 },
    { id: 'a3', title: 'Flat todo', category: 'Work', subtitle: '', timeOfDayPref: 'workday', enabled: true, timesSuggested: 0, timesChosen: 0, lastChosenAt: null, createdAt: 3 },
    { id: 'a4', title: 'Meditation', category: 'Other', subtitle: '', timeOfDayPref: 'any', enabled: true, timesSuggested: 0, timesChosen: 0, lastChosenAt: null, createdAt: 4 },
  ];

  it('selects 3 distinct category items', () => {
    const selected = selectAlternatives(mockAlternatives, 3);
    expect(selected.length).toBe(3);
    const categories = new Set(selected.map((s) => s.category));
    expect(categories.size).toBe(3);
  });

  it('correctly maps time of day', () => {
    const night = new Date('2026-10-20T23:30:00');
    expect(getTimeOfDay(night)).toBe('late_night');

    const morning = new Date('2026-10-20T08:30:00');
    expect(getTimeOfDay(morning)).toBe('morning');
  });

  it('excludes items passed in excludedIds (shuffle)', () => {
    const selected = selectAlternatives(mockAlternatives, 2, new Date(), ['a1', 'a2']);
    expect(selected.some((s) => s.id === 'a1')).toBe(false);
    expect(selected.some((s) => s.id === 'a2')).toBe(false);
  });
});
