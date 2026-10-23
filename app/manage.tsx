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
import { Alternative, AlternativeCategory } from '../src/types/instead';
import { APP_REDIRECT_PRESETS, AppRedirectPreset } from '../src/constants/appPresets';

export default function ManageScreen() {
  const router = useRouter();
  const {
    reasons,
    alternatives,
    addReason,
    toggleReason,
    deleteReason,
    toggleAlternative,
    updateAlternativeTarget,
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

  // Editing existing alternative target modal/section state
  const [editingAltId, setEditingAltId] = useState<string | null>(null);
  const [customUrlInput, setCustomUrlInput] = useState('');

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

  const handleSelectPreset = async (alt: Alternative, preset: AppRedirectPreset) => {
    await updateAlternativeTarget(alt.id, {
      selectedPresetId: preset.id,
      iosScheme: preset.iosScheme,
      androidPackage: preset.androidPackage,
      webFallbackUrl: preset.webFallbackUrl,
      subtitle: `5 mins • Opens ${preset.name}`,
    });
  };

  const handleSaveCustomTarget = async (alt: Alternative) => {
    const trimmed = customUrlInput.trim();
    if (!trimmed) return;
    const isScheme = !trimmed.startsWith('http://') && !trimmed.startsWith('https://');
    await updateAlternativeTarget(alt.id, {
      selectedPresetId: 'custom',
      iosScheme: isScheme ? trimmed : undefined,
      androidPackage: undefined,
      webFallbackUrl: isScheme ? undefined : trimmed,
      subtitle: `Opens custom: ${trimmed}`,
    });
    setEditingAltId(null);
    setCustomUrlInput('');
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
                Configure target apps, toggle items, or add custom alternatives.
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
                  placeholder="e.g. https://open.spotify.com or spotify://"
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
              const presets = APP_REDIRECT_PRESETS[alt.id];
              const isEditing = editingAltId === alt.id;

              return (
                <View key={alt.id} style={[styles.altCardWrapper, !alt.enabled && styles.cardDisabled]}>
                  <View style={styles.altRow}>
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
                        {alt.builtInTool && (
                          <View style={styles.builtInBadge}>
                            <Text style={styles.builtInBadgeText}>Built-in</Text>
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

                  {/* App Redirect Configuration Section (if presets exist or is custom app) */}
                  {presets && (
                    <View style={styles.presetsSection}>
                      <Text style={styles.presetSectionTitle}>Redirect App:</Text>
                      <View style={styles.presetChipsRow}>
                        {presets.map((preset) => {
                          const isSelected =
                            alt.selectedPresetId === preset.id ||
                            (!alt.selectedPresetId && presets[0].id === preset.id);

                          return (
                            <TouchableOpacity
                              key={preset.id}
                              style={[
                                styles.presetChip,
                                isSelected && styles.presetChipSelected,
                              ]}
                              onPress={() => handleSelectPreset(alt, preset)}
                            >
                              <Text
                                style={[
                                  styles.presetChipText,
                                  isSelected && styles.presetChipTextSelected,
                                ]}
                              >
                                {isSelected ? `✓ ${preset.name}` : preset.name}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}

                        <TouchableOpacity
                          style={[
                            styles.presetChip,
                            alt.selectedPresetId === 'custom' && styles.presetChipSelected,
                          ]}
                          onPress={() => {
                            setEditingAltId(isEditing ? null : alt.id);
                            setCustomUrlInput(alt.webFallbackUrl || alt.iosScheme || '');
                          }}
                        >
                          <Text
                            style={[
                              styles.presetChipText,
                              alt.selectedPresetId === 'custom' && styles.presetChipTextSelected,
                            ]}
                          >
                            {alt.selectedPresetId === 'custom' ? '✓ Custom URL' : 'Custom...'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Custom URL Editor drawer */}
                  {isEditing && (
                    <View style={styles.customUrlDrawer}>
                      <Text style={styles.customUrlPrompt}>Enter app scheme or web URL:</Text>
                      <TextInput
                        style={styles.customUrlInput}
                        placeholder="e.g. babbel:// or https://..."
                        placeholderTextColor="#64748B"
                        value={customUrlInput}
                        onChangeText={setCustomUrlInput}
                        autoCapitalize="none"
                      />
                      <View style={styles.customUrlBtnRow}>
                        <TouchableOpacity
                          style={styles.saveCustomUrlBtn}
                          onPress={() => handleSaveCustomTarget(alt)}
                        >
                          <Text style={styles.saveCustomUrlBtnText}>Save App Link</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.cancelCustomUrlBtn}
                          onPress={() => setEditingAltId(null)}
                        >
                          <Text style={styles.cancelCustomUrlBtnText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Interception Setup Tab (Android & iOS) */}
        {activeTab === 'shortcuts' && (
          <View>
            <Text style={styles.sectionSubtitle}>
              How to automatically open Instead before short form video (e.g. TikTok, Reels, Shorts, etc.) out of habit or muscle memory.
            </Text>

            <View style={styles.guideCard}>
              <Text style={styles.guideTitle}>🤖 Android Options</Text>
              <Text style={styles.guideStep}>
                1. <Text style={styles.bold}>Muscle Memory Hijack:</Text> Move short form video apps off your home screen dock or main folder, and place <Text style={styles.bold}>Instead</Text> in that exact spot.
              </Text>
              <Text style={styles.guideStep}>
                2. <Text style={styles.bold}>MacroDroid / Tasker:</Text> Set trigger "App Opened: TikTok / Instagram / YouTube" → Action: "Launch App: Instead" (or Open URL <Text style={styles.code}>instead://pause</Text>).
              </Text>
            </View>

            <View style={styles.guideCard}>
              <Text style={styles.guideTitle}>🍎 iOS Shortcuts Guide</Text>
              <Text style={styles.guideStep}>1. Open Apple's built-in <Text style={styles.bold}>Shortcuts</Text> app.</Text>
              <Text style={styles.guideStep}>2. Tap <Text style={styles.bold}>Automation</Text> → New Automation.</Text>
              <Text style={styles.guideStep}>3. Choose <Text style={styles.bold}>App</Text> → Select your short form video apps (e.g. TikTok, Instagram, YouTube) (Is Opened, Run Immediately).</Text>
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
  altCardWrapper: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  altRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  builtInBadge: {
    backgroundColor: '#065F46',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  builtInBadgeText: {
    color: '#D1FAE5',
    fontSize: 10,
    fontWeight: 'bold',
  },
  presetsSection: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  presetSectionTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  presetChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetChip: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  presetChipSelected: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  presetChipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  presetChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  customUrlDrawer: {
    marginTop: 10,
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0284C7',
  },
  customUrlPrompt: {
    color: '#CBD5E1',
    fontSize: 12,
    marginBottom: 6,
  },
  customUrlInput: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#F8FAFC',
    padding: 8,
    fontSize: 13,
    marginBottom: 8,
  },
  customUrlBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveCustomUrlBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saveCustomUrlBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cancelCustomUrlBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  cancelCustomUrlBtnText: {
    color: '#94A3B8',
    fontSize: 12,
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
