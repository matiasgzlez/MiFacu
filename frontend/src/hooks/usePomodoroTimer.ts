import { useState, useRef, useCallback, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';

export type PomodoroMode = 'focus' | 'short_break' | 'long_break';

const MODE_DURATIONS: Record<PomodoroMode, number> = {
  focus: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};

const MODE_LABELS: Record<PomodoroMode, string> = {
  focus: 'Enfoque',
  short_break: 'Descanso corto',
  long_break: 'Descanso largo',
};

export function usePomodoroTimer() {
  const [mode, setMode] = useState<PomodoroMode>('focus');
  const [timeRemaining, setTimeRemaining] = useState(MODE_DURATIONS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [sessionJustCompleted, setSessionJustCompleted] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const remainingWhenPausedRef = useRef<number>(MODE_DURATIONS.focus);

  const totalDuration = MODE_DURATIONS[mode];

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const scheduleNotification = useCallback(async (seconds: number) => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      if (seconds > 0) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: mode === 'focus' ? 'Sesion completada!' : 'Descanso terminado!',
            body: mode === 'focus'
              ? 'Ganaste XP. Hora de un descanso.'
              : 'Listo para enfocarte de nuevo?',
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: Math.max(1, Math.round(seconds)),
          },
        });
      }
    } catch (e) {
      // Notification scheduling can fail silently
    }
  }, [mode]);

  const onTimerComplete = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setSessionJustCompleted(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Auto-clear celebration flag after 3 seconds
    setTimeout(() => setSessionJustCompleted(false), 3000);

    if (mode === 'focus') {
      const newCount = sessionsCompleted + 1;
      setSessionsCompleted(newCount);
    }
  }, [clearTimer, mode, sessionsCompleted]);

  const start = useCallback(() => {
    if (timeRemaining <= 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    startTimeRef.current = Date.now();
    remainingWhenPausedRef.current = timeRemaining;

    setIsRunning(true);
    scheduleNotification(timeRemaining);

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - (startTimeRef.current || Date.now())) / 1000);
      const remaining = Math.max(0, remainingWhenPausedRef.current - elapsed);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        onTimerComplete();
      }
    }, 200);
  }, [timeRemaining, scheduleNotification, onTimerComplete]);

  const pause = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    clearTimer();
    setIsRunning(false);
    remainingWhenPausedRef.current = timeRemaining;
    Notifications.cancelAllScheduledNotificationsAsync();
  }, [clearTimer, timeRemaining]);

  const reset = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    clearTimer();
    setIsRunning(false);
    setTimeRemaining(MODE_DURATIONS[mode]);
    remainingWhenPausedRef.current = MODE_DURATIONS[mode];
    Notifications.cancelAllScheduledNotificationsAsync();
  }, [clearTimer, mode]);

  const switchMode = useCallback((newMode: PomodoroMode) => {
    clearTimer();
    setIsRunning(false);
    setMode(newMode);
    setTimeRemaining(MODE_DURATIONS[newMode]);
    remainingWhenPausedRef.current = MODE_DURATIONS[newMode];
    setSessionJustCompleted(false);
    Notifications.cancelAllScheduledNotificationsAsync();
  }, [clearTimer]);

  const goToNextMode = useCallback(() => {
    if (mode === 'focus') {
      const nextMode = (sessionsCompleted % 4 === 0 && sessionsCompleted > 0) ? 'long_break' : 'short_break';
      switchMode(nextMode);
    } else {
      switchMode('focus');
    }
  }, [mode, sessionsCompleted, switchMode]);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isRunning && startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const remaining = Math.max(0, remainingWhenPausedRef.current - elapsed);
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          onTimerComplete();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [isRunning, onTimerComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const progress = totalDuration > 0 ? (totalDuration - timeRemaining) / totalDuration : 0;

  return {
    mode,
    modeLabel: MODE_LABELS[mode],
    timeRemaining,
    isRunning,
    sessionsCompleted,
    sessionJustCompleted,
    progress,
    totalDuration,
    start,
    pause,
    reset,
    switchMode,
    goToNextMode,
    duracionMinutos: Math.round(totalDuration / 60),
    duracionRealSegundos: totalDuration - timeRemaining,
  };
}
