import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme, useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { useGamification } from '../../src/hooks/useGamification';
import { TimerScreen } from '../../src/components/milo/TimerScreen';
import { StatsScreen } from '../../src/components/milo/StatsScreen';
import { RankingScreen } from '../../src/components/milo/RankingScreen';
import StatsPanel from '../../src/components/milo/StatsPanel';
import SessionHistory from '../../src/components/milo/SessionHistory';
import { Colors, mifacuGold } from '../../src/constants/theme';
import { PremiumGate } from '../../src/components/premium';
import { LevelUpModal } from '../../src/components/milo/LevelUpModal';
import { Level, getLevelForXP } from '../../src/constants/levels';

type MiloTab = 'timer' | 'stats' | 'ranking';

const TABS: { key: MiloTab; label: string; icon: keyof typeof Ionicons.glyphMap; iconOutline: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'timer', label: 'Timer', icon: 'timer', iconOutline: 'timer-outline' },
  { key: 'stats', label: 'Stats', icon: 'stats-chart', iconOutline: 'stats-chart-outline' },
  { key: 'ranking', label: 'Ranking', icon: 'trophy', iconOutline: 'trophy-outline' },
];

function MiloContent() {
  const { isDark } = useTheme();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const gamification = useGamification(user?.id);
  const [activeTab, setActiveTab] = useState<MiloTab>('timer');
  const [refreshing, setRefreshing] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [levelUpInfo, setLevelUpInfo] = useState<Level | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await gamification.refresh();
    setRefreshing(false);
  }, [gamification]);

  const handleSessionComplete = useCallback(async () => {
    const prevLevel = gamification.profile?.nivel ?? 1;
    setSessionCount((prev) => prev + 1);
    const newProfile = await gamification.refresh();
    if (newProfile && newProfile.nivel > prevLevel) {
      setLevelUpInfo(getLevelForXP(newProfile.xpTotal));
    }
  }, [gamification]);

  const bgColor = isDark ? '#000000' : '#F8FAFC';
  const accentColor = isDark ? '#F5C842' : mifacuGold;
  const tabBarBg = isDark ? '#1C1C1E' : '#F2F2F7';
  const tabActiveBg = isDark ? '#2C2C2E' : '#FFFFFF';

  return (
    <View style={[styles.screen, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Top navigation bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Text style={[styles.header, { color: theme.text }]}>Milo</Text>
        <View style={[styles.segmentedControl, { backgroundColor: tabBarBg }]}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.segment,
                  isActive && [styles.segmentActive, { backgroundColor: tabActiveBg }],
                ]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isActive ? tab.icon : tab.iconOutline}
                  size={16}
                  color={isActive ? accentColor : theme.icon}
                />
                <Text
                  style={[
                    styles.segmentText,
                    { color: isActive ? theme.text : theme.icon },
                    isActive && styles.segmentTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Content */}
      {activeTab === 'timer' && (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          scrollEnabled={scrollEnabled}
        >
          <TimerScreen
            onSessionComplete={handleSessionComplete}
            onSliderGestureActive={(active) => setScrollEnabled(!active)}
          />

          <StatsPanel
            profile={gamification.profile}
            loading={gamification.loading}
            isDark={isDark}
          />

          <SessionHistory
            userId={user?.id}
            isDark={isDark}
            refreshTrigger={sessionCount}
          />
        </ScrollView>
      )}

      {activeTab === 'stats' && <StatsScreen />}

      {activeTab === 'ranking' && <RankingScreen />}

      <LevelUpModal
        visible={levelUpInfo !== null}
        level={levelUpInfo}
        onClose={() => setLevelUpInfo(null)}
      />
    </View>
  );
}

export default function MiloScreen() {
  return (
    <PremiumGate featureName="Milo - Tu Compañero de Estudio">
      <MiloContent />
    </PremiumGate>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 10,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    gap: 2,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 5,
  },
  segmentActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
  },
  segmentTextActive: {
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 24,
  },
});
