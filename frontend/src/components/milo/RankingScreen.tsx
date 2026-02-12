import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, mifacuGold } from '../../constants/theme';
import { useColorScheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { RankingList, RankingEntry } from './RankingList';
import { pomodoroApi } from '../../services/api';

type RankingPeriod = 'weekly' | 'monthly';

function formatTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/** Returns Monday 00:00 of current week */
function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/** Returns 1st of current month at 00:00 */
function getMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
}

export function RankingScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [period, setPeriod] = useState<RankingPeriod>('weekly');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [userEntry, setUserEntry] = useState<RankingEntry | null>(null);
  const [myTime, setMyTime] = useState(0);
  const [myPosition, setMyPosition] = useState<number | null>(null);

  const accentColor = isDark ? '#F5C842' : mifacuGold;
  const cardColor = isDark ? '#1C1C1E' : '#FFFFFF';
  const tabBg = isDark ? '#1C1C1E' : '#F2F2F7';
  const tabActiveBg = isDark ? '#2C2C2E' : '#FFFFFF';

  const fetchRanking = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // For now, build ranking from user's own history
      // TODO: Replace with dedicated ranking endpoint when backend is ready
      const sessions = await pomodoroApi.getHistory(user.id);
      const list = Array.isArray(sessions) ? sessions : [];

      const periodStart = period === 'weekly' ? getWeekStart() : getMonthStart();

      // Filter sessions in current period
      let totalMinutes = 0;
      for (const session of list) {
        const dateStr = session.created_at || session.createdAt;
        if (!dateStr) continue;
        const sessionDate = new Date(dateStr);
        if (sessionDate < periodStart) continue;

        const seconds = session.duracion_real_segundos ?? session.duracionRealSegundos ?? 0;
        totalMinutes += Math.round(seconds / 60);
      }

      setMyTime(totalMinutes);

      // Mock ranking data until backend endpoint exists
      // The user sees their own real time among placeholder entries
      const mockEntries = generateMockRanking(user.id, totalMinutes);
      setEntries(mockEntries.top20);
      setUserEntry(mockEntries.userEntry);
      setMyPosition(mockEntries.userPosition);
    } catch (e) {
      console.error('Error loading ranking:', e);
    } finally {
      setLoading(false);
    }
  }, [user?.id, period]);

  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRanking();
    setRefreshing(false);
  }, [fetchRanking]);

  const periodLabel = period === 'weekly' ? 'esta semana' : 'este mes';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: insets.bottom + 100 },
      ]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Period Tabs */}
      <View style={[styles.tabs, { backgroundColor: tabBg }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            period === 'weekly' && [styles.tabActive, { backgroundColor: tabActiveBg }],
          ]}
          onPress={() => setPeriod('weekly')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              { color: period === 'weekly' ? theme.text : theme.icon },
              period === 'weekly' && styles.tabTextActive,
            ]}
          >
            Semanal
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            period === 'monthly' && [styles.tabActive, { backgroundColor: tabActiveBg }],
          ]}
          onPress={() => setPeriod('monthly')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              { color: period === 'monthly' ? theme.text : theme.icon },
              period === 'monthly' && styles.tabTextActive,
            ]}
          >
            Mensual
          </Text>
        </TouchableOpacity>
      </View>

      {/* My stats header */}
      <View style={[styles.card, { backgroundColor: cardColor }]}>
        <View style={styles.myStatsRow}>
          <View style={styles.myStat}>
            <Ionicons name="time-outline" size={20} color={accentColor} />
            <Text style={[styles.myStatValue, { color: theme.text }]}>
              {formatTime(myTime)}
            </Text>
            <Text style={[styles.myStatLabel, { color: theme.icon }]}>
              {periodLabel}
            </Text>
          </View>
          <View style={[styles.myStatDivider, { backgroundColor: theme.separator }]} />
          <View style={styles.myStat}>
            <Ionicons name="podium-outline" size={20} color={accentColor} />
            <Text style={[styles.myStatValue, { color: theme.text }]}>
              #{myPosition ?? '-'}
            </Text>
            <Text style={[styles.myStatLabel, { color: theme.icon }]}>
              mi posicion
            </Text>
          </View>
        </View>
      </View>

      {/* Ranking list */}
      {loading ? (
        <ActivityIndicator color={accentColor} style={styles.loader} />
      ) : (
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <View style={styles.listHeader}>
            <Ionicons name="trophy" size={18} color={accentColor} />
            <Text style={[styles.listTitle, { color: theme.text }]}>
              Top 20
            </Text>
          </View>
          <RankingList entries={entries} userEntry={userEntry} />
        </View>
      )}
    </ScrollView>
  );
}

