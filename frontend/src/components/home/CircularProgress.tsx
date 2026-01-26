import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import type { ThemeColors } from '../../types';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
  percentage: number;
  size: number;
  strokeWidth: number;
  color: string;
  theme: ThemeColors;
  privacyMode: boolean;
}

/**
 * Circular progress indicator with SVG and animation
 */
export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size,
  strokeWidth,
  color,
  theme,
  privacyMode
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const target = privacyMode ? 0 : percentage;
    Animated.timing(progressAnim, {
      toValue: target,
      duration: 1000,
      useNativeDriver: false
    }).start();
  }, [percentage, privacyMode, progressAnim]);

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Background Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.separator + '40'}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Circle */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      {/* Centered Text */}
      <View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={[styles.bigNumber, { color: theme.text }]}>
          {privacyMode ? "•••" : `${Math.round(percentage)}%`}
        </Text>
        <Text style={[styles.total, { color: theme.icon }]}>Completado</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bigNumber: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1
  },
  total: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4
  },
});
