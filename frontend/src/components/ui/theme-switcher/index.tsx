import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Dimensions, PixelRatio, StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';

// Detect Expo Go at runtime — skip Skia rendering (native module not available)
const isExpoGo = Constants.executionEnvironment === 'storeClient';

const skia = require('@shopify/react-native-skia');
const SkiaAvailable = !isExpoGo && !skia.__MOCK__;

const Canvas = skia.Canvas;
const Circle = skia.Circle;
const Group = skia.Group;
const SkiaImage = skia.Image;
const Mask = skia.Mask;
const Rect = skia.Rect;
const makeImageFromView = skia.makeImageFromView;

// Only load reanimated when Skia is available (avoids worklets version mismatch in Expo Go)
let useSharedValue: any;
let withTiming: any;
let Easing: any;
if (SkiaAvailable) {
    const reanimated = require('react-native-reanimated');
    useSharedValue = reanimated.useSharedValue;
    withTiming = reanimated.withTiming;
    Easing = reanimated.Easing;
}

export interface ThemeSwitcherRef {
  animate: (touchX?: number, touchY?: number) => Promise<void>;
}

interface ThemeSwitcherProps {
  onThemeChange: () => void;
  children: React.ReactNode;
  animationDuration?: number;
}

const SWITCH_DELAY = 80;

function getMaxRadius(x: number, y: number, w: number, h: number): number {
  const corners = [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: 0, y: h },
    { x: w, y: h },
  ];
  return Math.max(
    ...corners.map((c) => Math.sqrt((c.x - x) ** 2 + (c.y - y) ** 2)),
  );
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const ThemeSwitcher = forwardRef<ThemeSwitcherRef, ThemeSwitcherProps>(
  ({ onThemeChange, children, animationDuration = 600 }, ref) => {
    // Fallback for Expo Go — no Skia animation, just instant theme change
    if (!SkiaAvailable) {
      useImperativeHandle(ref, () => ({
        animate: async () => {
          onThemeChange();
        },
      }));

      return (
        <View style={styles.container}>
          {children}
        </View>
      );
    }

    const pd = PixelRatio.get();
    const viewRef = useRef<View>(null);
    const [overlay, setOverlay] = useState<any>(null);
    const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');

    const circleRadius = useSharedValue(0);
    const circleCenterX = useSharedValue(SCREEN_WIDTH / 2);
    const circleCenterY = useSharedValue(SCREEN_HEIGHT / 2);
    const [isAnimating, setIsAnimating] = useState(false);

    const animateThemeChange = async (touchX?: number, touchY?: number): Promise<void> => {
      if (isAnimating) return;
      setIsAnimating(true);

      const centerX = touchX ?? SCREEN_WIDTH / 2;
      const centerY = touchY ?? SCREEN_HEIGHT / 2;

      circleCenterX.value = centerX;
      circleCenterY.value = centerY;

      if (viewRef.current) {
        const snapshot = await makeImageFromView(viewRef);
        setOverlay(snapshot);
      }

      await wait(SWITCH_DELAY);

      onThemeChange();

      const maxRadius = getMaxRadius(centerX, centerY, SCREEN_WIDTH, SCREEN_HEIGHT);
      circleRadius.value = withTiming(maxRadius, {
        duration: animationDuration,
        easing: Easing.inOut(Easing.ease),
      });

      await wait(animationDuration);

      setOverlay(null);
      setIsAnimating(false);

      await wait(200);
      circleRadius.value = 0;
    };

    useImperativeHandle(ref, () => ({
      animate: animateThemeChange,
    }));

    return (
      <View style={styles.container} ref={viewRef} collapsable={false}>
        {children}

        {overlay && (
          <Canvas style={StyleSheet.absoluteFillObject} pointerEvents="none">
            <Mask
              mode="luminance"
              mask={
                <Group>
                  <Rect
                    height={SCREEN_HEIGHT}
                    width={SCREEN_WIDTH}
                    color="white"
                  />
                  <Circle
                    cx={circleCenterX}
                    cy={circleCenterY}
                    r={circleRadius}
                    color="black"
                  />
                </Group>
              }
            >
              <SkiaImage
                image={overlay}
                x={0}
                y={0}
                width={overlay.width() / pd}
                height={overlay.height() / pd}
              />
            </Mask>
          </Canvas>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
