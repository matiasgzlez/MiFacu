import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, mifacuGold } from '../../constants/theme';
import { useColorScheme } from '../../context/ThemeContext';
import { getLevelForXP, getNextLevel, getXPProgress } from '../../constants/levels';

interface XPProgressBarProps {
  xp: number;
  /** Show XP numbers below the bar (default true) */
  showNumbers?: boolean;
  /** Height of the progress bar (default 10) */
  height?: number;
}

export function XPProgressBar({ xp, showNumbers = true, height = 10 }: XPProgressBarProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  const level = getLevelForXP(xp);
  const nextLevel = getNextLevel(xp);
  const progress = getXPProgress(xp);

  const xpIntoLevel = xp - level.xpRequired;
  const xpNeeded = nextLevel ? nextLevel.xpRequired - level.xpRequired : 0;

  const trackColor = isDark ? '#2C2C2E' : '#E2E8F0';
  const fillColor = isDark ? '#F5C842' : mifacuGold;

  const isMaxLevel = !nextLevel;

  return (
    <View style={styles.container}>
      {/* Level labels */}
      <View style={styles.levelRow}>
        <Text style={[styles.levelLabel, { color: theme.icon }]}>
          Nivel {level.level}
        </Text>
        {nextLevel && (
          <Text style={[styles.levelLabel, { color: theme.icon }]}>
            Nivel {nextLevel.level}
          </Text>
        )}
      </View>

      {/* Progress bar */}
      <View style={[styles.track, { height, borderRadius: height / 2, backgroundColor: trackColor }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.min(100, progress * 100)}%` as any,
              height,
              borderRadius: height / 2,
              backgroundColor: fillColor,
            },
          ]}
        />
      </View>

      {/* XP numbers */}
      {showNumbers && (
        <View style={styles.numbersRow}>
          <View style={styles.xpInfo}>
            <Ionicons name="star" size={12} color={fillColor} />
            <Text style={[styles.xpText, { color: theme.text }]}>
              {xp.toLocaleString()} XP
            </Text>
          </View>
          {isMaxLevel ? (
            <Text style={[styles.maxText, { color: fillColor }]}>MAX</Text>
          ) : (
            <Text style={[styles.xpNeeded, { color: theme.icon }]}>
              {xpIntoLevel.toLocaleString()} / {xpNeeded.toLocaleString()}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  track: {
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  numbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  xpText: {
    fontSize: 13,
    fontWeight: '600',
  },
  xpNeeded: {
    fontSize: 12,
  },
  maxText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
