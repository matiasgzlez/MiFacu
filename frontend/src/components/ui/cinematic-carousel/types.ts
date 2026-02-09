import type { StyleProp, ViewStyle } from 'react-native';

export interface CinematicCarouselProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemWidth: number;
  itemHeight: number;
  style?: StyleProp<ViewStyle>;
}

export interface CinematicCarouselItemProps {
  index: number;
  scrollX: import('react-native').Animated.Value;
  itemWidth: number;
  itemHeight: number;
  children: React.ReactNode;
}
