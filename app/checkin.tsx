import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { triggerSuccessNotification } from '../src/lib/haptics';
import { useInsteadStore } from '../src/store/useInsteadStore';
import { CheckInRating } from '../src/types/instead';

export default function CheckInScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { submitCheckIn } = useInsteadStore();

  const [selectedRating, setSelectedRating] = useState<CheckInRating | null>(null);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!selectedRating || !sessionId) return;
    await submitCheckIn(sessionId, selectedRating, note);
    triggerSuccessNotification();
    setSubmitted(true);
    setTimeout(() => {
      router.replace('/');
    }, 1200);
  };

  const ratings: { rating: CheckInRating; label: string; icon: string; desc: string }[] = [
    { rating: 'worth_it', label: 'Worth it', icon: '✨', desc: 'Felt genuine relaxation' },
    { rating: 'neutral', label: 'Neutral', icon: '😐', desc: 'Neither good nor bad' },
    { rating: 'regret', label: 'Wish I hadn’t', icon: '🥀', desc: 'Tired, lost track of time' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.badge}>FEEDBACK LOOP</Text>
        <Text style={styles.title}>How do you feel after scrolling?</Text>
        <Text style={styles.subtitle}>
          First principles work best with your own evidence. Be completely honest.
        </Text>

        {submitted ? (
          <View style={styles.submittedContainer}>
            <Text style={styles.submittedCheck}>✓</Text>
            <Text style={styles.submittedTitle}>Logged to your history</Text>
            <Text style={styles.submittedSub}>
              {selectedRating === 'regret' && note
                ? 'Your note will be shown next time to remind future you.'
                : 'Returning to home...'}
            </Text>
          </View>
        ) : (
          <>
            {/* Rating Cards */}
            <View style={styles.ratingGrid}>
              {ratings.map((r) => (
                <TouchableOpacity
                  key={r.rating}
                  style={[
                    styles.ratingCard,
                    selectedRating === r.rating && styles.ratingCardSelected,
                  ]}
                  onPress={() => setSelectedRating(r.rating)}
                >
                  <Text style={styles.ratingIcon}>{r.icon}</Text>
                  <Text style={styles.ratingLabel}>{r.label}</Text>
                  <Text style={styles.ratingDesc}>{r.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Note Input */}
            <View style={styles.noteSection}>
              <Text style={styles.noteLabel}>
                {selectedRating === 'regret'
                  ? 'What happened? (e.g. "20m turned into 1h, head hurts")'
                  : 'Quick reflection note (optional)'}
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="Write your honest observation..."
                placeholderTextColor="#64748B"
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              disabled={!selectedRating}
              style={[styles.submitBtn, !selectedRating && styles.submitBtnDisabled]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitBtnText}>Save Reflection</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipBtn} onPress={() => router.replace('/')}>
              <Text style={styles.skipBtnText}>Skip</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F17',
  },
  content: {
    flex: 1,
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
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 6,
    marginBottom: 24,
    lineHeight: 20,
  },
  ratingGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  ratingCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: '#334155',
  },
  ratingCardSelected: {
    borderColor: '#38BDF8',
    backgroundColor: '#0F172A',
  },
  ratingIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  ratingLabel: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 4,
  },
  ratingDesc: {
    color: '#64748B',
    fontSize: 10,
    textAlign: 'center',
  },
  noteSection: {
    marginBottom: 24,
  },
  noteLabel: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#F8FAFC',
    padding: 14,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  skipBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  skipBtnText: {
    color: '#64748B',
    fontSize: 14,
  },
  submittedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  submittedCheck: {
    fontSize: 48,
    color: '#10B981',
    marginBottom: 16,
  },
  submittedTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  submittedSub: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
