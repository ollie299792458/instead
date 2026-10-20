import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { triggerSuccessNotification } from '../lib/haptics';

interface MindfulTimerModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'meditation' | 'walk' | 'watch_dock' | null;
}

export const MindfulTimerModal: React.FC<MindfulTimerModalProps> = ({ visible, onClose, type }) => {
  const getInitialSeconds = () => {
    if (type === 'meditation') return 180; // 3 mins
    if (type === 'walk') return 600; // 10 mins
    if (type === 'watch_dock') return 120; // 2 mins
    return 60;
  };

  const [secondsRemaining, setSecondsRemaining] = useState(getInitialSeconds());
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (visible && type) {
      setSecondsRemaining(getInitialSeconds());
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  }, [visible, type]);

  useEffect(() => {
    if (!isRunning || secondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          triggerSuccessNotification();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, secondsRemaining]);

  const titles: Record<string, { title: string; subtitle: string; tip: string }> = {
    meditation: {
      title: 'Breathing Reset',
      subtitle: '3-Minute Mindful Breather',
      tip: 'Feel your chest rise and fall. When the mind wanders, gently bring attention back to the breath.',
    },
    walk: {
      title: 'Step Outside',
      subtitle: '10-Minute Walk',
      tip: 'Leave your phone in your pocket. Look up at the sky, trees, and buildings.',
    },
    watch_dock: {
      title: 'Look Out the Window',
      subtitle: '2-Minute Open Awareness',
      tip: 'Look out the window or at open space. Let your gaze soften into wide panorama mode.',
    },
  };

  const info = type ? titles[type] : null;

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const formattedTime = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.badge}>MINDFUL RESET</Text>
          <Text style={styles.title}>{info?.title}</Text>
          <Text style={styles.subtitle}>{info?.subtitle}</Text>

          {/* Big countdown timer */}
          <View style={styles.timerCircle}>
            <Text style={styles.timerNumber}>{formattedTime}</Text>
            <Text style={styles.timerLabel}>
              {secondsRemaining === 0 ? 'COMPLETE' : 'REMAINING'}
            </Text>
          </View>

          <Text style={styles.tipText}>"{info?.tip}"</Text>

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.toggleBtn}
              onPress={() => setIsRunning(!isRunning)}
            >
              <Text style={styles.toggleBtnText}>
                {secondsRemaining === 0 ? 'Restart' : isRunning ? 'Pause' : 'Resume'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 15, 23, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
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
    marginTop: 4,
    marginBottom: 28,
  },
  timerCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 4,
    borderColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    backgroundColor: '#0F172A',
  },
  timerNumber: {
    color: '#F8FAFC',
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: 1,
  },
  timerLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 1,
  },
  tipText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  btnRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  toggleBtn: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginRight: 10,
  },
  toggleBtnText: {
    color: '#F8FAFC',
    fontWeight: '600',
    fontSize: 15,
  },
  closeBtn: {
    flex: 1,
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
