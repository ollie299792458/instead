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
import { AlternativeCategory } from '../src/types/instead';

export default function ManageScreen() {
  const router = useRouter();
  const {
    reasons,
    alternatives,
    addReason,
    toggleReason,
    deleteReason,
    toggleAlternative,
    addAlternative,
    deleteAlternative,
  } = useInsteadStore();

  const [activeTab, setActiveTab] = useState<'reasons' | 'alternatives' | 'shortcuts'>('reasons');
  const [newReasonText, setNewReasonText] = useState('');

  // Custom alternative form state
  const [altTitle, setAltTitle] = useState('');
  const [altSubtitle, setAltSubtitle] = useState('');
  const [altCategory, setAltCategory] = useState<AlternativeCategory>('Study');
  const [altLink, setAltLink] = useState('');
  const [showAddAlt, setShowAddAlt] = useState(false);

  const handleAddReason = async () => {
    if (!newReasonText.trim()) return;
    await addReason(newReasonText.trim());
    setNewReasonText('');
  };

  const handleAddAlternative = async () => {
    if (!altTitle.trim()) return;
    await addAlternative(altTitle, altCategory, altSubtitle, altLink);
    setAltTitle('');
    setAltSubtitle('');
    setAltLink('');
    setShowAddAlt(false);
  };

  const categories: AlternativeCategory[] = ['Study', 'Read', 'Work', 'Other'];

  const categoryColors: Record<AlternativeCategory, string> = {
    Study: '#3B82F6',
    Read: '#10B981',
    Work: '#F59E0B',
    Other: '#8B5CF6',
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
              Toggle or add reasons. Enabled reasons are rotated during your 10-second pause to ground you in first principles.
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

            {reasons.map((r) => {
              const isEnabled = !r.archived;
              return (
                <View key={r.id} style={[styles.card, !isEnabled && styles.cardDisabled]}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={[styles.cardText, !isEnabled && styles.cardTextDisabled]}>
                      "{r.text}"
                    </Text>
                  </View>

                  <View style={styles.cardActionsRow}>
                    <View style={styles.cardMeta}>
                      <Text style={styles.cardBadge}>
                        Shown {r.timesShown}x • {r.timesRedirected} redirects
                      </Text>
                      {r.source === 'checkin' && (
                        <Text style={[styles.cardBadge, { color: '#F87171' }]}>From Reflection</Text>
                      )}
                      {r.source === 'onboarding' && (
                        <Text style={[styles.cardBadge, { color: '#38BDF8' }]}>Default</Text>
                      )}
                    </View>

                    <View style={styles.cardButtonsRight}>
                      <TouchableOpacity
                        style={[styles.toggleBtn, isEnabled && styles.toggleBtnActive]}
                        onPress={() => toggleReason(r.id)}
                      >
                        <Text style={[styles.toggleBtnText, isEnabled && styles.toggleBtnTextActive]}>
                          {isEnabled ? 'ON' : 'OFF'}
                        </Text>
                      </TouchableOpacity>

                      {r.source !== 'onboarding' && (
                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => deleteReason(r.id)}
                        >
                          <Text style={styles.deleteBtnText}>✕</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Alternatives Tab */}
        {activeTab === 'alternatives' && (
          <View>
            <View style={styles.sectionHeaderBetween}>
              <Text style={styles.sectionSubtitleFlex}>
                Toggle or add alternatives you want suggested on the pause screen.
              </Text>
              <TouchableOpacity
                style={styles.addCustomAltBtn}
                onPress={() => setShowAddAlt(!showAddAlt)}
              >
                <Text style={styles.addCustomAltBtnText}>
                  {showAddAlt ? 'Close' : '+ Add Custom'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Custom Alternative Creation Form */}
            {showAddAlt && (
              <View style={styles.customAltForm}>
                <Text style={styles.formTitle}>Add Custom Alternative</Text>

                <Text style={styles.inputLabel}>Title *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Guitar Practice, Journaling, Yoga"
                  placeholderTextColor="#64748B"
                  value={altTitle}
                  onChangeText={setAltTitle}
                />

                <Text style={styles.inputLabel}>Category</Text>
                <View style={styles.categoryPickerRow}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catOption,
                        altCategory === cat && { backgroundColor: categoryColors[cat] },
                      ]}
                      onPress={() => setAltCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.catOptionText,
                          altCategory === cat && styles.catOptionTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Subtitle (optional)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. 5 mins • Play 2 songs"
                  placeholderTextColor="#64748B"
                  value={altSubtitle}
                  onChangeText={setAltSubtitle}
                />

                <Text style={styles.inputLabel}>App Link / Web URL (optional)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. https://open.spotify.com or app scheme"
                  placeholderTextColor="#64748B"
                  value={altLink}
                  onChangeText={setAltLink}
                  autoCapitalize="none"
                />

                <TouchableOpacity
                  style={[styles.saveAltBtn, !altTitle.trim() && { opacity: 0.5 }]}
                  disabled={!altTitle.trim()}
                  onPress={handleAddAlternative}
                >
                  <Text style={styles.saveAltBtnText}>Save Alternative</Text>
                </TouchableOpacity>
              </View>
            )}

            {alternatives.map((alt) => {
              const isCustom = alt.id.startsWith('alt_custom_');
              return (
                <View key={alt.id} style={[styles.altRow, !alt.enabled && styles.cardDisabled]}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <View style={styles.altHeaderRow}>
                      <Text style={[styles.altTitle, !alt.enabled && styles.cardTextDisabled]}>
                        {alt.title}
                      </Text>
                      {isCustom && (
                        <View style={styles.customBadge}>
                          <Text style={styles.customBadgeText}>Custom</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.altSubtitle}>
                      {alt.category} • {alt.subtitle}
                    </Text>
                  </View>

                  <View style={styles.cardButtonsRight}>
                    <TouchableOpacity
                      style={[styles.toggleBtn, alt.enabled && styles.toggleBtnActive]}
                      onPress={() => toggleAlternative(alt.id)}
                    >
                      <Text style={[styles.toggleBtnText, alt.enabled && styles.toggleBtnTextActive]}>
                        {alt.enabled ? 'ON' : 'OFF'}
                      </Text>
                    </TouchableOpacity>

                    {isCustom && (
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => deleteAlternative(alt.id)}
                      >
                        <Text style={styles.deleteBtnText}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
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
  sectionHeaderBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionSubtitleFlex: {
    flex: 1,
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
    marginRight: 10,
  },
  addCustomAltBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addCustomAltBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  customAltForm: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  formTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  inputLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#F8FAFC',
    padding: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  categoryPickerRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  catOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#334155',
    marginRight: 6,
  },
  catOptionText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  catOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  saveAltBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  saveAltBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
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
  cardDisabled: {
    opacity: 0.5,
  },
  cardHeaderRow: {
    marginBottom: 8,
  },
  cardText: {
    color: '#F8FAFC',
    fontSize: 15,
    lineHeight: 22,
  },
  cardTextDisabled: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
  },
  cardBadge: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  cardButtonsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  altHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  customBadge: {
    backgroundColor: '#0369A1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  customBadgeText: {
    color: '#E0F2FE',
    fontSize: 10,
    fontWeight: 'bold',
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
  deleteBtn: {
    padding: 6,
    backgroundColor: '#334155',
    borderRadius: 8,
  },
  deleteBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: 'bold',
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
