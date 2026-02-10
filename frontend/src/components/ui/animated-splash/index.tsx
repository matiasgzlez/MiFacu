import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Match the splash-icon.png background color
const SPLASH_BG = '#4A7AFF';

interface AnimatedSplashProps {
  onFinish: () => void;
}

export function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const containerScale = useSharedValue(1);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // Step 1: Logo bounces in with spring
    logoOpacity.value = withTiming(1, { duration: 200 });
    logoScale.value = withSpring(1, {
      damping: 12,
      stiffness: 150,
      mass: 0.8,
    });

    // Step 2: After a pause, zoom the whole screen forward and fade out
    const zoomDelay = 1200; // ms to hold before zooming

    containerScale.value = withDelay(
      zoomDelay,
      withTiming(6, {
        duration: 500,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      })
    );

    containerOpacity.value = withDelay(
      zoomDelay,
      withTiming(0, {
        duration: 450,
        easing: Easing.out(Easing.quad),
      }, (finished) => {
        if (finished) {
          runOnJS(onFinish)();
        }
      })
    );
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <Image
          source={require('../../../../assets/images/splash-icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </Animated.View>
  );
}

const LOGO_SIZE = 180;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SPLASH_BG,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  logoContainer: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
});
