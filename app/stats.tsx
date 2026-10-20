import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useInsteadStore } from '../src/store/useInsteadStore';

export default function StatsScreen() {
  const router = useRouter();
  const { promiseStreak, sessions, alternatives } = useInsteadStore();

  const redirectedCount = sessions.filter((s) => s.outcome === 'redirected').length;
  const watchedCount = sessions.filter((s) => s.outcome === 'watched').length;
  const totalSessions = sessions.length;

  // Estimate hours saved: average doomscroll session is ~45 mins
  const estimatedMinsSaved = redirectedCount * 45;
  const hoursSaved = (estimatedMinsSaved / 60).toFixed(1);

  // Group favorite alternatives
  const sortedAlternatives = [...alternatives]
    .filter((a) => a.timesChosen > 0)
    .sort((a, b) => b.timesChosen - a.timesChosen);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Progress</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Core Stat: Small Promise Kept */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>THE MICRO-PROMISE</Text>
          <Text style={styles.heroNumber}>{promiseStreak}</Text>
          <Text style={styles.heroSub}>
            Times you paused for 10 seconds before making a conscious choice
          </Text>
        </View>

        {/* 2x2 Grid */}
        <View style={styles.grid}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{redirectedCount}</Text>
            <Text style={styles.statLabel}>Times Redirected</Text>
            <Text style={styles.statHint}>Chose an alternative</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{hoursSaved} hrs</Text>
            <Text style={styles.statLabel}>Estimated Time Saved</Text>
            <Text style={styles.statHint}>~45m / avoided scroll</Text>
          </View>
        </View>

        {/* Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CHOICE BREAKDOWN</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowText}>Total Pauses Triggered</Text>
              <Text style={styles.rowVal}>{totalSessions}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowText}>Conscious Redirects</Text>
              <Text style={[styles.rowVal, { color: '#10B981' }]}>{redirectedCount}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowText}>Timeboxed Watches</Text>
              <Text style={[styles.rowVal, { color: '#F59E0B' }]}>{watchedCount}</Text>
            </View>
          </View>
        </View>

        {/* Most Chosen Alternatives */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>YOUR TOP ALTERNATIVES</Text>
          {sortedAlternatives.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.emptyText}>
                No redirects logged yet. Complete a pause and pick an alternative!
              </Text>
            </View>
          ) : (
            sortedAlternatives.map((alt) => (
              <View key={alt.id} style={styles.altRankRow}>
                <View>
                  <Text style={styles.altRankTitle}>{alt.title}</Text>
                  <Text style={styles.altRankCategory}>{alt.category}</Text>
                </View>
                <Text style={styles.altRankCount}>{alt.timesChosen} wins</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F17',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 24 : 12,
    marginBottom: 16,
  },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1E293B',
    borderRadius: 12,
  },
  backBtnText: {
    color: '#38BDF8',
    fontWeight: '700',
    fontSize: 14,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  heroLabel: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  heroNumber: {
    color: '#F8FAFC',
    fontSize: 56,
    fontWeight: '900',
  },
  heroSub: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statNumber: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  statHint: {
    color: '#64748B',
    fontSize: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  rowText: {
    color: '#CBD5E1',
    fontSize: 14,
  },
  rowVal: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 12,
  },
  altRankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  altRankTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  altRankCategory: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  altRankCount: {
    color: '#10B981',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
