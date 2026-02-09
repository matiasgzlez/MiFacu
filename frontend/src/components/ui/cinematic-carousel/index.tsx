import React, { useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
  useAnimatedProps,
  type SharedValue,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import type { CinematicCarouselProps } from './types';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList as new () => FlatList<any>
);

const SCREEN_WIDTH = Dimensions.get('window').width;
const SPACING = 12;

function CarouselItem({
  index,
  scrollX,
  itemWidth,
  itemHeight,
  children,
}: {
  index: number;
  scrollX: SharedValue<number>;
  itemWidth: number;
  itemHeight: number;
  children: React.ReactNode;
}) {
  const inputRange = [
    (index - 1) * (itemWidth + SPACING),
    index * (itemWidth + SPACING),
    (index + 1) * (itemWidth + SPACING),
  ];

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.88, 1, 0.88],
      Extrapolation.CLAMP
    );

    const rotateY = interpolate(
      scrollX.value,
      inputRange,
      [8, 0, -8],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [10, 0, 10],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.7, 1, 0.7],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { perspective: 800 },
        { scale },
        { rotateY: `${rotateY}deg` },
        { translateY },
      ],
      opacity,
    };
  });

  const blurProps = useAnimatedProps(() => {
    const blurIntensity = interpolate(
      scrollX.value,
      inputRange,
      [25, 0, 25],
      Extrapolation.CLAMP
    );

    return {
      intensity: blurIntensity,
    };
  });

  return (
    <Animated.View
      style={[
        {
          width: itemWidth,
          height: itemHeight,
          marginRight: SPACING,
        },
        animatedStyle,
      ]}
    >
      {children}
      <AnimatedBlurView
        animatedProps={blurProps}
        tint="dark"
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
    </Animated.View>
  );
}

export function CinematicCarousel<T>({
  data,
  renderItem,
  itemWidth,
  itemHeight,
  style,
}: CinematicCarouselProps<T>) {
  const scrollX = useSharedValue(0);
  const sideInset = (SCREEN_WIDTH - itemWidth) / 2;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const renderCarouselItem = useCallback(
    ({ item, index }: { item: T; index: number }) => (
      <CarouselItem
        index={index}
        scrollX={scrollX}
        itemWidth={itemWidth}
        itemHeight={itemHeight}
      >
        {renderItem(item, index)}
      </CarouselItem>
    ),
    [renderItem, itemWidth, itemHeight, scrollX]
  );

  const keyExtractor = useCallback((_: T, index: number) => String(index), []);

  return (
    <View style={style}>
      <AnimatedFlatList
        data={data}
        renderItem={renderCarouselItem}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemWidth + SPACING}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingLeft: sideInset,
          paddingRight: sideInset,
        }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      />
    </View>
  );
}
