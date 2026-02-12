import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, mifacuGold, mifacuNavy } from '../../constants/theme';
import { useColorScheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { usePomodoroTimer, TimerStatus } from '../../hooks/usePomodoroTimer';
import { useStopwatch } from '../../hooks/useStopwatch';
import { CircularSlider } from './CircularSlider';
import { SubjectSelector, SelectedSubject } from './SubjectSelector';
import { calculateSessionXP } from '../../constants/levels';
import { pomodoroApi, gamificationApi } from '../../services/api';

type TimerMode = 'focus' | 'stopwatch';

interface TimerScreenProps {
  onSessionComplete?: (data: {
    mode: TimerMode;
    durationMinutes: number;
    subject: SelectedSubject | null;
    xpEarned: number;
  }) => void;
  /** Called when user starts/stops dragging the circular slider */
  onSliderGestureActive?: (active: boolean) => void;
}

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function TimerScreen({ onSessionComplete, onSliderGestureActive }: TimerScreenProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const { user } = useAuth();
  const isDark = colorScheme === 'dark';

  const [mode, setMode] = useState<TimerMode>('focus');
  const [subject, setSubject] = useState<SelectedSubject | null>(null);

  // Focus mode timer
  const focusTimer = usePomodoroTimer();
  // Stopwatch mode timer
  const stopwatch = useStopwatch();

  const isFocusMode = mode === 'focus';
  const isActive = isFocusMode
    ? focusTimer.status === 'running' || focusTimer.status === 'paused'
    : stopwatch.isRunning;
  const isRunning = isFocusMode ? focusTimer.isRunning : stopwatch.isRunning;

  // Handle mode switch (only when idle)
  const switchMode = useCallback((newMode: TimerMode) => {
    if (isActive) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMode(newMode);
  }, [isActive]);

  // Register completed session with backend
  const registerSession = useCallback(async (durationMinutes: number) => {
    if (!user?.id || durationMinutes < 1) return;

    const xpEarned = calculateSessionXP(durationMinutes, false);

    try {
      await pomodoroApi.complete({
        userId: user.id,
        tipo: 'focus',
        duracionMinutos: durationMinutes,
        duracionRealSegundos: durationMinutes * 60,
        completada: true,
        xpGanado: xpEarned,
        materiaId: subject?.type === 'materia' ? subject.id : undefined,
      });

      await gamificationApi.completeSession({
        userId: user.id,
        duracionMinutos: durationMinutes,
        tipo: mode,
      });
    } catch (e) {
      console.error('Error registering session:', e);
    }

    onSessionComplete?.({
      mode,
      durationMinutes,
      subject,
      xpEarned,
    });
  }, [user?.id, mode, subject, onSessionComplete]);

  // Watch for focus timer completion
  useEffect(() => {
    if (focusTimer.status === 'completed') {
      const minutes = Math.ceil(focusTimer.totalDuration / 60);
      registerSession(minutes);
    }
  }, [focusTimer.status]);

  // Handle start
  const handleStart = useCallback(() => {
    if (isFocusMode) {
      if (focusTimer.status === 'paused') {
        focusTimer.start();
      } else {
        focusTimer.start();
      }
    } else {
      stopwatch.start();
    }
  }, [isFocusMode, focusTimer, stopwatch]);

  // Handle pause
  const handlePause = useCallback(() => {
    if (isFocusMode) {
      focusTimer.pause();
    } else {
      stopwatch.pause();
    }
  }, [isFocusMode, focusTimer, stopwatch]);

  // Handle reset
  const handleReset = useCallback(() => {
    if (isFocusMode) {
      focusTimer.reset();
    } else {
      stopwatch.reset();
    }
  }, [isFocusMode, focusTimer, stopwatch]);

  // Handle cancel (focus only - discard session)
  const handleCancel = useCallback(() => {
    if (isFocusMode) {
      focusTimer.cancel();
    }
  }, [isFocusMode, focusTimer]);

  // Handle stopwatch stop (complete session)
  const handleStopwatchComplete = useCallback(() => {
    const minutes = stopwatch.elapsedMinutes;
    stopwatch.reset();
    if (minutes >= 1) {
      registerSession(minutes);
    }
  }, [stopwatch, registerSession]);

  // Derived state
  const timeDisplay = isFocusMode
    ? formatTime(focusTimer.timeRemaining)
    : formatTime(stopwatch.elapsedSeconds);

  const canStart = isFocusMode
    ? focusTimer.status !== 'completed' && focusTimer.durationMinutes > 0
    : true;

  const showSlider = isFocusMode && focusTimer.status === 'idle';
  const showCountdown = isFocusMode && focusTimer.status !== 'idle';

  // Colors
  const accentColor = isDark ? '#F5C842' : mifacuGold;
  const bgColor = isDark ? '#000000' : '#F8FAFC';
  const cardColor = isDark ? '#1C1C1E' : '#FFFFFF';
  const tabBg = isDark ? '#1C1C1E' : '#F2F2F7';
  const tabActiveBg = isDark ? '#2C2C2E' : '#FFFFFF';

  return (
    <View style={styles.container}>
      {/* Mode Tabs */}
      <View style={[styles.modeTabs, { backgroundColor: tabBg }]}>
        <TouchableOpacity
          style={[
            styles.modeTab,
            mode === 'focus' && [styles.modeTabActive, { backgroundColor: tabActiveBg }],
          ]}
          onPress={() => switchMode('focus')}
          activeOpacity={0.7}
          disabled={isActive}
        >
          <Ionicons
            name="timer-outline"
            size={16}
            color={mode === 'focus' ? accentColor : theme.icon}
          />
          <Text
            style={[
              styles.modeTabText,
              { color: mode === 'focus' ? theme.text : theme.icon },
              mode === 'focus' && styles.modeTabTextActive,
            ]}
          >
            Focus
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modeTab,
            mode === 'stopwatch' && [styles.modeTabActive, { backgroundColor: tabActiveBg }],
          ]}
          onPress={() => switchMode('stopwatch')}
          activeOpacity={0.7}
          disabled={isActive}
        >
          <Ionicons
            name="stopwatch-outline"
            size={16}
            color={mode === 'stopwatch' ? accentColor : theme.icon}
          />
          <Text
            style={[
              styles.modeTabText,
              { color: mode === 'stopwatch' ? theme.text : theme.icon },
              mode === 'stopwatch' && styles.modeTabTextActive,
            ]}
          >
            Stopwatch
          </Text>
        </TouchableOpacity>
      </View>

      {/* Timer Display */}
      <View style={styles.timerArea}>
        {showSlider ? (
          /* Focus mode idle: show circular slider */
          <CircularSlider
            value={focusTimer.durationMinutes}
            onChange={focusTimer.setDuration}
            disabled={false}
            onGestureActive={onSliderGestureActive}
          />
        ) : isFocusMode ? (
          /* Focus mode running/paused/completed: show countdown ring */
          <View style={styles.countdownContainer}>
            <CircularSlider
              value={Math.ceil(focusTimer.timeRemaining / 60)}
              onChange={() => {}}
              max={focusTimer.durationMinutes}
              disabled={true}
            />
            <View style={styles.countdownOverlay} pointerEvents="none">
              <Text style={[styles.countdownTime, { color: theme.text }]}>
                {timeDisplay}
              </Text>
              <Text style={[styles.countdownLabel, { color: theme.icon }]}>
                {focusTimer.status === 'completed'
                  ? 'Sesion completada!'
                  : focusTimer.status === 'paused'
                    ? 'En pausa'
                    : 'Estudiando...'}
              </Text>
            </View>
          </View>
        ) : (
          /* Stopwatch mode: big time display */
          <View style={styles.stopwatchContainer}>
            <View style={[styles.stopwatchCircle, { borderColor: accentColor }]}>
              <Text style={[styles.stopwatchTime, { color: theme.text }]}>
                {timeDisplay}
              </Text>
              <Text style={[styles.stopwatchLabel, { color: theme.icon }]}>
                {stopwatch.isRunning ? 'Estudiando...' : stopwatch.elapsedSeconds > 0 ? 'En pausa' : 'Listo para estudiar'}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Subject Selector */}
      <View style={styles.subjectArea}>
        <SubjectSelector selected={subject} onSelect={setSubject} />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {isFocusMode ? (
          /* Focus mode controls */
          <>
            {focusTimer.status === 'idle' ? (
              /* Idle: just START */
              <TouchableOpacity
                style={[styles.startButton, { backgroundColor: accentColor }]}
                onPress={handleStart}
                activeOpacity={0.8}
                disabled={focusTimer.durationMinutes === 0}
              >
                <Ionicons name="play" size={28} color="#FFFFFF" />
                <Text style={styles.startButtonText}>Iniciar</Text>
              </TouchableOpacity>
            ) : focusTimer.status === 'completed' ? (
              /* Completed: RESET */
              <TouchableOpacity
                style={[styles.startButton, { backgroundColor: accentColor }]}
                onPress={handleReset}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={24} color="#FFFFFF" />
                <Text style={styles.startButtonText}>Nueva sesion</Text>
              </TouchableOpacity>
            ) : (
              /* Running/Paused: PAUSE/RESUME + RESET + CANCEL */
              <View style={styles.activeControls}>
                <TouchableOpacity
                  style={[styles.secondaryButton, { borderColor: theme.red }]}
                  onPress={handleCancel}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={22} color={theme.red} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.mainButton, { backgroundColor: accentColor }]}
                  onPress={isRunning ? handlePause : handleStart}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={isRunning ? 'pause' : 'play'}
                    size={32}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.secondaryButton, { borderColor: theme.icon }]}
                  onPress={handleReset}
                  activeOpacity={0.7}
                >
                  <Ionicons name="refresh" size={22} color={theme.icon} />
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          /* Stopwatch mode controls */
          <>
            {!stopwatch.isRunning && stopwatch.elapsedSeconds === 0 ? (
              /* Idle: just START */
              <TouchableOpacity
                style={[styles.startButton, { backgroundColor: accentColor }]}
                onPress={handleStart}
                activeOpacity={0.8}
              >
                <Ionicons name="play" size={28} color="#FFFFFF" />
                <Text style={styles.startButtonText}>Iniciar</Text>
              </TouchableOpacity>
            ) : (
              /* Running or paused */
              <View style={styles.activeControls}>
                <TouchableOpacity
                  style={[styles.secondaryButton, { borderColor: theme.icon }]}
                  onPress={handleReset}
                  activeOpacity={0.7}
                >
                  <Ionicons name="refresh" size={22} color={theme.icon} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.mainButton, { backgroundColor: accentColor }]}
                  onPress={stopwatch.isRunning ? handlePause : handleStart}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={stopwatch.isRunning ? 'pause' : 'play'}
                    size={32}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>

                {!stopwatch.isRunning && stopwatch.elapsedSeconds > 0 && (
                  <TouchableOpacity
                    style={[styles.completeButton, { backgroundColor: theme.green }]}
                    onPress={handleStopwatchComplete}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark" size={22} color="#FFFFFF" />
                  </TouchableOpacity>
                )}

                {stopwatch.isRunning && (
                  <TouchableOpacity
                    style={[styles.completeButton, { backgroundColor: theme.green }]}
                    onPress={() => {
                      handlePause();
                      // After pausing, the complete button will appear
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="stop" size={22} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        )}
      </View>

      {/* Sessions completed today */}
      {(focusTimer.sessionsCompleted > 0 || (isFocusMode && focusTimer.status === 'completed')) && (
        <View style={styles.sessionsInfo}>
          <Ionicons name="flame" size={16} color={accentColor} />
          <Text style={[styles.sessionsText, { color: theme.icon }]}>
            {focusTimer.sessionsCompleted} {focusTimer.sessionsCompleted === 1 ? 'sesion' : 'sesiones'} hoy
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 20,
  },
  modeTabs: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    gap: 2,
  },
  modeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  modeTabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  modeTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modeTabTextActive: {
    fontWeight: '600',
  },
  timerArea: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 280,
  },
  countdownContainer: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownTime: {
    fontSize: 42,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  countdownLabel: {
    fontSize: 13,
    marginTop: 4,
  },
  stopwatchContainer: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopwatchCircle: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopwatchTime: {
    fontSize: 42,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  stopwatchLabel: {
    fontSize: 13,
    marginTop: 4,
  },
  subjectArea: {
    width: '100%',
    paddingHorizontal: 4,
  },
  controls: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 72,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 28,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  activeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  mainButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  secondaryButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sessionsText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
