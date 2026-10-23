import { Alternative, ChecklistSuggestion, Reason } from '../types/instead';

export const STARTER_REASONS: Omit<Reason, 'timesShown' | 'timesRedirected' | 'lastShownAt'>[] = [
  {
    id: 'reason-1',
    text: '5 minutes of relaxation becomes 2 hours of zombie scrolling. It never actually relaxes me.',
    source: 'onboarding',
    archived: false,
    createdAt: 1700000000000,
  },
  {
    id: 'reason-2',
    text: 'Endless short-form video ruins focus and steals time from projects and people that matter to me.',
    source: 'onboarding',
    archived: false,
    createdAt: 1700000000001,
  },
  {
    id: 'reason-3',
    text: 'After 30 minutes of short form video I always feel groggy, distracted, and mildly dissatisfied with my day.',
    source: 'onboarding',
    archived: false,
    createdAt: 1700000000002,
  },
  {
    id: 'reason-4',
    text: 'The algorithm optimizes for keeping my eyes glued, not my well-being or happiness.',
    source: 'onboarding',
    archived: false,
    createdAt: 1700000000003,
  },
];

/**
 * Clean, general titles with user's specific note examples in subtitle/actions
 */
export const SEED_ALTERNATIVES: Omit<Alternative, 'timesSuggested' | 'timesChosen' | 'lastChosenAt'>[] = [
  // --- Study ---
  {
    id: 'alt-duolingo',
    title: 'Language Practice',
    category: 'Study',
    subtitle: '5 mins • Duolingo, Babbel, or vocab',
    iosScheme: 'duolingo://',
    androidPackage: 'com.duolingo',
    webFallbackUrl: 'https://www.duolingo.com',
    timeOfDayPref: 'any',
    enabled: true,
    createdAt: 1700000000000,
  },
  {
    id: 'alt-flashcards',
    title: 'Flashcards',
    category: 'Study',
    subtitle: '10 cards • Spaced repetition review (Anki)',
    iosScheme: 'anki://',
    androidPackage: 'com.ichi2.anki',
    webFallbackUrl: 'https://ankiweb.net',
    timeOfDayPref: 'workday',
    enabled: true,
    createdAt: 1700000000001,
  },
  {
    id: 'alt-peak',
    title: 'Brain Training',
    category: 'Study',
    subtitle: '1 quick puzzle or logic workout (Peak)',
    iosScheme: 'peak://',
    androidPackage: 'com.brainbow.peak.app',
    webFallbackUrl: 'https://www.peak.net',
    timeOfDayPref: 'morning',
    enabled: true,
    createdAt: 1700000000002,
  },

  // --- Read ---
  {
    id: 'alt-instapaper',
    title: 'Saved Articles',
    category: 'Read',
    subtitle: 'Read 1 longform article (Instapaper / Reader)',
    iosScheme: 'instapaper://',
    androidPackage: 'com.instapaper.android',
    webFallbackUrl: 'https://www.instapaper.com',
    timeOfDayPref: 'evening',
    enabled: true,
    createdAt: 1700000000003,
  },
  {
    id: 'alt-googlenews',
    title: 'Daily News',
    category: 'Read',
    subtitle: '5 mins • Catch up on real headlines',
    iosScheme: 'googlenews://',
    androidPackage: 'com.google.android.apps.magazines',
    webFallbackUrl: 'https://news.google.com',
    timeOfDayPref: 'morning',
    enabled: true,
    createdAt: 1700000000004,
  },
  {
    id: 'alt-readingbook',
    title: 'Read a Book',
    category: 'Read',
    subtitle: 'A few pages of your current book or Kindle',
    iosScheme: 'kindle://',
    androidPackage: 'com.amazon.kindle',
    webFallbackUrl: 'https://read.amazon.com',
    timeOfDayPref: 'evening',
    enabled: true,
    createdAt: 1700000000005,
  },

  // --- Work ---
  {
    id: 'alt-emails',
    title: 'Quick Inbox Triage',
    category: 'Work',
    subtitle: '5 mins • Clear or reply to 3 emails',
    iosScheme: 'googlegmail://',
    androidPackage: 'com.google.android.gm',
    webFallbackUrl: 'https://mail.google.com',
    timeOfDayPref: 'workday',
    enabled: true,
    createdAt: 1700000000006,
  },
  {
    id: 'alt-tasks',
    title: 'To-Do List',
    category: 'Work',
    subtitle: 'Pick 1 small task and cross it off',
    builtInTool: 'tasks',
    timeOfDayPref: 'workday',
    enabled: true,
    createdAt: 1700000000007,
  },
  {
    id: 'alt-flattodo',
    title: 'DIY & Home Projects',
    category: 'Work',
    subtitle: 'Fix, tidy, assemble, or improve 1 thing',
    builtInTool: 'flat_todo',
    timeOfDayPref: 'any',
    enabled: true,
    createdAt: 1700000000008,
  },

  // --- Other ---
  {
    id: 'alt-meditation',
    title: 'Breathing Reset',
    category: 'Other',
    subtitle: '3 mins • Quiet your mind & breathe',
    builtInTool: 'meditation',
    timeOfDayPref: 'any',
    enabled: true,
    createdAt: 1700000000009,
  },
  {
    id: 'alt-walk',
    title: 'Step Outside',
    category: 'Other',
    subtitle: '10 mins • Short walk & fresh air',
    builtInTool: 'walk',
    timeOfDayPref: 'workday',
    enabled: true,
    createdAt: 1700000000010,
  },
  {
    id: 'alt-watchdock',
    title: 'Look Out the Window',
    category: 'Other',
    subtitle: '2 mins • Rest your eyes on the distance & breathe',
    builtInTool: 'watch_dock',
    timeOfDayPref: 'any',
    enabled: true,
    createdAt: 1700000000011,
  },
];

