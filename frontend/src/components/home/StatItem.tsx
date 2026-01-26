import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeColors } from '../../types';

interface StatItemProps {
  iconName: keyof typeof Ionicons.glyphMap;
  number: number | string;
  label: string;
  color: string;
  theme: ThemeColors;
  isBig?: boolean;
}

/**
 * Stat item for the stats grid in the modal
 */
export const StatItem: React.FC<StatItemProps> = ({
  number,
  label,
  color,
  theme,
  iconName,
  isBig
}) => (
  <View style={[styles.statItem, { backgroundColor: theme.background }]}>
    <View style={[styles.statIconCircle, { backgroundColor: color + '20' }]}>
      <Ionicons name={iconName} size={20} color={color} />
    </View>
    <Text style={[styles.statNumber, { color: theme.text, fontSize: isBig ? 28 : 24 }]}>
      {number}
    </Text>
    <Text style={[styles.statLabelItem, { color: theme.icon }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  statItem: {
    width: '48%',
    padding: 16,
    borderRadius: 20,
    alignItems: 'flex-start',
    marginBottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 2
  },
  statLabelItem: {
    fontSize: 13,
    fontWeight: '600'
  },
});
