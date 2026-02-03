import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

export type MiloState = 'idle' | 'studying' | 'celebrating' | 'sleeping';

interface MiloMascotProps {
  state: MiloState;
  isDark: boolean;
}

const STATE_EMOJI: Record<MiloState, string> = {
  idle: '🐱',
  studying: '📚🐱',
  celebrating: '🎉🐱🎉',
  sleeping: '😴🐱',
};

const STATE_MESSAGE: Record<MiloState, string> = {
  idle: 'Listo para estudiar!',
  studying: 'Enfocados...',
  celebrating: 'Genial! Sesion completada!',
  sleeping: 'Descansando...',
};

// MVP: Animated emoji mascot. Replace with Lottie animations later.
export default function MiloMascot({ state, isDark }: MiloMascotProps) {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state === 'celebrating') {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();

      const bounce = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -15,
            duration: 300,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 300,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        { iterations: 5 }
      );
      bounce.start();

      return () => bounce.stop();
    } else if (state === 'studying') {
      const sway = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -5,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 5,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      sway.start();
      return () => sway.stop();
    } else if (state === 'sleeping') {
      const breathe = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      breathe.start();
      return () => breathe.stop();
    } else {
      bounceAnim.setValue(0);
      scaleAnim.setValue(1);
    }
  }, [state]);

  const textColor = isDark ? '#FFFFFF' : '#4B4B4B';
  const messageColor = state === 'celebrating' ? '#FFC800' : (isDark ? '#AFAFAF' : '#777');

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.mascotContainer,
          {
            transform: [
              { translateY: bounceAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <Text style={styles.emoji}>{STATE_EMOJI[state]}</Text>
      </Animated.View>
      <Text style={[styles.message, { color: messageColor }]}>
        {STATE_MESSAGE[state]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  mascotContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
  },
  message: {
    fontSize: 15,
    fontWeight: '600',
  },
});
