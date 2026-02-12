import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, mifacuGold } from '../../constants/theme';
import { useColorScheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useGamification } from '../../hooks/useGamification';
import { LevelBadge } from './LevelBadge';
import { XPProgressBar } from './XPProgressBar';
import { WeeklyChart } from './WeeklyChart';
import { HeatMap } from './HeatMap';
import { SubjectDistribution } from './SubjectDistribution';
import { AvatarPicker, MILO_AVATAR_KEY } from './AvatarPicker';
import { LevelsList } from './LevelsList';
import SessionHistory from './SessionHistory';
import { pomodoroApi } from '../../services/api';

function formatStudyTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function StatsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const gamification = useGamification(user?.id);
  const [refreshing, setRefreshing] = useState(false);
  const [avatarPickerVisible, setAvatarPickerVisible] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const [levelsExpanded, setLevelsExpanded] = useState(false);

  // Load saved avatar on mount
  useEffect(() => {
    AsyncStorage.getItem(MILO_AVATAR_KEY).then((val) => {
      if (val) setSelectedAvatar(val);
    });
  }, []);

  // Single fetch for all session history
  const fetchSessions = useCallback(async () => {
    if (!user?.id) {
      setSessionsLoaded(true);
      return;
    }
    try {
      const data = await pomodoroApi.getHistory(user.id);
      setSessions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error fetching sessions:', e);
      setSessions([]);
    } finally {
      setSessionsLoaded(true);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([gamification.refresh(), fetchSessions()]);
    setRefreshing(false);
  }, [gamification, fetchSessions]);

  const profile = gamification.profile;
  const userName = (user?.user_metadata as any)?.full_name || 'Usuario';
  const avatarUrl = (user?.user_metadata as any)?.avatar_url;

  const cardColor = isDark ? '#1C1C1E' : '#FFFFFF';
  const accentColor = isDark ? '#F5C842' : mifacuGold;

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

      {/* Profile Card */}
      <View style={[styles.card, { backgroundColor: cardColor }]}>
        <View style={styles.profileRow}>
          {/* Avatar */}
          <TouchableOpacity
            onPress={() => setAvatarPickerVisible(true)}
            activeOpacity={0.7}
            style={styles.avatarContainer}
          >
            {selectedAvatar ? (
              <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? '#2C2C2E' : '#E2E8F0' }]}>
                <Text style={styles.avatarEmoji}>{selectedAvatar}</Text>
              </View>
            ) : avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? '#2C2C2E' : '#E2E8F0' }]}>
                <Ionicons name="person" size={28} color={theme.icon} />
              </View>
            )}
            <View style={[styles.editBadge, { backgroundColor: accentColor }]}>
              <Ionicons name="pencil" size={10} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {/* Name + Level */}
          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: theme.text }]}>{userName}</Text>
            {profile && (
              <LevelBadge xp={profile.xpTotal} variant="full" size={36} />
            )}
          </View>
        </View>

        {/* XP Progress */}
        {profile && (
          <View style={styles.xpSection}>
            <XPProgressBar xp={profile.xpTotal} />
          </View>
        )}
      </View>

      {/* Stats Cards */}
      {gamification.loading && !profile ? (
        <ActivityIndicator color={accentColor} style={styles.loader} />
      ) : profile ? (
        <View style={styles.statsGrid}>
          <StatCard icon="flame" iconColor="#FF9500" label="Racha actual" value={`${profile.rachaActual} dias`} isDark={isDark} theme={theme} />
          <StatCard icon="trophy" iconColor={accentColor} label="Racha maxima" value={`${profile.rachaMaxima} dias`} isDark={isDark} theme={theme} />
          <StatCard icon="time" iconColor="#0A84FF" label="Tiempo total" value={formatStudyTime(profile.minutosTotales)} isDark={isDark} theme={theme} />
          <StatCard icon="checkmark-circle" iconColor="#30D158" label="Sesiones" value={`${profile.sesionesTotales}`} isDark={isDark} theme={theme} />
          <StatCard icon="star" iconColor="#FFD60A" label="XP total" value={profile.xpTotal.toLocaleString()} isDark={isDark} theme={theme} />
          <StatCard icon="ribbon" iconColor="#BF5AF2" label="Nivel" value={`${profile.nivel}`} isDark={isDark} theme={theme} />
        </View>
      ) : (
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <Text style={[styles.emptyText, { color: theme.icon }]}>
            No se pudieron cargar las estadisticas
          </Text>
        </View>
      )}

      {/* Weekly Chart */}
      <View style={[styles.card, { backgroundColor: cardColor }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Esta semana</Text>
        <WeeklyChart sessions={sessions} />
      </View>

      {/* Heatmap */}
      <View style={[styles.card, { backgroundColor: cardColor }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Actividad</Text>
        <HeatMap sessions={sessions} />
      </View>

      {/* Subject Distribution */}
      <View style={[styles.card, { backgroundColor: cardColor }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Materias</Text>
        <SubjectDistribution sessions={sessions} />
      </View>

      {/* Niveles */}
      {profile && (
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <TouchableOpacity
            onPress={() => setLevelsExpanded(!levelsExpanded)}
            activeOpacity={0.7}
            style={styles.collapsibleHeader}
          >
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>Niveles</Text>
            <Ionicons
              name={levelsExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={theme.icon}
            />
          </TouchableOpacity>
          {levelsExpanded && <LevelsList xp={profile.xpTotal} />}
        </View>
      )}

      {/* Session History */}
      <SessionHistory
        userId={user?.id}
        isDark={isDark}
        refreshTrigger={0}
      />

      {/* Avatar Picker Modal */}
      <AvatarPicker
        visible={avatarPickerVisible}
        currentAvatar={selectedAvatar}
        onSelect={(avatar) => {
          setSelectedAvatar(avatar);
          setAvatarPickerVisible(false);
        }}
        onClose={() => setAvatarPickerVisible(false)}
      />
    </ScrollView>
  );
}

function StatCard({
  icon, iconColor, label, value, isDark, theme,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value: string;
  isDark: boolean;
  theme: typeof Colors.light;
}) {
  const cardColor = isDark ? '#1C1C1E' : '#FFFFFF';

  return (
    <View style={[styles.statCard, { backgroundColor: cardColor }]}>
      <View style={[styles.statIconCircle, { backgroundColor: iconColor + '1A' }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.icon }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
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
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 32,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    gap: 8,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
  },
  xpSection: {
    marginTop: 16,
  },
  loader: {
    marginTop: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '31%' as any,
    flexGrow: 1,
    flexBasis: '30%' as any,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
  },
});
