import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '../constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

/**
 * Componente base Skeleton con animación shimmer
 */
export const Skeleton = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style
}: SkeletonProps) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.separator,
          opacity,
        },
        style,
      ]}
    />
  );
};

/**
 * Skeleton para una tarea individual
 */
export const TaskSkeleton = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.taskSkeleton, { backgroundColor: theme.backgroundSecondary, borderColor: theme.separator }]}>
      {/* Checkbox */}
      <Skeleton width={24} height={24} borderRadius={12} style={{ marginRight: 15 }} />
      {/* Texto */}
      <View style={{ flex: 1 }}>
        <Skeleton width="80%" height={16} borderRadius={4} />
      </View>
    </View>
  );
};

/**
 * Skeleton para cards de acceso rápido (Finales/Parciales)
 */
export const CardSkeleton = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.cardSkeleton, { backgroundColor: theme.backgroundSecondary }]}>
      {/* Icono */}
      <Skeleton width={36} height={36} borderRadius={10} style={{ marginBottom: 12 }} />
      {/* Título */}
      <Skeleton width="70%" height={16} borderRadius={4} style={{ marginBottom: 6 }} />
      {/* Subtítulo */}
      <Skeleton width="50%" height={12} borderRadius={4} />
    </View>
  );
};

/**
 * Skeleton para la sección de próxima clase
 */
export const NextClassSkeleton = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.nextClassSkeleton, { backgroundColor: theme.separator + '40' }]}>
      {/* Badge */}
      <View style={styles.nextClassHeader}>
        <Skeleton width={100} height={22} borderRadius={10} />
      </View>
      {/* Materia */}
      <Skeleton width="75%" height={24} borderRadius={6} style={{ marginBottom: 15 }} />
      {/* Footer info */}
      <View style={styles.nextClassFooter}>
        <Skeleton width={80} height={14} borderRadius={4} />
        <Skeleton width={60} height={14} borderRadius={4} style={{ marginLeft: 16 }} />
      </View>
    </View>
  );
};

/**
 * Skeleton para filas de tabla (Herramientas)
 */
export const TableRowSkeleton = ({ isLast = false }: { isLast?: boolean }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={[
      styles.tableRowSkeleton,
      !isLast && { borderBottomColor: theme.separator, borderBottomWidth: StyleSheet.hairlineWidth }
    ]}>
      {/* Icono */}
      <Skeleton width={32} height={32} borderRadius={8} style={{ marginRight: 15 }} />
      {/* Texto */}
      <Skeleton width="60%" height={17} borderRadius={4} style={{ flex: 1 }} />
      {/* Chevron */}
      <Skeleton width={16} height={16} borderRadius={4} />
    </View>
  );
};

/**
 * Grupo de skeletons para la sección de tareas
 */
export const TasksSkeleton = ({ count = 3 }: { count?: number }) => {
  return (
    <View>
      {[...Array(count)].map((_, index) => (
        <View key={index} style={{ marginBottom: 10 }}>
          <TaskSkeleton />
        </View>
      ))}
    </View>
  );
};

/**
 * Skeleton completo para el Home
 */
export const HomeSkeleton = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={styles.homeSkeletonContainer}>
      {/* Próxima Clase Skeleton */}
      <View style={{ paddingHorizontal: 20, marginBottom: 25 }}>
        <NextClassSkeleton />
      </View>

      {/* Tareas Rápidas Section */}
      <View style={styles.section}>
        <Skeleton width={120} height={13} borderRadius={4} style={{ marginBottom: 12, marginLeft: 5 }} />
        <TasksSkeleton count={2} />
      </View>

      {/* Acceso Rápido Section */}
      <View style={styles.section}>
        <Skeleton width={100} height={13} borderRadius={4} style={{ marginBottom: 12, marginLeft: 5 }} />
        <View style={styles.cardsRow}>
          <CardSkeleton />
          <CardSkeleton />
        </View>
      </View>

      {/* Herramientas Section */}
      <View style={styles.section}>
        <Skeleton width={110} height={13} borderRadius={4} style={{ marginBottom: 12, marginLeft: 5 }} />
        <View style={[styles.tableContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.separator }]}>
          <TableRowSkeleton />
          <TableRowSkeleton />
          <TableRowSkeleton />
          <TableRowSkeleton isLast />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  taskSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardSkeleton: {
    flex: 1,
    marginHorizontal: 5,
    padding: 16,
    borderRadius: 18,
  },
  nextClassSkeleton: {
    padding: 20,
    borderRadius: 22,
  },
  nextClassHeader: {
    marginBottom: 12,
  },
  nextClassFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
    paddingTop: 12,
  },
  tableRowSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  homeSkeletonContainer: {
    flex: 1,
  },
  section: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tableContainer: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
});
