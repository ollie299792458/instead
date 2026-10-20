import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { Alternative } from '../types/instead';

export async function openAlternativeTarget(alternative: Alternative): Promise<boolean> {
  // If it's a built-in tool, return false so caller can open the in-app modal
  if (alternative.builtInTool) {
    return false;
  }

  // 1. Android specific package intent handling
  if (Platform.OS === 'android' && alternative.androidPackage) {
    const playStoreUrl = `market://details?id=${alternative.androidPackage}`;
    const webPlayStore = `https://play.google.com/store/apps/details?id=${alternative.androidPackage}`;

    // On Android, we can try direct scheme if specified
    if (alternative.iosScheme) {
      const canOpen = await Linking.canOpenURL(alternative.iosScheme).catch(() => false);
      if (canOpen) {
        await Linking.openURL(alternative.iosScheme);
        return true;
      }
    }

    // Try opening via market or fallback to web
    if (alternative.webFallbackUrl) {
      await Linking.openURL(alternative.webFallbackUrl);
      return true;
    }

    const canOpenPlay = await Linking.canOpenURL(playStoreUrl).catch(() => false);
    if (canOpenPlay) {
      await Linking.openURL(playStoreUrl);
      return true;
    } else {
      await Linking.openURL(webPlayStore);
      return true;
    }
  }

  // 2. iOS custom scheme
  if (Platform.OS === 'ios' && alternative.iosScheme) {
    const canOpen = await Linking.canOpenURL(alternative.iosScheme).catch(() => false);
    if (canOpen) {
      await Linking.openURL(alternative.iosScheme);
      return true;
    }
  }

  // 3. Web Fallback
  if (alternative.webFallbackUrl) {
    await Linking.openURL(alternative.webFallbackUrl);
    return true;
  }

  return false;
}

export async function openTargetApp(target: 'tiktok' | 'shorts' | 'reels' = 'tiktok') {
  if (target === 'tiktok') {
    if (Platform.OS === 'android') {
      const canOpen = await Linking.canOpenURL('snssdk1233://').catch(() => false);
      if (canOpen) return Linking.openURL('snssdk1233://');
    }
    const webTiktok = 'https://www.tiktok.com';
    return Linking.openURL(webTiktok);
  }
}
