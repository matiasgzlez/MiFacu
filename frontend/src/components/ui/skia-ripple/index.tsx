import React, { memo, useMemo, useCallback } from 'react';
import {
    Canvas,
    RoundedRect,
    Skia,
    Group,
    Paint,
    RuntimeShader,
    rect,
    rrect,
    Image as SkiaImage,
    useImage,
} from '@shopify/react-native-skia';
import type { SkPath } from '@shopify/react-native-skia';
import { StyleSheet, View, Pressable, GestureResponderEvent } from 'react-native';
import { RIPPLE_SHADER_SOURCE } from './conf';
import { useRipple } from './hook';
import type { IRippleSkiaEffect, IRippleImage, IRippleRect } from './types';

const RIPPLE_SHADER = Skia.RuntimeEffect.Make(RIPPLE_SHADER_SOURCE);

/**
 * SkiaRippleEffect - Generic wrapper for any Skia content
 */
export const SkiaRippleEffect = memo<IRippleSkiaEffect>(
    ({
        width,
        height,
        children,
        amplitude = 12,
        frequency = 15,
        decay = 8,
        speed = 1200,
        duration = 4,
        borderRadius = 0,
        style,
        onPress,
    }) => {
        const { uniforms, triggerRipple } = useRipple({
            amplitude,
            decay,
            duration,
            frequency,
            height,
            speed,
            width,
        });

        const handlePressIn = useCallback((e: GestureResponderEvent) => {
            triggerRipple(e.nativeEvent.locationX, e.nativeEvent.locationY);
        }, [triggerRipple]);

        const clipPath = useMemo<SkPath | null>(() => {
            if (borderRadius <= 0) return null;
            const path = Skia.Path.Make();
            path.addRRect(rrect(rect(0, 0, width, height), borderRadius, borderRadius));
            return path;
        }, [width, height, borderRadius]);

        if (!RIPPLE_SHADER) {
            return (
                <Pressable onPressIn={handlePressIn} onPress={onPress} style={[{ width, height }, style]}>
                    <Canvas style={{ width, height }}>{children}</Canvas>
                </Pressable>
            );
        }

        return (
            <Pressable
                onPressIn={handlePressIn}
                onPress={onPress}
                style={[{ width, height, borderRadius, overflow: 'hidden' }, style]}
            >
                <Canvas style={{ width, height }}>
                    <Group
                        clip={clipPath ?? undefined}
                        layer={
                            <Paint>
                                <RuntimeShader source={RIPPLE_SHADER} uniforms={uniforms} />
                            </Paint>
                        }
                    >
                        {children}
                    </Group>
                </Canvas>
            </Pressable>
        );
    }
);

/**
 * RippleImage - Image with ripple effect
 */
export const RippleImage = memo<IRippleImage>(
    ({
        width,
        height,
        source,
        amplitude = 12,
        frequency = 15,
        decay = 8,
        speed = 1200,
        duration = 4,
        borderRadius = 0,
        style,
        fit = 'cover',
        onPress,
    }) => {
        const image = useImage(typeof source === 'string' ? source : null);
        const { uniforms, triggerRipple } = useRipple({
            amplitude,
            decay,
            duration,
            frequency,
            height,
            speed,
            width,
        });

        const handlePressIn = useCallback((e: GestureResponderEvent) => {
            triggerRipple(e.nativeEvent.locationX, e.nativeEvent.locationY);
        }, [triggerRipple]);

        const clipPath = useMemo<SkPath | null>(() => {
            if (borderRadius <= 0) return null;
            const path = Skia.Path.Make();
            path.addRRect(rrect(rect(0, 0, width, height), borderRadius, borderRadius));
            return path;
        }, [width, height, borderRadius]);

        if (!RIPPLE_SHADER) {
            return (
                <Pressable
                    onPressIn={handlePressIn}
                    onPress={onPress}
                    style={[{ width, height, borderRadius, overflow: 'hidden' }, style]}
                >
                    <Canvas style={{ width, height }}>
                        {image && (
                            <SkiaImage image={image} x={0} y={0} width={width} height={height} fit={fit} />
                        )}
                    </Canvas>
                </Pressable>
            );
        }

        return (
            <Pressable
                onPressIn={handlePressIn}
                onPress={onPress}
                style={[{ width, height, borderRadius, overflow: 'hidden' }, style]}
            >
                <Canvas style={{ width, height }}>
                    <Group
                        clip={clipPath ?? undefined}
                        layer={
                            <Paint>
                                <RuntimeShader source={RIPPLE_SHADER} uniforms={uniforms} />
                            </Paint>
                        }
                    >
                        {image && (
                            <SkiaImage image={image} x={0} y={0} width={width} height={height} fit={fit} />
                        )}
                    </Group>
                </Canvas>
            </Pressable>
        );
    }
);

/**
 * RippleRect - Rectangle/Card with ripple effect and React Native children
 *
 * `style` is applied to the children overlay (for padding, alignment, etc.)
 * The outer container handles sizing, borderRadius, and overflow clipping.
 */
export const RippleRect = memo<IRippleRect>(
    ({
        width,
        height,
        color,
        amplitude = 12,
        frequency = 15,
        decay = 8,
        speed = 1200,
        duration = 4,
        borderRadius = 0,
        style,
        children,
        onPress,
    }) => {
        const { uniforms, triggerRipple } = useRipple({
            amplitude,
            decay,
            duration,
            frequency,
            height,
            speed,
            width,
        });

        const handlePressIn = useCallback((e: GestureResponderEvent) => {
            triggerRipple(e.nativeEvent.locationX, e.nativeEvent.locationY);
        }, [triggerRipple]);

        if (!RIPPLE_SHADER) {
            return (
                <Pressable
                    onPressIn={handlePressIn}
                    onPress={onPress}
                    style={{ width, height, borderRadius, overflow: 'hidden' }}
                >
                    <Canvas style={StyleSheet.absoluteFill}>
                        <RoundedRect x={0} y={0} width={width} height={height} r={borderRadius} color={color} />
                    </Canvas>
                    {children != null && (
                        <View style={[StyleSheet.absoluteFill, style]} pointerEvents="box-none">
                            {children}
                        </View>
                    )}
                </Pressable>
            );
        }

        return (
            <Pressable
                onPressIn={handlePressIn}
                onPress={onPress}
                style={{ width, height, borderRadius, overflow: 'hidden' }}
            >
                <Canvas style={StyleSheet.absoluteFill}>
                    <Group
                        layer={
                            <Paint>
                                <RuntimeShader source={RIPPLE_SHADER} uniforms={uniforms} />
                            </Paint>
                        }
                    >
                        <RoundedRect x={0} y={0} width={width} height={height} r={borderRadius} color={color} />
                    </Group>
                </Canvas>
                {children != null && (
                    <View style={[StyleSheet.absoluteFill, style]} pointerEvents="box-none">
                        {children}
                    </View>
                )}
            </Pressable>
        );
    }
);

export { SkiaRippleEffect as default };
