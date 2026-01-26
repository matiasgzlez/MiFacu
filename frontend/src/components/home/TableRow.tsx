import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { ThemeColors } from '../../types';

interface TableRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
  isLast: boolean;
  theme: ThemeColors;
}

/**
 * iOS-style table row for navigation items
 * Optimized with React.memo
 */
export const TableRow = memo<TableRowProps>(function TableRow({
  icon,
  label,
  color,
  onPress,
  isLast,
  theme,
}) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.rowWrapper,
        { backgroundColor: pressed ? theme.separator + '20' : 'transparent' },
      ]}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityHint={`Abre ${label}`}
    >
      <View
        style={[
          styles.rowContainer,
          !isLast && { borderBottomColor: theme.separator, borderBottomWidth: StyleSheet.hairlineWidth },
        ]}
      >
        <View style={[styles.rowIconBox, { backgroundColor: color }]}>
          <Ionicons name={icon} size={18} color="white" />
        </View>
        <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
        <Ionicons name="chevron-forward" size={16} color={theme.separator} />
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  rowWrapper: {
    width: '100%',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginLeft: 55,
  },
  rowIconBox: {
    position: 'absolute',
    left: -40,
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 17,
    fontWeight: '400',
  },
});
