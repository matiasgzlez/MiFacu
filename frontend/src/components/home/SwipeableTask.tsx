import React, { useRef, memo, useCallback } from 'react';
import { Animated, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { ThemeColors } from '../../types';

interface SwipeableTaskProps {
  children: React.ReactNode;
  onDelete: () => void;
  theme: ThemeColors;
}

/**
 * Swipeable wrapper for tasks with delete action
 * Using Swipeable from gesture-handler for Expo Go compatibility
 */
export const SwipeableTask = memo<SwipeableTaskProps>(function SwipeableTask({
  children,
  onDelete,
  theme,
}) {
  const swipeableRef = useRef<Swipeable>(null);

  const handleDelete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    swipeableRef.current?.close();
    onDelete();
  }, [onDelete]);

  const onSwipeOpen = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0.5],
      extrapolate: 'clamp',
    });

    const opacity = dragX.interpolate({
      inputRange: [-100, -50, 0],
      outputRange: [1, 0.8, 0],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.swipeDeleteContainer, { opacity }]}>
        <TouchableOpacity
          style={[styles.swipeDeleteButton, { backgroundColor: theme.red }]}
          onPress={handleDelete}
          accessibilityLabel="Eliminar tarea"
          accessibilityRole="button"
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            <Ionicons name="trash-outline" size={22} color="white" />
          </Animated.View>
          <Text style={styles.swipeDeleteText}>Eliminar</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      onSwipeableOpen={onSwipeOpen}
      rightThreshold={40}
      overshootRight={false}
      friction={2}
    >
      {children}
    </Swipeable>
  );
});

const styles = StyleSheet.create({
  swipeDeleteContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  swipeDeleteButton: {
    width: 80,
    height: '100%',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  swipeDeleteText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});