/**
 * Generates mock ranking data.
 * Uses the user's real study time placed among fake entries.
 * TODO: Replace with real backend data.
 */
function generateMockRanking(
  userId: string,
  userMinutes: number,
): {
  top20: RankingEntry[];
  userEntry: RankingEntry | null;
  userPosition: number;
} {
  const mockNames = [
    'Matias', 'Juan', 'Lucia', 'Ana', 'Carlos',
    'Maria', 'Pedro', 'Sofia', 'Diego', 'Valentina',
    'Nicolas', 'Camila', 'Facundo', 'Martina', 'Tomas',
    'Florencia', 'Agustin', 'Rocio', 'Gonzalo', 'Julieta',
    'Santiago', 'Milagros', 'Franco', 'Abril',
  ];

  const avatars = ['🧑‍🎓', '👩‍🎓', '👨‍🎓', '🐱', '🐶', '🦊', '🐼', '🦁', '🐯', '🦉'];

  // Generate fake times (descending)
  const fakeTimes = Array.from({ length: 20 }, (_, i) => {
    const base = 600 - i * 25;
    const jitter = Math.floor(Math.random() * 20) - 10;
    return Math.max(5, base + jitter);
  }).sort((a, b) => b - a);

  // Find where the user would rank
  let userPosition = fakeTimes.findIndex((t) => userMinutes >= t);
  if (userPosition === -1) userPosition = fakeTimes.length;

  const allEntries: RankingEntry[] = [];
  let fakeIdx = 0;
  let inserted = false;

  for (let pos = 0; pos < 21 && (fakeIdx < fakeTimes.length || !inserted); pos++) {
    if (!inserted && (fakeIdx >= fakeTimes.length || userMinutes >= fakeTimes[fakeIdx])) {
      allEntries.push({
        position: pos + 1,
        name: 'Tu',
        avatar: '⭐',
        totalMinutes: userMinutes,
        isCurrentUser: true,
      });
      inserted = true;
    } else if (fakeIdx < fakeTimes.length) {
      allEntries.push({
        position: pos + 1,
        name: mockNames[fakeIdx % mockNames.length],
        avatar: avatars[fakeIdx % avatars.length],
        totalMinutes: fakeTimes[fakeIdx],
        isCurrentUser: false,
      });
      fakeIdx++;
    }
  }

  if (!inserted) {
    allEntries.push({
      position: allEntries.length + 1,
      name: 'Tu',
      avatar: '⭐',
      totalMinutes: userMinutes,
      isCurrentUser: true,
    });
  }

  // Re-number positions
  allEntries.forEach((e, i) => { e.position = i + 1; });

  const top20 = allEntries.slice(0, 20);
  const userInTop20 = top20.some((e) => e.isCurrentUser);
  const actualUserEntry = allEntries.find((e) => e.isCurrentUser) || null;
  const actualPosition = actualUserEntry?.position ?? allEntries.length + 1;

  return {
    top20,
    userEntry: userInTop20 ? null : actualUserEntry,
    userPosition: actualPosition,
  };
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  tabs: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    gap: 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  myStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  myStat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  myStatValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  myStatLabel: {
    fontSize: 12,
  },
  myStatDivider: {
    width: 1,
    height: 40,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  listTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  loader: {
    marginTop: 30,
  },
});
