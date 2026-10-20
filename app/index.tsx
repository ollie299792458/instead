import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  triggerLightImpact,
  triggerMediumImpact,
  triggerSuccessNotification,
  triggerWarningNotification,
} from '../src/lib/haptics';
import { useInsteadStore } from '../src/store/useInsteadStore';
import { openAlternativeTarget, openTargetApp } from '../src/lib/deeplinks';
import { scheduleTimeboxNudge } from '../src/lib/notifications';
import { ChecklistModal } from '../src/components/ChecklistModal';
import { MindfulTimerModal } from '../src/components/MindfulTimerModal';
import { Alternative, BuiltInToolType, ChecklistListType } from '../src/types/instead';

export default function PauseScreen() {
  const router = useRouter();
  const {
    isReady,
    initialize,
    activeReason,
    suggestedAlternatives,
    activeSessionId,
    promiseStreak,
    sessions,
    checklistItems,
    shuffleAlternatives,
    recordCountdownComplete,
    chooseAlternative,
    chooseWatchAnyway,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
  } = useInsteadStore();

  const [secondsLeft, setSecondsLeft] = useState(10);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showWatchAnywayDrawer, setShowWatchAnywayDrawer] = useState(false);
  const [activeTimeboxMins, setActiveTimeboxMins] = useState<number | null>(null);

  // Modals for built-in tools
  const [activeChecklistType, setActiveChecklistType] = useState<ChecklistListType | null>(null);
  const [activeMindfulTimer, setActiveMindfulTimer] = useState<'meditation' | 'walk' | 'watch_dock' | null>(null);

  // Initialize store on mount
  useEffect(() => {
    initialize();
  }, []);

  // 10-Second Countdown & Android Back Button Interception
  useEffect(() => {
    // Intercept Android hardware back button during the 10s countdown
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!isUnlocked) {
        // Micro-promise in progress: subtle haptic warning, do not exit
        triggerWarningNotification();
        return true; // prevent exit
      }
      return false;
    });

    if (secondsLeft > 0) {
      const timer = setTimeout(() => {
        setSecondsLeft((s) => s - 1);
        if (secondsLeft === 5) {
          triggerLightImpact();
        }
      }, 1000);
      return () => {
        clearTimeout(timer);
        backHandler.remove();
      };
    } else if (!isUnlocked) {
      setIsUnlocked(true);
      recordCountdownComplete();
      triggerSuccessNotification();
    }

    return () => backHandler.remove();
  }, [secondsLeft, isUnlocked]);

  // Find last regret quote if any
  const lastRegretSession = sessions.find(
    (s) => s.outcome === 'watched' && s.checkInRating === 'regret' && s.checkInNote
  );

  const handleSelectAlternative = async (alt: Alternative) => {
    await chooseAlternative(alt.id);
    triggerMediumImpact();

    if (alt.builtInTool) {
      if (alt.builtInTool === 'flat_todo' || alt.builtInTool === 'tasks') {
        setActiveChecklistType(alt.builtInTool);
      } else {
        setActiveMindfulTimer(alt.builtInTool as 'meditation' | 'walk' | 'watch_dock');
      }
      return;
    }

    await openAlternativeTarget(alt);
  };

  const handleSelectWatchAnyway = async (minutes: number) => {
    if (!activeSessionId) return;
    await chooseWatchAnyway(minutes);
    await scheduleTimeboxNudge(minutes, activeSessionId);
    triggerWarningNotification();

    if (Platform.OS === 'web') {
      setActiveTimeboxMins(minutes);
      return;
    }

    await openTargetApp('tiktok');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Bar with Micro-Contract Streak & Navigation */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.streakBadge} onPress={() => router.push('/stats')}>
            <Text style={styles.streakFlame}>🔥</Text>
            <Text style={styles.streakText}>{promiseStreak} kept</Text>
          </TouchableOpacity>

          <View style={styles.topActions}>
            <TouchableOpacity
              style={[styles.iconBtn, { marginRight: 8 }]}
              onPress={() => router.push('/onboarding')}
            >
              <Text style={styles.iconBtnText}>📖</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/manage')}>
              <Text style={styles.iconBtnText}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 10-Second Micro-Promise Countdown */}
        <View style={styles.timerSection}>
          <View style={[styles.timerRing, isUnlocked && styles.timerRingUnlocked]}>
            <Text style={styles.timerNumber}>{isUnlocked ? '✓' : secondsLeft}</Text>
            <Text style={styles.timerSubLabel}>
              {isUnlocked ? 'PROMISE KEPT' : 'BREATHE • 10s PAUSE'}
            </Text>
          </View>
        </View>

        {/* First Principles Reason Card */}
        <View style={styles.reasonCard}>
          <Text style={styles.reasonHeader}>REMEMBER WHY</Text>
          <Text style={styles.reasonText}>
            "{activeReason?.text || '5 minutes relaxation becomes 2 hours of endless scrolling.'}"
          </Text>

          {/* Past Self Evidence Banner */}
          {lastRegretSession && (
            <View style={styles.evidenceBanner}>
              <Text style={styles.evidenceLabel}>LAST TIME YOU SCROLLED:</Text>
              <Text style={styles.evidenceText}>"{lastRegretSession.checkInNote}"</Text>
            </View>
          )}
        </View>

        {/* Alternatives Section */}
        <View style={styles.alternativesSection}>
          <View style={styles.alternativesHeader}>
            <Text style={styles.sectionTitle}>DO INSTEAD</Text>
            <TouchableOpacity onPress={shuffleAlternatives} style={styles.shuffleBtn}>
              <Text style={styles.shuffleBtnText}>↻ Shuffle</Text>
            </TouchableOpacity>
          </View>

          {suggestedAlternatives.map((alt) => {
            const categoryColors: Record<string, string> = {
              Study: '#3B82F6',
              Read: '#10B981',
              Work: '#F59E0B',
              Other: '#8B5CF6',
            };

            return (
              <TouchableOpacity
                key={alt.id}
                disabled={!isUnlocked}
                style={[styles.altCard, !isUnlocked && styles.altCardLocked]}
                onPress={() => handleSelectAlternative(alt)}
                activeOpacity={0.8}
              >
                <View style={styles.altCardContent}>
                  <View style={styles.altHeaderRow}>
                    <View
                      style={[
                        styles.catBadge,
                        { backgroundColor: categoryColors[alt.category] || '#6B7280' },
                      ]}
                    >
                      <Text style={styles.catBadgeText}>{alt.category}</Text>
                    </View>
                    <Text style={styles.actionArrow}>→</Text>
                  </View>
                  <Text style={styles.altTitle}>{alt.title}</Text>
                  <Text style={styles.altSubtitle}>{alt.subtitle}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Agency Option: "Continue anyway with time limit" */}
        {isUnlocked && (
          <View style={styles.watchAnywayContainer}>
            {activeTimeboxMins !== null ? (
              <View style={styles.activeTimeboxCard}>
                <Text style={styles.activeTimeboxTitle}>⏱️ Time limit active ({activeTimeboxMins} mins)</Text>
                <Text style={styles.activeTimeboxSubtitle}>
                  Testing in simulator? Jump straight to the post-scroll reflection screen:
                </Text>
                <TouchableOpacity
                  style={styles.simulateCheckinBtn}
                  onPress={() =>
                    router.push({
                      pathname: '/checkin',
                      params: { sessionId: activeSessionId || '' },
                    })
                  }
                >
                  <Text style={styles.simulateCheckinText}>Test "Time's Up" Reflection →</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ marginTop: 10 }}
                  onPress={() => setActiveTimeboxMins(null)}
                >
                  <Text style={styles.cancelText}>Reset Timer</Text>
                </TouchableOpacity>
              </View>
            ) : !showWatchAnywayDrawer ? (
              <TouchableOpacity
                style={styles.watchAnywayBtn}
                onPress={() => setShowWatchAnywayDrawer(true)}
              >
                <Text style={styles.watchAnywayText}>Continue to app anyway → Set a time limit</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.timeboxDrawer}>
                <Text style={styles.timeboxPrompt}>
                  No shame. How long do you want to spend?
                </Text>
                <View style={styles.timeboxRow}>
                  {[
                    { mins: 5, label: '5 min check' },
                    { mins: 10, label: '10 min break' },
                    { mins: 15, label: '15 min limit' },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.mins}
                      style={styles.timeboxPill}
                      onPress={() => handleSelectWatchAnyway(item.mins)}
                    >
                      <Text style={styles.timeboxPillText}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  style={styles.cancelDrawerBtn}
                  onPress={() => setShowWatchAnywayDrawer(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Built-in Flexible Checklist Modal (Flat todo & Tasks) */}
      <ChecklistModal
        visible={activeChecklistType !== null}
        onClose={() => setActiveChecklistType(null)}
        listType={activeChecklistType || 'flat_todo'}
        items={checklistItems}
        onToggleItem={toggleChecklistItem}
        onDeleteItem={deleteChecklistItem}
        onAddItem={addChecklistItem}
      />

      {/* Built-in Mindful Timer Modal (Meditation, Walk, Watch the dock) */}
      <MindfulTimerModal
        visible={activeMindfulTimer !== null}
        onClose={() => setActiveMindfulTimer(null)}
        type={activeMindfulTimer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F17',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 24 : 12,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  streakFlame: {
    fontSize: 14,
    marginRight: 6,
  },
  streakText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  topActions: {
    flexDirection: 'row',
  },
  iconBtn: {
    padding: 8,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  iconBtnText: {
    fontSize: 16,
  },
  timerSection: {
    alignItems: 'center',
    marginVertical: 14,
  },
  timerRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
  },
  timerRingUnlocked: {
    borderColor: '#10B981',
  },
  timerNumber: {
    color: '#F8FAFC',
    fontSize: 38,
    fontWeight: '800',
  },
  timerSubLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 2,
  },
  reasonCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  reasonHeader: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  reasonText: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
  },
  evidenceBanner: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  evidenceLabel: {
    color: '#F87171',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  evidenceText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontStyle: 'italic',
  },
  alternativesSection: {
    marginBottom: 20,
  },
  alternativesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  shuffleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  shuffleBtnText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600',
  },
  altCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 10,
  },
  altCardLocked: {
    opacity: 0.45,
  },
  altCardContent: {
    width: '100%',
  },
  altHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  catBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  actionArrow: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: 'bold',
  },
  altTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 3,
  },
  altSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
  },
  watchAnywayContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  watchAnywayBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  watchAnywayText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  timeboxDrawer: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  timeboxPrompt: {
    color: '#CBD5E1',
    fontSize: 13,
    marginBottom: 12,
  },
  timeboxRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  timeboxPill: {
    backgroundColor: '#334155',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  timeboxPillText: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 13,
  },
  cancelDrawerBtn: {
    marginTop: 12,
    paddingVertical: 4,
  },
  cancelText: {
    color: '#94A3B8',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  activeTimeboxCard: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  activeTimeboxTitle: {
    color: '#38BDF8',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4,
  },
  activeTimeboxSubtitle: {
    color: '#CBD5E1',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  simulateCheckinBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  simulateCheckinText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
