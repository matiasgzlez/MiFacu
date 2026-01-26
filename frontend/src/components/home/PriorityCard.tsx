import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { ThemeColors } from '../../types';

interface PriorityCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle: string;
  color: string;
  onPress: () => void;
  theme: ThemeColors;
  cardColor: string;
}

/**
 * Quick access card for priority actions (Finales, Parciales)
 * Optimized with React.memo
 */
export const PriorityCard = memo<PriorityCardProps>(function PriorityCard({
  icon,
  label,
  subtitle,
  color,
  onPress,
  theme,
  cardColor,
}) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.priorityCard,
        { backgroundColor: cardColor, transform: [{ scale: pressed ? 0.96 : 1 }] },
      ]}
      accessibilityLabel={`${label}. ${subtitle}`}
      accessibilityRole="button"
      accessibilityHint={`Abre la sección de ${label}`}
    >
      <View style={[styles.priorityIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={22} color="white" />
      </View>
      <Text style={[styles.priorityLabel, { color: theme.text }]}>{label}</Text>
      <Text style={[styles.prioritySubtitle, { color: theme.icon }]}>{subtitle}</Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  priorityCard: {
    flex: 1,
    marginHorizontal: 5,
    padding: 16,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  priorityIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  priorityLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  prioritySubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
