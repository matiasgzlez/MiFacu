import React, { memo, useMemo } from 'react';
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
import { StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { RIPPLE_SHADER_SOURCE } from './conf';
import { useRipple } from './hook';
import type { IRippleSkiaEffect, IRippleImage, IRippleRect } from './types';

const RIPPLE_SHADER = Skia.RuntimeEffect.Make(RIPPLE_SHADER_SOURCE);

/**
 * SkiaRippleEffect - Generic wrapper for any content
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
        const { uniforms, tap } = useRipple({
            amplitude,
            decay,
            duration,
            frequency,
            height,
            speed,
            width,
            onPress,
        });

        const clipPath = useMemo<SkPath | null>(() => {
            if (borderRadius <= 0) return null;
            const path = Skia.Path.Make();
            path.addRRect(rrect(rect(0, 0, width, height), borderRadius, borderRadius));
            return path;
        }, [width, height, borderRadius]);

        if (!RIPPLE_SHADER) {
            return (
                <GestureDetector gesture={tap}>
                    <View style={[{ width, height }, style]}>
                        <Canvas style={{ width, height }}>{children}</Canvas>
                    </View>
                </GestureDetector>
            );
        }

        return (
            <GestureDetector gesture={tap}>
                <View style={[{ width, height, borderRadius, overflow: 'hidden' }, style]}>
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
                </View>
            </GestureDetector>
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
        const { uniforms, tap } = useRipple({
            amplitude,
            decay,
            duration,
            frequency,
            height,
            speed,
            width,
            onPress,
        });

        const clipPath = useMemo<SkPath | null>(() => {
            if (borderRadius <= 0) return null;
            const path = Skia.Path.Make();
            path.addRRect(rrect(rect(0, 0, width, height), borderRadius, borderRadius));
            return path;
        }, [width, height, borderRadius]);

        if (!RIPPLE_SHADER) {
            return (
                <GestureDetector gesture={tap}>
                    <View style={[{ width, height, borderRadius, overflow: 'hidden' }, style]}>
                        <Canvas style={{ width, height }}>
                            {image && (
                                <SkiaImage image={image} x={0} y={0} width={width} height={height} fit={fit} />
                            )}
                        </Canvas>
                    </View>
                </GestureDetector>
            );
        }

        return (
            <GestureDetector gesture={tap}>
                <View style={[{ width, height, borderRadius, overflow: 'hidden' }, style]}>
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
                </View>
            </GestureDetector>
        );
    }
);

/**
 * RippleRect - Rectangle/Card with ripple effect and children
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
        const { uniforms, tap } = useRipple({
            amplitude,
            decay,
            duration,
            frequency,
            height,
            speed,
            width,
            onPress,
        });

        if (!RIPPLE_SHADER) {
            return (
                <GestureDetector gesture={tap}>
                    <View style={[{ width, height, borderRadius, overflow: 'hidden' }, style]}>
                        <Canvas style={{ width, height }}>
                            <RoundedRect x={0} y={0} width={width} height={height} r={borderRadius} color={color} />
                        </Canvas>
                        {children && (
                            <View style={[StyleSheet.absoluteFill, styles.container]}>{children}</View>
                        )}
                    </View>
                </GestureDetector>
            );
        }

        return (
            <GestureDetector gesture={tap}>
                <View style={[{ width, height, borderRadius, overflow: 'hidden' }, style]}>
                    <Canvas style={{ width, height }}>
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
                    {children && (
                        <View style={[StyleSheet.absoluteFill, styles.container]}>{children}</View>
                    )}
                </View>
            </GestureDetector>
        );
    }
);

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
    },
});

export { SkiaRippleEffect as default };
