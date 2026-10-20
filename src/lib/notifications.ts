import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (window.Notification.permission === 'granted') return true;
      if (window.Notification.permission !== 'denied') {
        const res = await window.Notification.requestPermission();
        return res === 'granted';
      }
    }
    return true;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

export async function scheduleTimeboxNudge(minutes: number, sessionId: string) {
  if (Platform.OS === 'web') {
    // On web, request browser permission if supported and schedule standard web timer
    await requestNotificationPermissions();
    if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
      setTimeout(() => {
        new window.Notification('Time’s up on your scroll', {
          body: `Your ${minutes}-minute limit finished. Ready to step away and reflect?`,
        });
      }, minutes * 60 * 1000);
    }
    return 'web-scheduled';
  }

  await requestNotificationPermissions();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('timebox', {
      name: 'Timebox Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B6B',
    });
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time’s up on your scroll',
      body: `Your ${minutes}-minute limit finished. Ready to step away and reflect?`,
      data: { sessionId, url: `instead://checkin?sessionId=${sessionId}` },
      sound: true,
    },
    trigger: {
      seconds: minutes * 60,
      channelId: 'timebox',
    },
  });
}
