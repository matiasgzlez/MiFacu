import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, mifacuGold } from '../../constants/theme';
import { useColorScheme } from '../../context/ThemeContext';

export interface RankingEntry {
  position: number;
  name: string;
  avatar?: string;
  totalMinutes: number;
  isCurrentUser?: boolean;
}

interface RankingListProps {
  entries: RankingEntry[];
  userEntry?: RankingEntry | null;
}

const MEDALS: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

function censorName(name: string): string {
  if (name.length <= 3) return name + '*****';
  return name.substring(0, 3) + '*****';
}

function formatTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function RankingList({ entries, userEntry }: RankingListProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  const accentColor = isDark ? '#F5C842' : mifacuGold;
  const cardColor = isDark ? '#1C1C1E' : '#FFFFFF';
  const highlightBg = isDark ? '#1A2A1A' : '#F0FDF4';

  const userInTop20 = entries.some((e) => e.isCurrentUser);

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        keyExtractor={(item) => `rank-${item.position}`}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <RankingRow
            entry={item}
            isDark={isDark}
            theme={theme}
            accentColor={accentColor}
            cardColor={cardColor}
            highlightBg={highlightBg}
          />
        )}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: theme.separator }]} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="trophy-outline" size={40} color={theme.icon} />
            <Text style={[styles.emptyText, { color: theme.icon }]}>
              Aun no hay datos de ranking
            </Text>
          </View>
        }
      />

      {/* User position if not in top 20 */}
      {!userInTop20 && userEntry && (
        <View style={styles.userOutside}>
          <View style={[styles.dotsRow]}>
            <Text style={[styles.dots, { color: theme.icon }]}>...</Text>
          </View>
          <View style={[styles.separator, { backgroundColor: theme.separator }]} />
          <RankingRow
            entry={userEntry}
            isDark={isDark}
            theme={theme}
            accentColor={accentColor}
            cardColor={cardColor}
            highlightBg={highlightBg}
          />
        </View>
      )}
    </View>
  );
}

function RankingRow({
  entry,
  isDark,
  theme,
  accentColor,
  cardColor,
  highlightBg,
}: {
  entry: RankingEntry;
  isDark: boolean;
  theme: typeof Colors.light;
  accentColor: string;
  cardColor: string;
  highlightBg: string;
}) {
  const medal = MEDALS[entry.position];
  const isTop3 = entry.position <= 3;

  return (
    <View
      style={[
        styles.row,
        entry.isCurrentUser && { backgroundColor: highlightBg },
      ]}
    >
      {/* Position */}
      <View style={styles.positionContainer}>
        {medal ? (
          <Text style={styles.medal}>{medal}</Text>
        ) : (
          <Text style={[styles.position, { color: theme.icon }]}>
            {entry.position}
          </Text>
        )}
      </View>

      {/* Avatar */}
      <View style={[styles.avatarCircle, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
        <Text style={styles.avatarText}>{entry.avatar || '🐱'}</Text>
      </View>

      {/* Name */}
      <View style={styles.nameContainer}>
        <Text
          style={[
            styles.name,
            { color: theme.text },
            isTop3 && { fontWeight: '700' },
            entry.isCurrentUser && { color: accentColor },
          ]}
          numberOfLines={1}
        >
          {censorName(entry.name)}
          {entry.isCurrentUser ? ' (tu)' : ''}
        </Text>
      </View>

      {/* Time */}
      <Text
        style={[
          styles.time,
          { color: isTop3 ? theme.text : theme.icon },
          isTop3 && { fontWeight: '700' },
        ]}
      >
        {formatTime(entry.totalMinutes)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 10,
    borderRadius: 8,
  },
  positionContainer: {
    width: 30,
    alignItems: 'center',
  },
  medal: {
    fontSize: 20,
  },
  position: {
    fontSize: 14,
    fontWeight: '600',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
  },
  time: {
    fontSize: 14,
    fontWeight: '500',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 44,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
  },
  userOutside: {
    marginTop: 4,
  },
  dotsRow: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  dots: {
    fontSize: 18,
    letterSpacing: 4,
  },
});
