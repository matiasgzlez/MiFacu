import { useCallback } from 'react';
import {
    useSharedValue,
    useDerivedValue,
    withTiming,
} from 'react-native-reanimated';
import type { UseRippleParams } from './types';

export function useRipple({
    width,
    height,
    amplitude,
    frequency,
    decay,
    speed,
    duration,
}: UseRippleParams) {
    const touchX = useSharedValue(width / 2);
    const touchY = useSharedValue(height / 2);
    const time = useSharedValue(0);

    const triggerRipple = useCallback((x: number, y: number) => {
        touchX.value = x;
        touchY.value = y;
        time.value = 0;
        time.value = withTiming(duration, { duration: duration * 1000 });
    }, [touchX, touchY, time, duration]);

    const uniforms = useDerivedValue(() => ({
        iResolution: [width, height],
        iTime: time.value,
        iTouch: [touchX.value, touchY.value],
        iAmplitude: amplitude,
        iFrequency: frequency,
        iDecay: decay,
        iSpeed: speed,
    }));

    return { uniforms, triggerRipple };
}
