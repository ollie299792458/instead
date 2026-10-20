import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useInsteadStore } from '../src/store/useInsteadStore';

export default function ManageScreen() {
  const router = useRouter();
  const { reasons, alternatives, addReason, toggleAlternative } = useInsteadStore();

  const [activeTab, setActiveTab] = useState<'reasons' | 'alternatives' | 'shortcuts'>('reasons');
  const [newReasonText, setNewReasonText] = useState('');

  const handleAddReason = async () => {
    if (!newReasonText.trim()) return;
    await addReason(newReasonText.trim());
    setNewReasonText('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customize</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reasons' && styles.tabActive]}
          onPress={() => setActiveTab('reasons')}
        >
          <Text style={[styles.tabText, activeTab === 'reasons' && styles.tabTextActive]}>
            My Reasons
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'alternatives' && styles.tabActive]}
          onPress={() => setActiveTab('alternatives')}
        >
          <Text style={[styles.tabText, activeTab === 'alternatives' && styles.tabTextActive]}>
            Alternatives
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'shortcuts' && styles.tabActive]}
          onPress={() => setActiveTab('shortcuts')}
        >
          <Text style={[styles.tabText, activeTab === 'shortcuts' && styles.tabTextActive]}>
            Intercept Setup
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Reasons Tab */}
        {activeTab === 'reasons' && (
          <View>
            <Text style={styles.sectionSubtitle}>
              These are rotated during your 10-second pause to ground you in first principles.
            </Text>

            {/* Add reason input */}
            <View style={styles.addCard}>
              <TextInput
                style={styles.input}
                placeholder="Write a reason in your own words..."
                placeholderTextColor="#64748B"
                value={newReasonText}
                onChangeText={setNewReasonText}
                multiline
              />
              <TouchableOpacity style={styles.addBtn} onPress={handleAddReason}>
                <Text style={styles.addBtnText}>+ Add Reason</Text>
              </TouchableOpacity>
            </View>

            {reasons.map((r) => (
              <View key={r.id} style={styles.card}>
                <Text style={styles.cardText}>"{r.text}"</Text>
                <View style={styles.cardMeta}>
                  <Text style={styles.cardBadge}>
                    Shown {r.timesShown}x • {r.timesRedirected} redirects
                  </Text>
                  {r.source === 'checkin' && (
                    <Text style={[styles.cardBadge, { color: '#F87171' }]}>From Reflection</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Alternatives Tab */}
        {activeTab === 'alternatives' && (
          <View>
            <Text style={styles.sectionSubtitle}>
              Toggle items from your note or external apps you want suggested on the pause screen.
            </Text>

            {alternatives.map((alt) => (
              <View key={alt.id} style={styles.altRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.altTitle}>{alt.title}</Text>
                  <Text style={styles.altSubtitle}>
                    {alt.category} • {alt.subtitle}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggleBtn, alt.enabled && styles.toggleBtnActive]}
                  onPress={() => toggleAlternative(alt.id)}
                >
                  <Text style={[styles.toggleBtnText, alt.enabled && styles.toggleBtnTextActive]}>
                    {alt.enabled ? 'ON' : 'OFF'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Interception Setup Tab (Android & iOS) */}
        {activeTab === 'shortcuts' && (
          <View>
            <Text style={styles.sectionSubtitle}>
              How to automatically open Instead before TikTok out of habit or muscle memory.
            </Text>

            <View style={styles.guideCard}>
              <Text style={styles.guideTitle}>🤖 Android Options</Text>
              <Text style={styles.guideStep}>
                1. <Text style={styles.bold}>Muscle Memory Hijack:</Text> Move TikTok off your home screen dock or main folder, and place <Text style={styles.bold}>Instead</Text> in that exact spot.
              </Text>
              <Text style={styles.guideStep}>
                2. <Text style={styles.bold}>MacroDroid / Tasker:</Text> Set trigger "App Opened: TikTok" → Action: "Launch App: Instead" (or Open URL <Text style={styles.code}>instead://pause</Text>).
              </Text>
            </View>

            <View style={styles.guideCard}>
              <Text style={styles.guideTitle}>🍎 iOS Shortcuts Guide</Text>
              <Text style={styles.guideStep}>1. Open Apple's built-in <Text style={styles.bold}>Shortcuts</Text> app.</Text>
              <Text style={styles.guideStep}>2. Tap <Text style={styles.bold}>Automation</Text> → New Automation.</Text>
              <Text style={styles.guideStep}>3. Choose <Text style={styles.bold}>App</Text> → Select TikTok (Is Opened, Run Immediately).</Text>
              <Text style={styles.guideStep}>
                4. Action: <Text style={styles.bold}>Open URL</Text> → enter <Text style={styles.code}>instead://pause</Text>.
              </Text>
            </View>
          </View>
        )}
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
    marginBottom: 12,
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
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#1E293B',
  },
  tabActive: {
    borderBottomColor: '#38BDF8',
  },
  tabText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#F8FAFC',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  addCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  input: {
    color: '#F8FAFC',
    fontSize: 14,
    minHeight: 50,
    marginBottom: 8,
  },
  addBtn: {
    alignSelf: 'flex-end',
    backgroundColor: '#0284C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardText: {
    color: '#F8FAFC',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardBadge: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  altRow: {
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
  altTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  altSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#334155',
  },
  toggleBtnActive: {
    backgroundColor: '#10B981',
  },
  toggleBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
  },
  guideCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  guideTitle: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  guideStep: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  code: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#38BDF8',
    backgroundColor: '#0F172A',
  },
});
