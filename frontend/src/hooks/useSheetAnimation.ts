import { useState, useCallback, useRef } from 'react';
import { Animated, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SheetAnimationConfig {
  damping?: number;
  stiffness?: number;
  mass?: number;
}

interface UseSheetAnimationReturn {
  visible: boolean;
  sheetAnim: Animated.Value;
  overlayOpacity: Animated.Value;
  open: () => void;
  close: () => void;
}

/**
 * Hook for bottom sheet animations using React Native Animated
 * Compatible with Expo Go
 */
export function useSheetAnimation(
  config: SheetAnimationConfig = {},
  withHaptics = true
): UseSheetAnimationReturn {
  const [visible, setVisible] = useState(false);

  const sheetAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const open = useCallback(() => {
    if (withHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setVisible(true);

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(sheetAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: config.damping ?? 18,
        stiffness: config.stiffness ?? 120,
        mass: config.mass ?? 0.8,
      }),
    ]).start();
  }, [config, withHaptics, overlayOpacity, sheetAnim]);

  const close = useCallback(() => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(sheetAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setVisible(false));
  }, [overlayOpacity, sheetAnim]);

  return {
    visible,
    sheetAnim,
    overlayOpacity,
    open,
    close,
  };
}

/**
 * Hook for notification slide-in animation
 * Compatible with Expo Go
 */
export function useNotificationAnimation() {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const show = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateY, opacity]);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateY, opacity]);

  return {
    translateY,
    opacity,
    show,
    hide,
  };
}
