import { BlurView, type BlurViewProps } from 'expo-blur';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { easeGradient } from 'react-native-easing-gradient';
import { HEADER_HEIGHT, MAX_BLUR_INTENSITY, spacing } from './conf';
import type { AnimatedHeaderProps } from './types';

const AnimatedBlurView =
  Animated.createAnimatedComponent<BlurViewProps>(BlurView);

export const AnimatedHeaderScrollView = memo<AnimatedHeaderProps>(
  ({
    largeTitle,
    subtitle,
    children,
    leftComponent,
    rightComponent,
    showsVerticalScrollIndicator = false,
    contentContainerStyle,
    containerStyle,
    headerBackgroundGradient = {
      colors: ['rgba(0, 0, 0, 0.85)', 'rgba(0, 0, 0, 0.8)', 'transparent'],
      start: { x: 0.5, y: 0 },
      end: { x: 0.5, y: 1 },
    },
    headerBlurConfig = {
      intensity: 10,
      tint: Platform.OS === 'ios' ? 'systemThickMaterialDark' : 'dark',
    },
    smallTitleBlurIntensity = 90,
    smallTitleBlurTint = 'dark',
    maskGradientColors = {
      start: 'transparent',
      middle: 'rgba(0,0,0,0.99)',
      end: 'black',
    },
    largeTitleBlurIntensity = 20,
    largeHeaderTitleStyle: _largeTitleStyle = { fontSize: 40 },
    largeHeaderSubtitleStyle,
    smallHeaderSubtitleStyle: _smallHeaderSubtitleStylez,
    smallHeaderTitleStyle,
    largeTitleLabel,
    largeTitleLabelStyle,
    refreshControl,
  }) => {
    const scrollY = useSharedValue<number>(0);
    const insets = useSafeAreaInsets();

    const onScroll = useAnimatedScrollHandler({
      onScroll: (event) => {
        scrollY.value = event.contentOffset.y;
      },
    });

    const animatedLargeTitleStylez = useAnimatedStyle<
      Partial<Pick<TextStyle, 'fontSize'>>
    >(() => {
      const __largeTitleProps__: any = _largeTitleStyle || {};
      const fontSizeValue = __largeTitleProps__['fontSize'] || 40;

      const fontSize = interpolate(
        -scrollY.value,
        [0, 100],
        [fontSizeValue, fontSizeValue * 2],
        Extrapolation.CLAMP,
      );
      return { fontSize };
    });

    const largeTitleAnimStyle = useAnimatedStyle<
      Partial<Pick<TextStyle, 'opacity'>>
    >(() => {
      const opacity = interpolate(
        scrollY.value,
        [0, 60],
        [1, 0],
        Extrapolation.CLAMP,
      );
      return { opacity };
    });

    const smallHeaderStyle = useAnimatedStyle<
      Partial<Pick<TextStyle, 'opacity'>>
    >(() => {
      const opacity = withTiming<number>(
        interpolate(scrollY.value, [40, 80], [0, 1], Extrapolation.CLAMP),
        { duration: 600 },
      );
      const translateY = withTiming<number>(
        interpolate(scrollY.value, [40, 80], [20, 0], Extrapolation.CLAMP),
        { duration: 600 },
      );
      return {
        opacity,
        transform: [{ translateY }],
      };
    });

    const smallHeaderSubtitleStyle = useAnimatedStyle<
      Partial<Pick<TextStyle, 'opacity'>>
    >(() => {
      const shouldShow = scrollY.value > 100;
      return {
        opacity: withSpring<number>(shouldShow ? 0.5 : 0, {
          damping: 18,
          stiffness: 120,
          mass: 1.2,
        }),
        transform: [
          {
            translateY: withTiming<number>(shouldShow ? 0 : 10, {
              duration: 900,
            }),
          },
        ],
      };
    });

    const headerBackgroundStylez = useAnimatedStyle<
      Partial<Pick<ViewStyle, 'opacity'>>
    >(() => {
      const opacity = interpolate(
        scrollY.value,
        [0, 80],
        [0, 1],
        Extrapolation.CLAMP,
      );
      return { opacity };
    });

    const animatedHeaderBlur = useAnimatedProps(() => {
      const intensity = interpolate(
        scrollY.value,
        [0, 100],
        [0, MAX_BLUR_INTENSITY],
        Extrapolation.CLAMP,
      );
      return { intensity } as any;
    });

    const largeTitleBlur = useAnimatedProps(() => {
      const intensity = interpolate(
        scrollY.value,
        [0, 80],
        [largeTitleBlurIntensity, 0],
        Extrapolation.CLAMP,
      );
      return { intensity } as any;
    });

    const smallTitleBlur = useAnimatedProps<
      Partial<Pick<BlurViewProps, 'intensity'>>
    >(() => {
      const intensity = interpolate(
        scrollY.value,
        [0, 80, 100],
        [0, 15, 0],
        Extrapolation.CLAMP,
      );
      const _intensity =
        scrollY.value < 30
          ? withTiming<number>(0, { duration: 900 })
          : intensity;
      return { intensity: _intensity } as any;
    });

    const { colors: maskColors, locations: maskLocations } = easeGradient({
      colorStops: {
        0: { color: maskGradientColors.start },
        0.5: { color: maskGradientColors.middle },
        1: { color: maskGradientColors.end },
      },
      extraColorStopsPerTransition: 20,
    });

    return (
      <View style={[styles.container, containerStyle]}>
        {/* Animated background gradient that fades in on scroll */}
        <Animated.View
          style={[
            styles.headerBackgroundContainer,
            { height: HEADER_HEIGHT + insets.top + 50 },
            headerBackgroundStylez,
          ]}
        >
          {Platform.OS !== 'web' ? (
            <MaskedView
              maskElement={
                <LinearGradient
                  locations={maskLocations as any}
                  colors={maskColors as any}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0.5, y: 1 }}
                  end={{ x: 0.5, y: 0 }}
                />
              }
              style={StyleSheet.absoluteFill}
            >
              <LinearGradient
                colors={headerBackgroundGradient.colors as any}
                locations={headerBackgroundGradient.locations as any}
                start={headerBackgroundGradient.start}
                end={headerBackgroundGradient.end}
                style={StyleSheet.absoluteFill}
              />
              <BlurView
                intensity={headerBlurConfig.intensity}
                tint={headerBlurConfig.tint as any}
                style={StyleSheet.absoluteFill}
              />
            </MaskedView>
          ) : (
            <Animated.View
              style={[StyleSheet.absoluteFill, styles.webHeaderBackground]}
            />
          )}
        </Animated.View>

        {/* Persistent left/right components (always visible, e.g. back button) */}
        {(leftComponent || rightComponent) && (
          <View
            style={[
              styles.persistentControls,
              { paddingTop: insets.top, height: HEADER_HEIGHT + insets.top },
            ]}
          >
            <View style={styles.persistentControlsInner}>
              {leftComponent ? (
                <View style={styles.leftComponentContainer}>{leftComponent}</View>
              ) : (
                <View style={styles.leftComponentPlaceholder} />
              )}
              <View style={{ flex: 1 }} />
              {rightComponent ? (
                <View style={styles.rightComponentPersistent}>{rightComponent}</View>
              ) : (
                <View style={styles.leftComponentPlaceholder} />
              )}
            </View>
          </View>
        )}

        {/* Fixed small header that appears on scroll */}
        <Animated.View
          style={[
            styles.fixedHeader,
            {
              paddingTop: insets.top,
              height: HEADER_HEIGHT + insets.top,
            },
            smallHeaderStyle,
          ]}
        >
          <View style={styles.fixedHeaderContent}>
            {leftComponent && <View style={styles.leftComponentPlaceholder} />}
            <View style={styles.fixedHeaderTextContainer}>
              <Animated.Text
                style={[styles.smallHeaderTitle, smallHeaderTitleStyle]}
              >
                {largeTitle}
              </Animated.Text>
              {subtitle && (
                <Animated.Text
                  style={[
                    styles.smallHeaderSubtitle,
                    smallHeaderSubtitleStyle,
                    _smallHeaderSubtitleStylez,
                  ]}
                >
                  {subtitle}
                </Animated.Text>
              )}
            </View>

            <MaskedView
              maskElement={
                <LinearGradient
                  locations={maskLocations as any}
                  colors={maskColors as any}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0.5, y: 1 }}
                  end={{ x: 0.5, y: 0 }}
                />
              }
              style={StyleSheet.absoluteFill}
            >
              <LinearGradient
                colors={['transparent', 'transparent']}
                style={StyleSheet.absoluteFill}
              />
              <AnimatedBlurView
                animatedProps={smallTitleBlur}
                intensity={smallTitleBlurIntensity}
                tint={smallTitleBlurTint}
                style={[
                  styles.smallTitleBlurOverlay,
                  { height: HEADER_HEIGHT + insets.top + 20 },
                ]}
              />
            </MaskedView>

            {rightComponent && <View style={styles.leftComponentPlaceholder} />}
          </View>
        </Animated.View>

        {/* Scrollable content */}
        <Animated.ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          refreshControl={refreshControl}
          contentContainerStyle={[
            {
              paddingTop: insets.top + spacing.md,
              paddingBottom: insets.bottom + spacing.xl,
            },
            contentContainerStyle,
          ]}
        >
          {/* Large title area */}
          <Animated.View style={[styles.largeTitleContainer, largeTitleAnimStyle]}>
            <View style={styles.largeTitleTextContainer}>
              {largeTitleLabel && (
                <Text style={[styles.largeTitleLabel, largeTitleLabelStyle]}>
                  {largeTitleLabel}
                </Text>
              )}
              <Animated.Text
                style={[
                  styles.largeTitle,
                  _largeTitleStyle,
                  animatedLargeTitleStylez,
                ]}
              >
                {largeTitle}
              </Animated.Text>
              {subtitle && (
                <Text style={[styles.largeSubtitle, largeHeaderSubtitleStyle]}>
                  {subtitle}
                </Text>
              )}
            </View>
          </Animated.View>

          {/* Main content */}
          <View style={styles.content}>{children}</View>
        </Animated.ScrollView>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBackgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  webHeaderBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  smallTitleBlurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99,
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 11,
    justifyContent: 'flex-end',
  },
  fixedHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  fixedHeaderTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  smallHeaderTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  smallHeaderSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  persistentControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    justifyContent: 'flex-end',
  },
  persistentControlsInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  leftComponentContainer: {
    zIndex: 21,
  },
  leftComponentPlaceholder: {
    width: 40,
  },
  rightComponentPersistent: {
    zIndex: 21,
  },
  largeTitleContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  largeTitleTextContainer: {},
  largeTitleLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.5)',
  },
  largeTitle: {
    fontSize: 40,
    color: '#FFFFFF',
    letterSpacing: -0.5,
    paddingTop: 5,
  },
  largeSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.5)',
    marginTop: spacing.xs,
    paddingTop: 5,
  },
  content: {
    paddingHorizontal: spacing.md,
  },
});
