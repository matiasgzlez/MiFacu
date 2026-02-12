import { useState, useRef, useCallback, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export function usePomodoroTimer() {
  /** Duration selected by the user via the circular slider (in minutes) */
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  /** Timestamp when the timer was last started/resumed */
  const startTimeRef = useRef<number | null>(null);
  /** Seconds remaining at the moment of last start/resume */
  const remainingWhenStartedRef = useRef(25 * 60);

  const isRunning = status === 'running';

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
            title: 'Sesión completada!',
            body: 'Ganaste XP. Buen trabajo!',
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: Math.max(1, Math.round(seconds)),
          },
        });
      }
    } catch {
      // Notification scheduling can fail silently in Expo Go
    }
  }, []);

  const onTimerComplete = useCallback(() => {
    clearTimer();
    setStatus('completed');
    setTimeRemaining(0);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSessionsCompleted((prev) => prev + 1);
  }, [clearTimer]);

  /**
   * Set the focus duration (only when idle).
   * Called by the CircularSlider.
   */
  const setDuration = useCallback((minutes: number) => {
    setDurationMinutes(minutes);
    const seconds = minutes * 60;
    setTimeRemaining(seconds);
    remainingWhenStartedRef.current = seconds;
  }, []);

  const start = useCallback(() => {
    if (timeRemaining <= 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    startTimeRef.current = Date.now();
    remainingWhenStartedRef.current = timeRemaining;
    setStatus('running');
    scheduleNotification(timeRemaining);

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - (startTimeRef.current || Date.now())) / 1000);
      const remaining = Math.max(0, remainingWhenStartedRef.current - elapsed);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        onTimerComplete();
      }
    }, 200);
  }, [timeRemaining, scheduleNotification, onTimerComplete]);

  const pause = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    clearTimer();
    setStatus('paused');
    remainingWhenStartedRef.current = timeRemaining;
    startTimeRef.current = null;
    Notifications.cancelAllScheduledNotificationsAsync();
  }, [clearTimer, timeRemaining]);

  const reset = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    clearTimer();
    setStatus('idle');
    const seconds = durationMinutes * 60;
    setTimeRemaining(seconds);
    remainingWhenStartedRef.current = seconds;
    startTimeRef.current = null;
    Notifications.cancelAllScheduledNotificationsAsync();
  }, [clearTimer, durationMinutes]);

  const cancel = useCallback(() => {
    clearTimer();
    setStatus('idle');
    const seconds = durationMinutes * 60;
    setTimeRemaining(seconds);
    remainingWhenStartedRef.current = seconds;
    startTimeRef.current = null;
    Notifications.cancelAllScheduledNotificationsAsync();
  }, [clearTimer, durationMinutes]);

  // Handle app background/foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isRunning && startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const remaining = Math.max(0, remainingWhenStartedRef.current - elapsed);
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

  const totalDuration = durationMinutes * 60;
  const progress = totalDuration > 0 ? (totalDuration - timeRemaining) / totalDuration : 0;
  const elapsedSeconds = totalDuration - timeRemaining;

  return {
    durationMinutes,
    timeRemaining,
    status,
    isRunning,
    sessionsCompleted,
    progress,
    totalDuration,
    elapsedSeconds,
    setDuration,
    start,
    pause,
    reset,
    cancel,
  };
}
