import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, mifacuGold } from '../../constants/theme';
import { useColorScheme } from '../../context/ThemeContext';
import { LEVELS, getLevelForXP } from '../../constants/levels';

interface LevelsListProps {
  xp: number;
}

function getBadgeColor(level: number): string {
  if (level >= 40) return '#FF6B6B';
  if (level >= 30) return '#A855F7';
  if (level >= 20) return '#F59E0B';
  if (level >= 10) return '#3B82F6';
  if (level >= 5) return '#10B981';
  return '#6B7280';
}

export function LevelsList({ xp }: LevelsListProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const isDark = colorScheme === 'dark';
  const currentLevel = getLevelForXP(xp);
  const accentColor = isDark ? '#F5C842' : mifacuGold;

  return (
    <View style={styles.container}>
      {LEVELS.map((level) => {
        const isUnlocked = xp >= level.xpRequired;
        const isCurrent = level.level === currentLevel.level;
        const xpRemaining = level.xpRequired - xp;
        const badgeColor = getBadgeColor(level.level);

        return (
          <View
            key={level.level}
            style={[
              styles.row,
              {
                backgroundColor: isDark ? '#2C2C2E' : '#F5F5F5',
                opacity: isUnlocked ? 1 : 0.5,
              },
              isCurrent && {
                borderWidth: 2,
                borderColor: accentColor,
                opacity: 1,
              },
            ]}
          >
            {/* Badge */}
            <View style={[styles.badge, { backgroundColor: isUnlocked ? badgeColor : '#9CA3AF' }]}>
              <Text style={styles.badgeText}>{level.level}</Text>
            </View>

            {/* Info */}
            <View style={styles.info}>
              <Text style={[styles.title, { color: isUnlocked ? theme.text : theme.icon }]}>
                {level.title}
              </Text>
              <Text style={[styles.description, { color: theme.icon }]} numberOfLines={1}>
                {level.description}
              </Text>
              <Text style={[styles.xpText, { color: theme.icon }]}>
                {isUnlocked
                  ? `${level.xpRequired.toLocaleString()} XP`
                  : `Faltan ${xpRemaining.toLocaleString()} XP`}
              </Text>
            </View>

            {/* Status icon */}
            {isUnlocked ? (
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={isCurrent ? accentColor : '#30D158'}
              />
            ) : (
              <Ionicons name="lock-closed" size={18} color="#9CA3AF" />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  description: {
    fontSize: 12,
  },
  xpText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
