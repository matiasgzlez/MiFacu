import React, { useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, PanResponder, GestureResponderEvent, PanResponderGestureState } from 'react-native';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../context/ThemeContext';

interface CircularSliderProps {
  /** Current value in minutes */
  value: number;
  /** Called when value changes */
  onChange: (minutes: number) => void;
  /** Minimum value in minutes (default 0) */
  min?: number;
  /** Maximum value in minutes (default 120) */
  max?: number;
  /** Step size in minutes (default 5) */
  step?: number;
  /** Diameter of the slider circle (default 280) */
  size?: number;
  /** Whether the slider is disabled (e.g. timer running) */
  disabled?: boolean;
  /** Called when user starts/stops dragging (used to disable parent scroll) */
  onGestureActive?: (active: boolean) => void;
  /** Tier accent color based on user level */
  tierColor?: string;
}

const STROKE_WIDTH = 12;
const KNOB_RADIUS = 16;

export function CircularSlider({
  value,
  onChange,
  min = 0,
  max = 120,
  step = 5,
  size = 280,
  disabled = false,
  onGestureActive,
  tierColor: tierColorProp,
}: CircularSliderProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const lastSnappedValue = useRef(value);
  const layoutRef = useRef({ x: 0, y: 0 });

  const radius = (size - STROKE_WIDTH - KNOB_RADIUS * 2) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Value to angle (0 = top, clockwise)
  const valueToAngle = useCallback(
    (val: number) => ((val - min) / (max - min)) * 360,
    [min, max],
  );

  // Angle to value (snapped to step)
  const angleToValue = useCallback(
    (angle: number) => {
      const raw = min + (angle / 360) * (max - min);
      return Math.round(raw / step) * step;
    },
    [min, max, step],
  );

  // Current angle and arc
  const angle = valueToAngle(value);
  const progress = (value - min) / (max - min);
  const dashOffset = circumference * (1 - progress);

  // Knob position
  const knobAngleRad = ((angle - 90) * Math.PI) / 180;
  const knobX = center + radius * Math.cos(knobAngleRad);
  const knobY = center + radius * Math.sin(knobAngleRad);

  // Convert touch coordinates to angle
  const touchToAngle = useCallback(
    (pageX: number, pageY: number) => {
      const dx = pageX - layoutRef.current.x - center;
      const dy = pageY - layoutRef.current.y - center;
      let angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      if (angleDeg < 0) angleDeg += 360;
      return angleDeg;
    },
    [center],
  );

  const handleMove = useCallback(
    (pageX: number, pageY: number) => {
      if (disabled) return;
      const angleDeg = touchToAngle(pageX, pageY);
      const snapped = Math.min(max, Math.max(min, angleToValue(angleDeg)));

      if (snapped !== lastSnappedValue.current) {
        lastSnappedValue.current = snapped;
        onChange(snapped);
        Haptics.selectionAsync();
      }
    },
    [disabled, touchToAngle, angleToValue, onChange, min, max],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: (e: GestureResponderEvent) => {
          onGestureActive?.(true);
          handleMove(e.nativeEvent.pageX, e.nativeEvent.pageY);
        },
        onPanResponderMove: (e: GestureResponderEvent) => {
          handleMove(e.nativeEvent.pageX, e.nativeEvent.pageY);
        },
        onPanResponderRelease: () => {
          onGestureActive?.(false);
        },
        onPanResponderTerminate: () => {
          onGestureActive?.(false);
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [disabled, handleMove, onGestureActive],
  );

  // Format time display
  const hours = Math.floor(value / 60);
  const mins = value % 60;
  const timeDisplay = hours > 0 ? `${hours}h ${mins.toString().padStart(2, '0')}m` : `${mins} min`;

  // Tick marks for the circle (every 5 minutes = every 15 degrees)
  const ticks = [];
  const totalTicks = (max - min) / step;
  for (let i = 0; i <= totalTicks; i++) {
    const tickAngle = (i / totalTicks) * 360 - 90;
    const tickRad = (tickAngle * Math.PI) / 180;
    const isMajor = (i * step) % 30 === 0;
    const innerR = radius - (isMajor ? 10 : 6);
    const outerR = radius + (isMajor ? 10 : 6);
    ticks.push({
      x1: center + innerR * Math.cos(tickRad),
      y1: center + innerR * Math.sin(tickRad),
      x2: center + outerR * Math.cos(tickRad),
      y2: center + outerR * Math.sin(tickRad),
      isMajor,
      minutes: i * step,
    });
  }

  // Generate arc path for the progress
  const describeArc = () => {
    if (progress <= 0) return '';
    if (progress >= 1) {
      // Full circle
      return [
        `M ${center} ${center - radius}`,
        `A ${radius} ${radius} 0 1 1 ${center - 0.001} ${center - radius}`,
      ].join(' ');
    }
    const startAngleRad = -Math.PI / 2;
    const endAngleRad = startAngleRad + progress * 2 * Math.PI;
    const startX = center + radius * Math.cos(startAngleRad);
    const startY = center + radius * Math.sin(startAngleRad);
    const endX = center + radius * Math.cos(endAngleRad);
    const endY = center + radius * Math.sin(endAngleRad);
    const largeArc = progress > 0.5 ? 1 : 0;
    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`;
  };

  const isDark = colorScheme === 'dark';
  const trackColor = isDark ? '#2A2A2E' : '#E2E8F0';
  const accentColor = tierColorProp ?? '#6B7280';
  const knobFill = accentColor;

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      onLayout={(e) => {
        e.target.measureInWindow((x, y) => {
          layoutRef.current = { x, y };
        });
      }}
      {...panResponder.panHandlers}
    >
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={accentColor} stopOpacity="1" />
            <Stop offset="1" stopColor={accentColor} stopOpacity="0.6" />
          </LinearGradient>
        </Defs>

        {/* Background track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />

        {/* Tick marks */}
        {ticks.map((tick, i) => (
          <Path
            key={i}
            d={`M ${tick.x1} ${tick.y1} L ${tick.x2} ${tick.y2}`}
            stroke={tick.isMajor ? (isDark ? '#555' : '#94A3B8') : (isDark ? '#333' : '#CBD5E1')}
            strokeWidth={tick.isMajor ? 2 : 1}
            strokeLinecap="round"
          />
        ))}

        {/* Progress arc */}
        {progress > 0 && (
          <Path
            d={describeArc()}
            stroke="url(#progressGrad)"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Knob */}
        {!disabled && (
          <Circle
            cx={knobX}
            cy={knobY}
            r={KNOB_RADIUS}
            fill={knobFill}
            stroke={isDark ? '#000' : '#FFF'}
            strokeWidth={3}
          />
        )}
      </Svg>

      {/* Center time display */}
      <View style={styles.centerContent} pointerEvents="none">
        <Text style={[styles.timeText, { color: theme.text }]}>{timeDisplay}</Text>
        <Text style={[styles.labelText, { color: theme.icon }]}>
          {value === 0 ? 'Deslizá para elegir' : 'minutos de estudio'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: -1,
  },
  labelText: {
    fontSize: 14,
    marginTop: 4,
  },
});
