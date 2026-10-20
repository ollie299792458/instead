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
import { triggerSuccessNotification } from '../src/lib/haptics';
import { useInsteadStore } from '../src/store/useInsteadStore';

export default function OnboardingScreen() {
  const router = useRouter();
  const { addReason } = useInsteadStore();

  const [step, setStep] = useState(1);
  const [personalReason, setPersonalReason] = useState(
    '5 minutes relaxation becomes 2 hours of zombie scrolling. It never actually relaxes me.'
  );

  const handleFinish = async () => {
    if (personalReason.trim()) {
      await addReason(personalReason.trim());
    }
    triggerSuccessNotification();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <View>
            <Text style={styles.badge}>STEP 1 OF 3</Text>
            <Text style={styles.title}>The First Principle</Text>
            <Text style={styles.subtitle}>
              You cannot quit impulse habits with guilt. You quit by deriving your choice from
              first principles when the urge hits.
            </Text>

            <View style={styles.promptCard}>
              <Text style={styles.promptLabel}>Why do you want to avoid mindless scrolling?</Text>
              <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={3}
                value={personalReason}
                onChangeText={setPersonalReason}
              />
              <Text style={styles.promptHint}>
                This will appear in your own words during the 10-second pause.
              </Text>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(2)}>
              <Text style={styles.primaryBtnText}>Continue →</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.badge}>STEP 2 OF 3</Text>
            <Text style={styles.title}>Short Enjoyable Things</Text>
            <Text style={styles.subtitle}>
              When dopamine is low, willpower fails. We loaded your personal note so you always have
              an immediate alternative ready:
            </Text>

            <View style={styles.categoryCard}>
              <Text style={styles.categoryTitle}>📚 Study</Text>
              <Text style={styles.categoryItems}>• Duolingo / Babbel • Flashcards (Anki) • Peak Brain Training</Text>
            </View>

            <View style={styles.categoryCard}>
              <Text style={styles.categoryTitle}>📰 Read</Text>
              <Text style={styles.categoryItems}>• Instapaper • Google News • Reading book</Text>
            </View>

            <View style={styles.categoryCard}>
              <Text style={styles.categoryTitle}>🛠️ Work & Flat DIY</Text>
              <Text style={styles.categoryItems}>• Emails • Tasks • Flat todo (DIY home jobs checklist)</Text>
            </View>

            <View style={styles.categoryCard}>
              <Text style={styles.categoryTitle}>🌿 Other</Text>
              <Text style={styles.categoryItems}>• Meditation • 10m Walk • Watch the dock</Text>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(3)}>
              <Text style={styles.primaryBtnText}>Looks Great →</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.badge}>STEP 3 OF 3</Text>
            <Text style={styles.title}>The Micro-Contract</Text>
            <Text style={styles.subtitle}>
              Do not promise future-you will never watch TikTok again. You only promise one thing:
            </Text>

            <View style={styles.contractCard}>
              <Text style={styles.contractQuote}>
                "Before I open TikTok, I will open Instead and pause for 10 seconds. After 10
                seconds, I am completely free to watch or do something else."
              </Text>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleFinish}>
              <Text style={styles.primaryBtnText}>I Make This Promise</Text>
            </TouchableOpacity>
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
  content: {
    padding: 24,
    paddingTop: Platform.OS === 'android' ? 36 : 24,
  },
  badge: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 26,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 6,
    marginBottom: 24,
    lineHeight: 22,
  },
  promptCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  promptLabel: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#F8FAFC',
    padding: 14,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  promptHint: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 8,
  },
  categoryCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryTitle: {
    color: '#F8FAFC',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4,
  },
  categoryItems: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
  },
  contractCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#38BDF8',
    marginBottom: 28,
  },
  contractQuote: {
    color: '#F8FAFC',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  primaryBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
