import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alternative, ChecklistItem, PauseSession, Reason } from '../types/instead';
import { DIY_SUGGESTIONS, SEED_ALTERNATIVES, STARTER_REASONS } from './seed';

const STORAGE_KEYS = {
  REASONS: '@instead_reasons_v6',
  ALTERNATIVES: '@instead_alternatives_v6',
  CHECKLIST_ITEMS: '@instead_checklist_items_v6',
  SESSIONS: '@instead_sessions_v6',
  PROMISE_STREAK: '@instead_streak_v6',
  INITIALIZED: '@instead_initialized_v6',
  LAST_SHOWN_REASONS: '@instead_last_shown_reasons_v6',
};

export interface AppStateData {
  reasons: Reason[];
  alternatives: Alternative[];
  checklistItems: ChecklistItem[];
  sessions: PauseSession[];
  promiseStreak: number;
  lastShownReasonIds: string[];
  lastPromiseKeptDate: string | null;
}

export async function loadInitialAppData(): Promise<AppStateData> {
  try {
    const isInit = await AsyncStorage.getItem(STORAGE_KEYS.INITIALIZED);

    if (!isInit) {
      // First run: seed defaults
      const reasons: Reason[] = STARTER_REASONS.map((r) => ({
        ...r,
        timesShown: 0,
        timesRedirected: 0,
        lastShownAt: null,
      }));

      const alternatives: Alternative[] = SEED_ALTERNATIVES.map((a) => ({
        ...a,
        timesSuggested: 0,
        timesChosen: 0,
        lastChosenAt: null,
      }));

      // Starter DIY checklist items from suggestions
      const starterChecklist: ChecklistItem[] = DIY_SUGGESTIONS.slice(0, 4).map((s, idx) => ({
        id: `init-diy-${idx}`,
        listType: s.listType,
        title: s.title,
        roomOrArea: s.roomOrArea,
        effort: s.effort,
        completed: false,
        completedAt: null,
        createdAt: Date.now() - (4 - idx) * 3600000,
      }));

      await AsyncStorage.multiSet([
        [STORAGE_KEYS.REASONS, JSON.stringify(reasons)],
        [STORAGE_KEYS.ALTERNATIVES, JSON.stringify(alternatives)],
        [STORAGE_KEYS.CHECKLIST_ITEMS, JSON.stringify(starterChecklist)],
        [STORAGE_KEYS.SESSIONS, JSON.stringify([])],
        [STORAGE_KEYS.PROMISE_STREAK, '0'],
        [STORAGE_KEYS.LAST_SHOWN_REASONS, JSON.stringify([])],
        [STORAGE_KEYS.INITIALIZED, 'true'],
      ]);

      return {
        reasons,
        alternatives,
        checklistItems: starterChecklist,
        sessions: [],
        promiseStreak: 0,
        lastShownReasonIds: [],
        lastPromiseKeptDate: null,
      };
    }

    // Subsequent runs: read from storage
    const [reasonsRaw, alternativesRaw, checklistRaw, sessionsRaw, streakRaw, lastShownRaw] =
      await AsyncStorage.multiGet([
        STORAGE_KEYS.REASONS,
        STORAGE_KEYS.ALTERNATIVES,
        STORAGE_KEYS.CHECKLIST_ITEMS,
        STORAGE_KEYS.SESSIONS,
        STORAGE_KEYS.PROMISE_STREAK,
        STORAGE_KEYS.LAST_SHOWN_REASONS,
      ]);

    const reasons: Reason[] = reasonsRaw[1] ? JSON.parse(reasonsRaw[1]) : [];
    const alternatives: Alternative[] = alternativesRaw[1] ? JSON.parse(alternativesRaw[1]) : [];
    const checklistItems: ChecklistItem[] = checklistRaw[1] ? JSON.parse(checklistRaw[1]) : [];
    const sessions: PauseSession[] = sessionsRaw[1] ? JSON.parse(sessionsRaw[1]) : [];
    const promiseStreak = streakRaw[1] ? parseInt(streakRaw[1], 10) : 0;
    const lastShownReasonIds: string[] = lastShownRaw[1] ? JSON.parse(lastShownRaw[1]) : [];

    return {
      reasons,
      alternatives,
      checklistItems,
      sessions,
      promiseStreak,
      lastShownReasonIds,
      lastPromiseKeptDate: null,
    };
  } catch (err) {
    console.error('Error loading app data from storage:', err);
    return {
      reasons: [],
      alternatives: [],
      checklistItems: [],
      sessions: [],
      promiseStreak: 0,
      lastShownReasonIds: [],
      lastPromiseKeptDate: null,
    };
  }
}

export async function persistReasons(reasons: Reason[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.REASONS, JSON.stringify(reasons));
}

export async function persistAlternatives(alternatives: Alternative[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.ALTERNATIVES, JSON.stringify(alternatives));
}

export async function persistChecklistItems(items: ChecklistItem[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.CHECKLIST_ITEMS, JSON.stringify(items));
}

export async function persistSessions(sessions: PauseSession[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
}

export async function persistStreak(streak: number): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.PROMISE_STREAK, streak.toString());
}

export async function persistLastShownReasonIds(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.LAST_SHOWN_REASONS, JSON.stringify(ids));
}
