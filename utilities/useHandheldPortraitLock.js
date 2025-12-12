import { useCallback } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';

// Locks handheld devices (phones) to portrait when the screen is focused.
// Tablets (iPad or >=600dp short edge) stay flexible.
export default function useHandheldPortraitLock() {
  const { width, height } = useWindowDimensions();
  const looksLikeTablet = (Platform.OS === 'ios' && Platform.isPad) || Math.min(width, height) >= 600;
  const isPhoneLike = !looksLikeTablet;

  useFocusEffect(
    useCallback(() => {
      const lockOrientation = async () => {
        try {
          if (isPhoneLike) {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
          } else if (Platform.OS === 'ios' && Platform.isPad) {
            await ScreenOrientation.unlockAsync();
          }
        } catch (error) {
          console.warn('Could not set orientation for screen', error);
        }
      };

      lockOrientation();

      return () => {
        if (Platform.OS === 'ios' && Platform.isPad) {
          ScreenOrientation.unlockAsync().catch(() => {});
        }
      };
    }, [isPhoneLike])
  );
}
