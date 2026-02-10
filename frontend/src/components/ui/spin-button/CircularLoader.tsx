import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface CircularLoaderProps {
  activeColor: string;
  size: number;
  strokeWidth: number;
  duration?: number;
}

export function CircularLoader({
  activeColor,
  size,
  strokeWidth,
  duration = 800,
}: CircularLoaderProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration, easing: Easing.linear }),
      -1,
      false,
    );
  }, [duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const arcSize = size - strokeWidth;

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          justifyContent: 'center',
          alignItems: 'center',
        },
        animatedStyle,
      ]}
    >
      <View
        style={{
          width: arcSize,
          height: arcSize,
          borderRadius: arcSize / 2,
          borderWidth: strokeWidth,
          borderColor: 'transparent',
          borderTopColor: activeColor,
          borderRightColor: activeColor,
        }}
      />
    </Animated.View>
  );
}
