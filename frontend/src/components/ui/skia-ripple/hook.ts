import { useMemo, useCallback } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import {
    useSharedValue,
    useDerivedValue,
    withTiming,
    runOnJS,
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
    onPress,
}: UseRippleParams) {
    const touchX = useSharedValue(width / 2);
    const touchY = useSharedValue(height / 2);
    const time = useSharedValue(0);
    const isActive = useSharedValue(false);

    const startAnimation = useCallback(() => {
        'worklet';
        time.value = 0;
        time.value = withTiming(duration, { duration: duration * 1000 });
    }, [duration, time]);

    const tap = useMemo(
        () =>
            Gesture.Tap()
                .onStart((event) => {
                    touchX.value = event.x;
                    touchY.value = event.y;
                    isActive.value = true;
                    runOnJS(startAnimation)();
                })
                .onEnd(() => {
                    isActive.value = false;
                    if (onPress) {
                        runOnJS(onPress)();
                    }
                }),
        [touchX, touchY, isActive, startAnimation, onPress]
    );

    const uniforms = useDerivedValue(() => ({
        iResolution: [width, height],
        iTime: time.value,
        iTouch: [touchX.value, touchY.value],
        iAmplitude: amplitude,
        iFrequency: frequency,
        iDecay: decay,
        iSpeed: speed,
    }));

    return { uniforms, tap };
}
