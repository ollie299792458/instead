import { create } from 'zustand';
import { Alternative, ChecklistItem, ChecklistListType, EffortTag, PauseSession, Reason } from '../types/instead';
import {
  loadInitialAppData,
  persistAlternatives,
  persistChecklistItems,
  persistReasons,
  persistSessions,
  persistStreak,
} from '../db/storage';
import { selectBestReason } from '../features/pause/selectReason';
import { selectAlternatives } from '../features/pause/selectAlternatives';

interface InsteadState {
  isReady: boolean;
  reasons: Reason[];
  alternatives: Alternative[];
  checklistItems: ChecklistItem[];
  sessions: PauseSession[];
  promiseStreak: number;

  // Active pause session state
  activeReason: Reason | null;
  suggestedAlternatives: Alternative[];
  activeSessionId: string | null;
  lastShownReasonIds: string[];

  // Actions
  initialize: () => Promise<void>;
  startPauseSession: (triggerSource?: 'manual' | 'shortcut' | 'widget') => void;
  shuffleAlternatives: () => void;
  recordCountdownComplete: () => void;
  chooseAlternative: (alternativeId: string) => Promise<void>;
  chooseWatchAnyway: (timeboxMinutes: number) => Promise<void>;
  submitCheckIn: (sessionId: string, rating: 'worth_it' | 'neutral' | 'regret', note?: string) => Promise<void>;

  // Checklist Actions
  addChecklistItem: (title: string, listType: ChecklistListType, effort: EffortTag, roomOrArea?: string) => Promise<void>;
  toggleChecklistItem: (id: string) => Promise<void>;
  deleteChecklistItem: (id: string) => Promise<void>;

  // Reason & Alternative management
  addReason: (text: string) => Promise<void>;
  toggleAlternative: (id: string) => Promise<void>;
}

