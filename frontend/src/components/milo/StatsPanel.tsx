import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GamificationProfile } from '../../hooks/useGamification';

// Duolingo-inspired colors
const COLORS = {
  green: '#58CC02',
  greenDark: '#46A302',
  yellow: '#FFC800',
  orange: '#FF9600',
  red: '#FF4B4B',
  blue: '#1CB0F6',
  white: '#FFFFFF',
  gray: '#AFAFAF',
  grayLight: '#E5E5E5',
  grayDark: '#4B4B4B',
};

interface StatsPanelProps {
  profile: GamificationProfile | null;
  loading: boolean;
  isDark: boolean;
  /** Tier accent color based on user level */
  tierColor?: string;
}

export default function StatsPanel({ profile, loading, isDark, tierColor }: StatsPanelProps) {
  const cardBg = isDark ? '#1A2C32' : COLORS.white;
  const textColor = isDark ? COLORS.white : COLORS.grayDark;
  const subtextColor = isDark ? COLORS.gray : '#777';
  const progressBg = isDark ? '#2A3A40' : COLORS.grayLight;

  const badgeColor = tierColor ?? COLORS.green;

  if (loading) {
    return (
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <ActivityIndicator color={badgeColor} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.emptyText, { color: subtextColor }]}>
          Inicia sesion para ver tus estadisticas
        </Text>
      </View>
    );
  }

  const progressWidth = `${Math.min(100, profile.xpProgressPercent)}%`;

  return (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      {/* Level & XP Row */}
      <View style={styles.levelRow}>
        <View style={[styles.levelBadge, { backgroundColor: badgeColor, shadowColor: badgeColor }]}>
          <Text style={styles.levelNumber}>{profile.nivel}</Text>
        </View>
        <View style={styles.xpContainer}>
          <Text style={[styles.xpLabel, { color: subtextColor }]}>
            Nivel {profile.nivel}
          </Text>
          <View style={[styles.progressBar, { backgroundColor: progressBg }]}>
            <View
              style={[
                styles.progressFill,
                { width: progressWidth as any, backgroundColor: badgeColor },
              ]}
            />
          </View>
          <Text style={[styles.xpText, { color: subtextColor }]}>
            {profile.xpCurrentLevel} / {profile.xpNeededForNext} XP
          </Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="flame" size={24} color={COLORS.orange} />
          <Text style={[styles.statValue, { color: textColor }]}>
            {profile.rachaActual}
          </Text>
          <Text style={[styles.statLabel, { color: subtextColor }]}>Racha</Text>
        </View>

        <View style={[styles.statDivider, { backgroundColor: progressBg }]} />

        <View style={styles.statItem}>
          <Ionicons name="star" size={24} color={COLORS.yellow} />
          <Text style={[styles.statValue, { color: textColor }]}>
            {profile.xpTotal}
          </Text>
          <Text style={[styles.statLabel, { color: subtextColor }]}>XP Total</Text>
        </View>

        <View style={[styles.statDivider, { backgroundColor: progressBg }]} />

        <View style={styles.statItem}>
          <Ionicons name="checkmark-circle" size={24} color={COLORS.green} />
          <Text style={[styles.statValue, { color: textColor }]}>
            {profile.sesionesTotales}
          </Text>
          <Text style={[styles.statLabel, { color: subtextColor }]}>Sesiones</Text>
        </View>

        <View style={[styles.statDivider, { backgroundColor: progressBg }]} />

        <View style={styles.statItem}>
          <Ionicons name="time" size={24} color={COLORS.blue} />
          <Text style={[styles.statValue, { color: textColor }]}>
            {profile.minutosTotales}
          </Text>
          <Text style={[styles.statLabel, { color: subtextColor }]}>Min</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  levelNumber: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
  },
  xpContainer: {
    flex: 1,
    gap: 4,
  },
  xpLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
  },
});
