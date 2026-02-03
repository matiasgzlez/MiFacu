import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { pomodoroApi } from '../../services/api';

const COLORS = {
  green: '#58CC02',
  yellow: '#FFC800',
  blue: '#1CB0F6',
  purple: '#CE82FF',
  white: '#FFFFFF',
  gray: '#AFAFAF',
  grayLight: '#E5E5E5',
  grayDark: '#4B4B4B',
};

const TIPO_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  focus: { label: 'Enfoque', icon: 'book', color: COLORS.green },
  short_break: { label: 'Descanso', icon: 'cafe', color: COLORS.blue },
  long_break: { label: 'Descanso largo', icon: 'bed', color: COLORS.purple },
};

interface Session {
  id: number;
  tipo: string;
  duracion_minutos?: number;
  duracionMinutos?: number;
  duracion_real_segundos?: number;
  duracionRealSegundos?: number;
  completada: boolean;
  xp_ganado?: number;
  xpGanado?: number;
  created_at?: string;
  createdAt?: string;
  materia?: { nombre: string } | null;
}

interface SessionHistoryProps {
  userId?: string;
  isDark: boolean;
  refreshTrigger: number;
}

function groupByDay(sessions: Session[]): Record<string, Session[]> {
  const groups: Record<string, Session[]> = {};
  for (const session of sessions) {
    const dateStr = session.created_at || session.createdAt || '';
    const day = new Date(dateStr).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    });
    if (!groups[day]) groups[day] = [];
    groups[day].push(session);
  }
  return groups;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  if (mins < 1) return `${seconds}s`;
  return `${mins} min`;
}

export default function SessionHistory({ userId, isDark, refreshTrigger }: SessionHistoryProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetch = async () => {
      try {
        setLoading(true);
        const data = await pomodoroApi.getHistory(userId);
        setSessions(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Error fetching history:', e);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [userId, refreshTrigger]);

  const cardBg = isDark ? '#1A2C32' : COLORS.white;
  const textColor = isDark ? COLORS.white : COLORS.grayDark;
  const subtextColor = isDark ? COLORS.gray : '#777';
  const dividerColor = isDark ? '#2A3A40' : COLORS.grayLight;

  if (loading) {
    return (
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <ActivityIndicator color={COLORS.green} />
      </View>
    );
  }

  if (sessions.length === 0) {
    return (
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.title, { color: textColor }]}>Historial</Text>
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={40} color={subtextColor} />
          <Text style={[styles.emptyText, { color: subtextColor }]}>
            Completa tu primera sesion para ver el historial
          </Text>
        </View>
      </View>
    );
  }

  const grouped = groupByDay(sessions);

  return (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      <Text style={[styles.title, { color: textColor }]}>Historial</Text>

      {Object.entries(grouped).map(([day, daySessions], groupIndex) => (
        <View key={day}>
          <Text style={[styles.dayHeader, { color: subtextColor }]}>{day}</Text>
          {daySessions.map((session, index) => {
            const tipo = TIPO_CONFIG[session.tipo] || TIPO_CONFIG.focus;
            const realSeconds = session.duracion_real_segundos ?? session.duracionRealSegundos ?? 0;
            const xp = session.xp_ganado ?? session.xpGanado ?? 0;
            const materiaNombre = session.materia?.nombre;

            return (
              <View key={session.id}>
                <View style={styles.sessionRow}>
                  <View style={[styles.iconCircle, { backgroundColor: tipo.color + '20' }]}>
                    <Ionicons name={tipo.icon as any} size={18} color={tipo.color} />
                  </View>
                  <View style={styles.sessionInfo}>
                    <Text style={[styles.sessionType, { color: textColor }]}>
                      {tipo.label}
                      {materiaNombre ? ` - ${materiaNombre}` : ''}
                    </Text>
                    <Text style={[styles.sessionDetail, { color: subtextColor }]}>
                      {formatDuration(realSeconds)}
                      {session.completada ? ' (completada)' : ' (parcial)'}
                    </Text>
                  </View>
                  {xp > 0 && (
                    <View style={styles.xpBadge}>
                      <Text style={styles.xpBadgeText}>+{xp} XP</Text>
                    </View>
                  )}
                </View>
                {index < daySessions.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: dividerColor }]} />
                )}
              </View>
            );
          })}
          {groupIndex < Object.keys(grouped).length - 1 && (
            <View style={[styles.groupDivider, { backgroundColor: dividerColor }]} />
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  dayHeader: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
    marginBottom: 8,
    marginTop: 4,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionInfo: {
    flex: 1,
    gap: 2,
  },
  sessionType: {
    fontSize: 14,
    fontWeight: '600',
  },
  sessionDetail: {
    fontSize: 12,
  },
  xpBadge: {
    backgroundColor: '#FFC800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  xpBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B4B4B',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 48,
  },
  groupDivider: {
    height: 1,
    marginVertical: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
