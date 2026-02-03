import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { PomodoroMode } from '../../hooks/usePomodoroTimer';

// Duolingo-inspired colors
const MILO_COLORS = {
  green: '#58CC02',
  greenDark: '#46A302',
  greenLight: '#D7FFB8',
  yellow: '#FFC800',
  orange: '#FF9600',
  red: '#FF4B4B',
  blue: '#1CB0F6',
  purple: '#CE82FF',
  white: '#FFFFFF',
  gray: '#AFAFAF',
  grayLight: '#E5E5E5',
  grayDark: '#4B4B4B',
  background: '#131F24',
  backgroundLight: '#F7F7F7',
  cardDark: '#1A2C32',
};

const MODE_COLORS: Record<PomodoroMode, string> = {
  focus: MILO_COLORS.green,
  short_break: MILO_COLORS.blue,
  long_break: MILO_COLORS.purple,
};

interface PomodoroTimerProps {
  timeRemaining: number;
  isRunning: boolean;
  progress: number;
  mode: PomodoroMode;
  modeLabel: string;
  sessionsCompleted: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSwitchMode: (mode: PomodoroMode) => void;
  isDark: boolean;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function PomodoroTimer({
  timeRemaining,
  isRunning,
  progress,
  mode,
  modeLabel,
  sessionsCompleted,
  onStart,
  onPause,
  onReset,
  onSwitchMode,
  isDark,
}: PomodoroTimerProps) {
  const activeColor = MODE_COLORS[mode];
  const size = 240;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const bgColor = isDark ? MILO_COLORS.background : MILO_COLORS.backgroundLight;
  const textColor = isDark ? MILO_COLORS.white : MILO_COLORS.grayDark;
  const subtextColor = isDark ? MILO_COLORS.gray : '#777';
  const cardBg = isDark ? MILO_COLORS.cardDark : MILO_COLORS.white;

  const modes: { key: PomodoroMode; label: string }[] = [
    { key: 'focus', label: 'Enfoque' },
    { key: 'short_break', label: 'Corto' },
    { key: 'long_break', label: 'Largo' },
  ];

  return (
    <View style={styles.container}>
      {/* Mode Selector */}
      <View style={[styles.modeSelector, { backgroundColor: cardBg }]}>
        {modes.map((m) => (
          <TouchableOpacity
            key={m.key}
            style={[
              styles.modeButton,
              mode === m.key && { backgroundColor: MODE_COLORS[m.key] },
            ]}
            onPress={() => onSwitchMode(m.key)}
          >
            <Text
              style={[
                styles.modeButtonText,
                { color: mode === m.key ? MILO_COLORS.white : subtextColor },
              ]}
            >
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Timer Circle */}
      <View style={styles.timerContainer}>
        <Svg width={size} height={size} style={styles.svg}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isDark ? '#2A3A40' : MILO_COLORS.grayLight}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={activeColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.timerTextContainer}>
          <Text style={[styles.timerText, { color: textColor }]}>
            {formatTime(timeRemaining)}
          </Text>
          <Text style={[styles.modeLabel, { color: activeColor }]}>
            {modeLabel}
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.resetButton, { borderColor: activeColor }]}
          onPress={onReset}
        >
          <Ionicons name="refresh" size={24} color={activeColor} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playButton, { backgroundColor: activeColor }]}
          onPress={isRunning ? onPause : onStart}
        >
          <Ionicons
            name={isRunning ? 'pause' : 'play'}
            size={36}
            color={MILO_COLORS.white}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.resetButton, { borderColor: activeColor }]}
          onPress={() => {
            // Skip to next mode
            if (mode === 'focus') {
              onSwitchMode(sessionsCompleted % 4 === 3 ? 'long_break' : 'short_break');
            } else {
              onSwitchMode('focus');
            }
          }}
        >
          <Ionicons name="play-skip-forward" size={24} color={activeColor} />
        </TouchableOpacity>
      </View>

      {/* Session counter */}
      <View style={styles.sessionCounter}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.sessionDot,
              {
                backgroundColor: i < (sessionsCompleted % 4)
                  ? MILO_COLORS.green
                  : isDark ? '#2A3A40' : MILO_COLORS.grayLight,
              },
            ]}
          />
        ))}
        <Text style={[styles.sessionText, { color: subtextColor }]}>
          {sessionsCompleted} sesiones
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 20,
  },
  modeSelector: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  modeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timerContainer: {
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  timerTextContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 52,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  modeLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  resetButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sessionText: {
    fontSize: 13,
    marginLeft: 4,
  },
});
