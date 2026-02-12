import { useState, useRef, useCallback, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Haptics from 'expo-haptics';

export function useStopwatch() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  /** Timestamp when the stopwatch was last started/resumed */
  const startTimeRef = useRef<number | null>(null);
  /** Accumulated seconds from previous start/pause cycles */
  const accumulatedRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    startTimeRef.current = Date.now();
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - (startTimeRef.current || Date.now())) / 1000);
      setElapsedSeconds(accumulatedRef.current + elapsed);
    }, 200);
  }, []);

  const pause = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    clearTimer();

    // Save accumulated time
    if (startTimeRef.current) {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      accumulatedRef.current += elapsed;
    }
    startTimeRef.current = null;
    setIsRunning(false);
  }, [clearTimer]);

  const reset = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    clearTimer();
    setIsRunning(false);
    setElapsedSeconds(0);
    accumulatedRef.current = 0;
    startTimeRef.current = null;
  }, [clearTimer]);

  // Handle app background/foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isRunning && startTimeRef.current) {
        // Recalculate elapsed time after coming back from background
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedSeconds(accumulatedRef.current + elapsed);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [isRunning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);

  return {
    elapsedSeconds,
    elapsedMinutes,
    isRunning,
    start,
    pause,
    reset,
  };
}
