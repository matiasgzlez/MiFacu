import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { Colors, mifacuGold } from '../../constants/theme';
import { useColorScheme } from '../../context/ThemeContext';

const DAY_LABELS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

interface WeeklyChartProps {
  sessions: any[];
}

interface DayData {
  label: string;
  minutes: number;
  isToday: boolean;
}

function getCurrentWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { start: monday, end: sunday };
}

function toMondayIndex(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1;
}

export function WeeklyChart({ sessions }: WeeklyChartProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  const data = useMemo(() => {
    const { start, end } = getCurrentWeekRange();
    const todayIndex = toMondayIndex(new Date().getDay());

    const days: DayData[] = DAY_LABELS.map((label, i) => ({
      label,
      minutes: 0,
      isToday: i === todayIndex,
    }));

    for (const session of sessions) {
      const dateStr = session.created_at || session.createdAt;
      if (!dateStr) continue;

      const sessionDate = new Date(dateStr);
      if (sessionDate < start || sessionDate > end) continue;

      const dayIndex = toMondayIndex(sessionDate.getDay());
      const seconds = session.duracion_real_segundos ?? session.duracionRealSegundos ?? 0;
      days[dayIndex].minutes += Math.round(seconds / 60);
    }

    return days;
  }, [sessions]);

  const maxMinutes = useMemo(() => Math.max(1, ...data.map((d) => d.minutes)), [data]);
  const totalMinutes = useMemo(() => data.reduce((sum, d) => sum + d.minutes, 0), [data]);

  const accentColor = isDark ? '#F5C842' : mifacuGold;
  const barColor = isDark ? '#2C2C2E' : '#E2E8F0';
  const textColor = isDark ? '#8E8E93' : '#64748B';

  const CHART_WIDTH = 300;
  const CHART_HEIGHT = 140;
  const BAR_WIDTH = 28;
  const BAR_GAP = (CHART_WIDTH - BAR_WIDTH * 7) / 6;
  const LABEL_HEIGHT = 20;
  const VALUE_HEIGHT = 18;
  const BAR_AREA_HEIGHT = CHART_HEIGHT - LABEL_HEIGHT - VALUE_HEIGHT;

  return (
    <View style={styles.container}>
      <View style={styles.summaryRow}>
        <Text style={[styles.totalValue, { color: theme.text }]}>
          {formatTime(totalMinutes)}
        </Text>
        <Text style={[styles.totalLabel, { color: theme.icon }]}>esta semana</Text>
      </View>

      <View style={styles.chartContainer}>
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          {data.map((day, i) => {
            const x = i * (BAR_WIDTH + BAR_GAP);
            const barHeight = day.minutes > 0
              ? Math.max(4, (day.minutes / maxMinutes) * BAR_AREA_HEIGHT)
              : 4;
            const barY = VALUE_HEIGHT + BAR_AREA_HEIGHT - barHeight;
            const fill = day.isToday ? accentColor : barColor;

            return (
              <React.Fragment key={i}>
                {day.minutes > 0 && (
                  <SvgText
                    x={x + BAR_WIDTH / 2}
                    y={barY - 4}
                    fontSize={10}
                    fontWeight="600"
                    fill={day.isToday ? accentColor : textColor}
                    textAnchor="middle"
                  >
                    {day.minutes}m
                  </SvgText>
                )}

                <Rect
                  x={x}
                  y={barY}
                  width={BAR_WIDTH}
                  height={barHeight}
                  rx={6}
                  ry={6}
                  fill={fill}
                />

                <SvgText
                  x={x + BAR_WIDTH / 2}
                  y={CHART_HEIGHT - 2}
                  fontSize={11}
                  fontWeight={day.isToday ? '700' : '500'}
                  fill={day.isToday ? accentColor : textColor}
                  textAnchor="middle"
                >
                  {day.label}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>
    </View>
  );
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  totalLabel: {
    fontSize: 14,
  },
  chartContainer: {
    alignItems: 'center',
    paddingVertical: 4,
  },
});
