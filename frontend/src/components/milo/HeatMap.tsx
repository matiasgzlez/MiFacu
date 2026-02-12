import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { Colors, mifacuGold } from '../../constants/theme';
import { useColorScheme } from '../../context/ThemeContext';

const CELL_SIZE = 14;
const CELL_GAP = 3;
const CELL_STEP = CELL_SIZE + CELL_GAP;
const ROWS = 7;
const WEEKS_TO_SHOW = 13;
const DAY_LABELS = ['L', '', 'M', '', 'V', '', 'D'];

interface HeatMapProps {
  sessions: any[];
}

function toMondayIndex(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1;
}

function generateDateGrid(): { dates: (string | null)[][]; monthLabels: { week: number; label: string }[] } {
  const today = new Date();
  const todayDay = today.getDay();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() + (todayDay === 0 ? 0 : 7 - todayDay));
  sunday.setHours(0, 0, 0, 0);

  const gridStart = new Date(sunday);
  gridStart.setDate(sunday.getDate() - (WEEKS_TO_SHOW * 7 - 1));

  const dates: (string | null)[][] = [];
  const monthLabels: { week: number; label: string }[] = [];
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  let lastMonth = -1;

  for (let w = 0; w < WEEKS_TO_SHOW; w++) {
    const week: (string | null)[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + w * 7 + d);

      if (date > today) {
        week.push(null);
      } else {
        const iso = date.toISOString().split('T')[0];
        week.push(iso);

        const month = date.getMonth();
        if (month !== lastMonth && d === 0) {
          monthLabels.push({ week: w, label: monthNames[month] });
          lastMonth = month;
        }
      }
    }
    dates.push(week);
  }

  return { dates, monthLabels };
}

function getColor(minutes: number, isDark: boolean): string {
  if (minutes === 0) return isDark ? '#1C1C1E' : '#E2E8F0';
  if (minutes < 15) return isDark ? '#5C4A1E' : '#FDE68A';
  if (minutes < 30) return isDark ? '#8B6914' : '#FCD34D';
  if (minutes < 60) return isDark ? '#B48B40' : '#FBBF24';
  return isDark ? '#F5C842' : '#B48B40';
}

export function HeatMap({ sessions }: HeatMapProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  const dayMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const session of sessions) {
      const dateStr = session.created_at || session.createdAt;
      if (!dateStr) continue;

      const day = new Date(dateStr).toISOString().split('T')[0];
      const seconds = session.duracion_real_segundos ?? session.duracionRealSegundos ?? 0;
      map[day] = (map[day] || 0) + Math.round(seconds / 60);
    }
    return map;
  }, [sessions]);

  const { dates, monthLabels } = useMemo(() => generateDateGrid(), []);
  const totalDays = Object.keys(dayMap).length;

  const LABEL_WIDTH = 18;
  const MONTH_LABEL_HEIGHT = 16;
  const svgWidth = LABEL_WIDTH + WEEKS_TO_SHOW * CELL_STEP;
  const svgHeight = MONTH_LABEL_HEIGHT + ROWS * CELL_STEP;

  return (
    <View style={styles.container}>
      <View style={styles.summaryRow}>
        <Text style={[styles.summaryValue, { color: theme.text }]}>{totalDays}</Text>
        <Text style={[styles.summaryLabel, { color: theme.icon }]}>dias activos</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Svg width={svgWidth} height={svgHeight}>
          {dates.map((week, w) =>
            week.map((dateStr, d) => {
              if (!dateStr) return null;
              const minutes = dayMap[dateStr] || 0;
              const color = getColor(minutes, isDark);
              const x = LABEL_WIDTH + w * CELL_STEP;
              const y = MONTH_LABEL_HEIGHT + d * CELL_STEP;

              return (
                <Rect
                  key={dateStr}
                  x={x}
                  y={y}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  rx={3}
                  ry={3}
                  fill={color}
                />
              );
            }),
          )}
        </Svg>

        {monthLabels.map((ml, i) => (
          <Text
            key={`month-${i}`}
            style={[
              styles.monthLabel,
              {
                color: theme.icon,
                left: LABEL_WIDTH + ml.week * CELL_STEP,
              },
            ]}
          >
            {ml.label}
          </Text>
        ))}

        {DAY_LABELS.map((label, i) => {
          if (!label) return null;
          return (
            <Text
              key={`dl-${i}`}
              style={[
                styles.dayLabel,
                {
                  color: theme.icon,
                  top: MONTH_LABEL_HEIGHT + i * CELL_STEP + 1,
                },
              ]}
            >
              {label}
            </Text>
          );
        })}
      </ScrollView>

      <View style={styles.legend}>
        <Text style={[styles.legendText, { color: theme.icon }]}>Menos</Text>
        {[0, 10, 25, 45, 70].map((mins, i) => (
          <View
            key={i}
            style={[
              styles.legendCell,
              { backgroundColor: getColor(mins, isDark) },
            ]}
          />
        ))}
        <Text style={[styles.legendText, { color: theme.icon }]}>Mas</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 14,
  },
  scrollContent: {
    position: 'relative',
  },
  monthLabel: {
    position: 'absolute',
    top: 0,
    fontSize: 10,
    fontWeight: '600',
  },
  dayLabel: {
    position: 'absolute',
    left: 0,
    fontSize: 10,
    fontWeight: '500',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  legendCell: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 10,
  },
});