/**
 * Suggestions for Home & DIY Checklist
 */
export const DIY_SUGGESTIONS: ChecklistSuggestion[] = [
  { id: 'diy-1', listType: 'flat_todo', title: 'Tighten a loose hinge or cabinet door', roomOrArea: 'Kitchen', effort: '5 min' },
  { id: 'diy-2', listType: 'flat_todo', title: 'Oil a squeaky door latch or handle', roomOrArea: 'Hallway', effort: '5 min' },
  { id: 'diy-3', listType: 'flat_todo', title: 'Clear and wipe one surface completely', roomOrArea: 'Living Room', effort: '5 min' },
  { id: 'diy-4', listType: 'flat_todo', title: 'Sort the tool / cable clutter drawer', roomOrArea: 'Desk', effort: '15 min' },
  { id: 'diy-5', listType: 'flat_todo', title: 'Measure space for a shelf or organizer', roomOrArea: 'Bedroom', effort: '5 min' },
  { id: 'diy-6', listType: 'flat_todo', title: 'Touch up scuff marks or wipe skirting board', roomOrArea: 'Hallway', effort: '15 min' },
  { id: 'diy-7', listType: 'flat_todo', title: 'Bleed radiators or check pressure', roomOrArea: 'General', effort: '15 min' },
  { id: 'diy-8', listType: 'flat_todo', title: 'Change air filter or wipe extractor fan', roomOrArea: 'Bathroom', effort: '15 min' },
  { id: 'diy-9', listType: 'flat_todo', title: 'Fix or hang picture frame / hook', roomOrArea: 'Living Room', effort: '15 min' },
];

export const TASK_SUGGESTIONS: ChecklistSuggestion[] = [
  { id: 'task-1', listType: 'tasks', title: 'Archive 5 stale tabs or bookmarks', roomOrArea: 'Digital', effort: '5 min' },
  { id: 'task-2', listType: 'tasks', title: 'Write down top 3 priorities for tomorrow', roomOrArea: 'Work', effort: '5 min' },
  { id: 'task-3', listType: 'tasks', title: 'Empty desktop downloads folder', roomOrArea: 'Digital', effort: '5 min' },
  { id: 'task-4', listType: 'tasks', title: 'Pay pending bill or file receipt', roomOrArea: 'Admin', effort: '5 min' },
];
