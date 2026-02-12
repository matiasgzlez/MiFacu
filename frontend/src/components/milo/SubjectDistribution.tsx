import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors, mifacuGold } from '../../constants/theme';
import { useColorScheme } from '../../context/ThemeContext';

const CHART_SIZE = 180;
const STROKE_WIDTH = 28;
const RADIUS = (CHART_SIZE - STROKE_WIDTH) / 2;
const CENTER = CHART_SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const PALETTE = [
  '#F5C842', // gold
  '#3B82F6', // blue
  '#10B981', // green
  '#F97316', // orange
  '#8B5CF6', // purple
  '#EC4899', // pink
];

interface SubjectDistributionProps {
  sessions: any[];
}

interface SubjectEntry {
  name: string;
  minutes: number;
  color: string;
  percent: number;
}

export function SubjectDistribution({ sessions }: SubjectDistributionProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  const { entries, totalMinutes } = useMemo(() => {
    const map: Record<string, number> = {};
    let total = 0;

    for (const session of sessions) {
      const seconds = session.duracion_real_segundos ?? session.duracionRealSegundos ?? 0;
      const mins = Math.round(seconds / 60);
      if (mins <= 0) continue;

      const name = session.materia?.nombre || session.tag || 'Sin materia';
      map[name] = (map[name] || 0) + mins;
      total += mins;
    }

    const sorted = Object.entries(map)
      .map(([name, minutes]) => ({ name, minutes }))
      .sort((a, b) => b.minutes - a.minutes);

    let result: { name: string; minutes: number }[];
    if (sorted.length <= 6) {
      result = sorted;
    } else {
      const top5 = sorted.slice(0, 5);
      const otrasMinutes = sorted.slice(5).reduce((sum, e) => sum + e.minutes, 0);
      result = [...top5, { name: 'Otras', minutes: otrasMinutes }];
    }

    return {
      entries: result.map((e, i) => ({
        ...e,
        color: PALETTE[i % PALETTE.length],
        percent: total > 0 ? (e.minutes / total) * 100 : 0,
      })),
      totalMinutes: total,
    };
  }, [sessions]);

  const accentColor = isDark ? '#F5C842' : mifacuGold;
  const trackColor = isDark ? '#2C2C2E' : '#E2E8F0';

  if (entries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.icon }]}>
          Completa sesiones para ver la distribucion
        </Text>
      </View>
    );
  }

  const segments = buildDonutSegments(entries);

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Svg width={CHART_SIZE} height={CHART_SIZE}>
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke={trackColor}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />

          {segments.map((seg, i) => (
            <Circle
              key={i}
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              stroke={seg.color}
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeDasharray={`${seg.arcLength} ${CIRCUMFERENCE - seg.arcLength}`}
              strokeDashoffset={-seg.offset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${CENTER} ${CENTER})`}
            />
          ))}
        </Svg>

        <View style={styles.centerContent} pointerEvents="none">
          <Text style={[styles.centerValue, { color: theme.text }]}>
            {formatTime(totalMinutes)}
          </Text>
          <Text style={[styles.centerLabel, { color: theme.icon }]}>total</Text>
        </View>
      </View>

      <View style={styles.legend}>
        {entries.map((entry, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: entry.color }]} />
            <Text style={[styles.legendName, { color: theme.text }]} numberOfLines={1}>
              {entry.name}
            </Text>
            <Text style={[styles.legendPercent, { color: theme.icon }]}>
              {entry.percent.toFixed(0)}%
            </Text>
            <Text style={[styles.legendTime, { color: theme.icon }]}>
              {formatTime(entry.minutes)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function buildDonutSegments(entries: SubjectEntry[]): { color: string; arcLength: number; offset: number }[] {
  const segments: { color: string; arcLength: number; offset: number }[] = [];
  let currentOffset = 0;

  for (const entry of entries) {
    const fraction = entry.percent / 100;
    const arcLength = fraction * CIRCUMFERENCE;
    const gap = entries.length > 1 ? 2 : 0;
    segments.push({
      color: entry.color,
      arcLength: Math.max(0, arcLength - gap),
      offset: currentOffset,
    });
    currentOffset += arcLength;
  }

  return segments;
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: CHART_SIZE,
    height: CHART_SIZE,
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
  },
  centerValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  centerLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  legend: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  legendPercent: {
    fontSize: 13,
    fontWeight: '600',
    width: 36,
    textAlign: 'right',
  },
  legendTime: {
    fontSize: 12,
    width: 50,
    textAlign: 'right',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 13,
  },
});