export const useInsteadStore = create<InsteadState>((set, get) => ({
  isReady: false,
  reasons: [],
  alternatives: [],
  checklistItems: [],
  sessions: [],
  promiseStreak: 0,
  activeReason: null,
  suggestedAlternatives: [],
  activeSessionId: null,
  lastShownReasonIds: [],

  initialize: async () => {
    const data = await loadInitialAppData();
    set({
      isReady: true,
      reasons: data.reasons,
      alternatives: data.alternatives,
      checklistItems: data.checklistItems,
      sessions: data.sessions,
      promiseStreak: data.promiseStreak,
    });
    get().startPauseSession('manual');
  },

  startPauseSession: (triggerSource = 'manual') => {
    const { reasons, alternatives, lastShownReasonIds } = get();
    const reason = selectBestReason(reasons, lastShownReasonIds);
    const alts = selectAlternatives(alternatives, 3);
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    set((state) => ({
      activeReason: reason,
      suggestedAlternatives: alts,
      activeSessionId: sessionId,
      lastShownReasonIds: reason
        ? [reason.id, ...state.lastShownReasonIds.filter((id) => id !== reason.id)].slice(0, 3)
        : state.lastShownReasonIds,
    }));
  },

  shuffleAlternatives: () => {
    const { alternatives, suggestedAlternatives } = get();
    const currentIds = suggestedAlternatives.map((a) => a.id);
    const nextAlts = selectAlternatives(alternatives, 3, new Date(), currentIds);
    set({ suggestedAlternatives: nextAlts });
  },

  recordCountdownComplete: () => {
    const { promiseStreak } = get();
    const nextStreak = promiseStreak + 1;
    set({ promiseStreak: nextStreak });
    persistStreak(nextStreak);
  },

  chooseAlternative: async (alternativeId: string) => {
    const { activeSessionId, activeReason, sessions, reasons, alternatives } = get();

    // 1. Update session
    const session: PauseSession = {
      id: activeSessionId || `sess_${Date.now()}`,
      startedAt: Date.now(),
      triggerSource: 'manual',
      targetApp: 'tiktok',
      countdownCompleted: true,
      reasonId: activeReason?.id || '',
      outcome: 'redirected',
      chosenAlternativeId: alternativeId,
    };

    const nextSessions = [session, ...sessions];

    // 2. Increment stats
    const nextReasons = reasons.map((r) =>
      r.id === activeReason?.id
        ? { ...r, timesShown: r.timesShown + 1, timesRedirected: r.timesRedirected + 1, lastShownAt: Date.now() }
        : r
    );

    const nextAlternatives = alternatives.map((a) =>
      a.id === alternativeId
        ? { ...a, timesChosen: a.timesChosen + 1, lastChosenAt: Date.now() }
        : a
    );

    set({ sessions: nextSessions, reasons: nextReasons, alternatives: nextAlternatives });
    await Promise.all([
      persistSessions(nextSessions),
      persistReasons(nextReasons),
      persistAlternatives(nextAlternatives),
    ]);
  },

  chooseWatchAnyway: async (timeboxMinutes: number) => {
    const { activeSessionId, activeReason, sessions, reasons } = get();

    const session: PauseSession = {
      id: activeSessionId || `sess_${Date.now()}`,
      startedAt: Date.now(),
      triggerSource: 'manual',
      targetApp: 'tiktok',
      countdownCompleted: true,
      reasonId: activeReason?.id || '',
      outcome: 'watched',
      timeboxMinutes,
    };

    const nextSessions = [session, ...sessions];
    const nextReasons = reasons.map((r) =>
      r.id === activeReason?.id
        ? { ...r, timesShown: r.timesShown + 1, lastShownAt: Date.now() }
        : r
    );

    set({ sessions: nextSessions, reasons: nextReasons });
    await Promise.all([
      persistSessions(nextSessions),
      persistReasons(nextReasons),
    ]);
  },

  submitCheckIn: async (sessionId: string, rating, note) => {
    const { sessions, reasons } = get();
    const updatedSessions = sessions.map((s) =>
      s.id === sessionId ? { ...s, checkInRating: rating, checkInNote: note } : s
    );

    let nextReasons = [...reasons];
    // If the user had regret and wrote a note, auto-promote it to a first-principles reason!
    if (rating === 'regret' && note && note.trim().length > 6) {
      const newReason: Reason = {
        id: `reason_checkin_${Date.now()}`,
        text: note.trim(),
        source: 'checkin',
        timesShown: 0,
        timesRedirected: 0,
        lastShownAt: null,
        archived: false,
        createdAt: Date.now(),
      };
      nextReasons = [newReason, ...nextReasons];
      await persistReasons(nextReasons);
    }

    set({ sessions: updatedSessions, reasons: nextReasons });
    await persistSessions(updatedSessions);
  },

  addChecklistItem: async (title, listType, effort, roomOrArea) => {
    const { checklistItems } = get();
    const newItem: ChecklistItem = {
      id: `chk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      listType,
      title: title.trim(),
      effort,
      roomOrArea: roomOrArea || 'General',
      completed: false,
      completedAt: null,
      createdAt: Date.now(),
    };
    const nextList = [newItem, ...checklistItems];
    set({ checklistItems: nextList });
    await persistChecklistItems(nextList);
  },

  toggleChecklistItem: async (id: string) => {
    const { checklistItems } = get();
    const nextList = checklistItems.map((item) =>
      item.id === id
        ? { ...item, completed: !item.completed, completedAt: !item.completed ? Date.now() : null }
        : item
    );
    set({ checklistItems: nextList });
    await persistChecklistItems(nextList);
  },

  deleteChecklistItem: async (id: string) => {
    const { checklistItems } = get();
    const nextList = checklistItems.filter((i) => i.id !== id);
    set({ checklistItems: nextList });
    await persistChecklistItems(nextList);
  },

  addReason: async (text: string) => {
    const { reasons } = get();
    const newReason: Reason = {
      id: `reason_manual_${Date.now()}`,
      text: text.trim(),
      source: 'manual',
      timesShown: 0,
      timesRedirected: 0,
      lastShownAt: null,
      archived: false,
      createdAt: Date.now(),
    };
    const nextReasons = [newReason, ...reasons];
    set({ reasons: nextReasons });
    await persistReasons(nextReasons);
  },

  toggleAlternative: async (id: string) => {
    const { alternatives } = get();
    const nextAlternatives = alternatives.map((a) =>
      a.id === id ? { ...a, enabled: !a.enabled } : a
    );
    set({ alternatives: nextAlternatives });
    await persistAlternatives(nextAlternatives);
  },
}));
