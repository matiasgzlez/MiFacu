import React, { memo, useMemo, useCallback } from 'react';
import { StyleSheet, View, Pressable, GestureResponderEvent } from 'react-native';
import Constants from 'expo-constants';
import type { IRippleSkiaEffect, IRippleImage, IRippleRect } from './types';

// Detect Expo Go at runtime — skip Skia rendering (native module not available)
const isExpoGo = Constants.executionEnvironment === 'storeClient';

const skia = require('@shopify/react-native-skia');
const SkiaAvailable = !isExpoGo && !skia.__MOCK__;

const Canvas = skia.Canvas;
const RoundedRect = skia.RoundedRect;
const SkiaModule = skia.Skia;
const Group = skia.Group;
const Paint = skia.Paint;
const RuntimeShader = skia.RuntimeShader;
const rect = skia.rect;
const rrect = skia.rrect;
const SkiaImage = skia.Image;
const useImage = skia.useImage;

const RIPPLE_SHADER = SkiaAvailable
    ? SkiaModule.RuntimeEffect.Make(require('./conf').RIPPLE_SHADER_SOURCE)
    : null;

const useRippleFn = SkiaAvailable ? require('./hook').useRipple : null;

/**
 * SkiaRippleEffect - Generic wrapper for any Skia content
 * Falls back to a simple Pressable in Expo Go.
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
        if (!SkiaAvailable) {
            return (
                <Pressable onPress={onPress} style={[{ width, height, borderRadius, overflow: 'hidden' }, style]}>
                    {children}
                </Pressable>
            );
        }

        const { uniforms, triggerRipple } = useRippleFn!({
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

        const clipPath = useMemo(() => {
            if (borderRadius <= 0) return null;
            const path = SkiaModule.Path.Make();
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
 * Falls back to a simple Pressable in Expo Go.
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
        if (!SkiaAvailable) {
            return (
                <Pressable
                    onPress={onPress}
                    style={[{ width, height, borderRadius, overflow: 'hidden' }, style]}
                >
                    <View style={{ width, height, backgroundColor: '#ccc' }} />
                </Pressable>
            );
        }

        const image = useImage(typeof source === 'string' ? source : null);
        const { uniforms, triggerRipple } = useRippleFn!({
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

        const clipPath = useMemo(() => {
            if (borderRadius <= 0) return null;
            const path = SkiaModule.Path.Make();
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
 * Falls back to a simple View with backgroundColor in Expo Go.
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
        if (!SkiaAvailable) {
            return (
                <Pressable
                    onPress={onPress}
                    style={{ width, height, borderRadius, overflow: 'hidden', backgroundColor: color }}
                >
                    {children != null && (
                        <View style={[StyleSheet.absoluteFill, style]} pointerEvents="box-none">
                            {children}
                        </View>
                    )}
                </Pressable>
            );
        }

        const { uniforms, triggerRipple } = useRippleFn!({
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
