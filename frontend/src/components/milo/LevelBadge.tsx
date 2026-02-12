import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, mifacuGold } from '../../constants/theme';
import { useColorScheme } from '../../context/ThemeContext';
import { getLevelForXP, getNextLevel } from '../../constants/levels';

interface LevelBadgeProps {
  xp: number;
  /** 'compact' shows just the badge circle, 'full' shows badge + title + description */
  variant?: 'compact' | 'full';
  /** Override size for compact variant (default 48) */
  size?: number;
}

export function LevelBadge({ xp, variant = 'full', size = 48 }: LevelBadgeProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  const level = getLevelForXP(xp);
  const nextLevel = getNextLevel(xp);

  const badgeColor = getBadgeColor(level.level);

  if (variant === 'compact') {
    return (
      <View
        style={[
          styles.badgeCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: badgeColor,
          },
        ]}
      >
        <Text style={[styles.badgeNumber, { fontSize: size * 0.4 }]}>
          {level.level}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.fullContainer}>
      <View
        style={[
          styles.badgeCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: badgeColor,
          },
        ]}
      >
        <Text style={[styles.badgeNumber, { fontSize: size * 0.4 }]}>
          {level.level}
        </Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: theme.text }]}>{level.title}</Text>
        <Text style={[styles.description, { color: theme.icon }]}>
          {level.description}
        </Text>
        {nextLevel && (
          <Text style={[styles.nextLevel, { color: theme.icon }]}>
            Siguiente: {nextLevel.title}
          </Text>
        )}
      </View>
    </View>
  );
}

/** Returns a color based on the level tier */
function getBadgeColor(level: number): string {
  if (level >= 40) return '#FF6B6B'; // Red - legendary
  if (level >= 30) return '#A855F7'; // Purple - epic
  if (level >= 20) return '#F59E0B'; // Amber - gold
  if (level >= 10) return '#3B82F6'; // Blue - advanced
  if (level >= 5) return '#10B981';  // Green - intermediate
  return '#6B7280';                   // Gray - beginner
}

const styles = StyleSheet.create({
  fullContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badgeCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeNumber: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
  },
  nextLevel: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
});
