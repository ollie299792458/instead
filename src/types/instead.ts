export type AlternativeCategory = 'Study' | 'Read' | 'Work' | 'Other';

export type TimeOfDayPref = 'morning' | 'workday' | 'evening' | 'late_night' | 'any';

export type BuiltInToolType = 'flat_todo' | 'tasks' | 'meditation' | 'walk' | 'watch_dock' | null;

export interface Reason {
  id: string;
  text: string;
  source: 'onboarding' | 'manual' | 'checkin';
  timesShown: number;
  timesRedirected: number;
  lastShownAt: number | null;
  archived: boolean;
  createdAt: number;
}

export interface Alternative {
  id: string;
  title: string;
  category: AlternativeCategory;
  subtitle: string;
  iosScheme?: string;
  androidPackage?: string;
  webFallbackUrl?: string;
  builtInTool?: BuiltInToolType;
  timeOfDayPref: TimeOfDayPref;
  enabled: boolean;
  timesSuggested: number;
  timesChosen: number;
  lastChosenAt: number | null;
  createdAt: number;
}

export type EffortTag = '5 min' | '15 min' | 'Weekend';

export type ChecklistListType = 'flat_todo' | 'tasks';

export interface ChecklistItem {
  id: string;
  listType: ChecklistListType;
  title: string;
  roomOrArea?: string; // e.g. 'Kitchen', 'Hallway', 'Desk', 'General'
  effort: EffortTag;
  completed: boolean;
  completedAt: number | null;
  createdAt: number;
}

export interface ChecklistSuggestion {
  id: string;
  listType: ChecklistListType;
  title: string;
  roomOrArea: string;
  effort: EffortTag;
}

export type SessionOutcome = 'redirected' | 'watched' | 'abandoned';
export type CheckInRating = 'worth_it' | 'neutral' | 'regret';

export interface PauseSession {
  id: string;
  startedAt: number;
  triggerSource: 'manual' | 'shortcut' | 'widget';
  targetApp: 'tiktok' | 'shorts' | 'reels';
  countdownCompleted: boolean;
  reasonId: string;
  outcome?: SessionOutcome;
  chosenAlternativeId?: string;
  timeboxMinutes?: number;
  checkInRating?: CheckInRating;
  checkInNote?: string;
}
