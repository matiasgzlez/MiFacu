import React, { useRef, useEffect, memo } from 'react';
import { Animated } from 'react-native';

interface AnimatedItemProps {
  children: React.ReactNode;
  index?: number;
  delay?: number;
}

/**
 * Wrapper component that provides staggered fade-in and slide-up animation
 * Compatible with Expo Go
 */
export const AnimatedItem = memo<AnimatedItemProps>(function AnimatedItem({
  children,
  index = 0,
  delay = 50,
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const staggerDelay = index * delay;

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, staggerDelay);

    return () => clearTimeout(timer);
  }, [index, delay, fadeAnim, slideAnim]);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      {children}
    </Animated.View>
  );
});
