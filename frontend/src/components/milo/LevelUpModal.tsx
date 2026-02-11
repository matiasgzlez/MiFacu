import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Level } from '../../constants/levels';
import { useTheme } from '../../context/ThemeContext';

interface LevelUpModalProps {
  visible: boolean;
  level: Level | null;
  onClose: () => void;
}

function getBadgeColor(level: number): string {
  if (level >= 40) return '#FF6B6B';
  if (level >= 30) return '#A855F7';
  if (level >= 20) return '#F59E0B';
  if (level >= 10) return '#3B82F6';
  if (level >= 5) return '#10B981';
  return '#6B7280';
}

export function LevelUpModal({ visible, level, onClose }: LevelUpModalProps) {
  const { isDark } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(0.5)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && level) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      scaleAnim.setValue(0.5);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, level]);

  if (!level) return null;

  const badgeColor = getBadgeColor(level.level);
  const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const subtextColor = isDark ? '#8E8E93' : '#6B7280';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: cardBg,
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={[styles.congratsText, { color: badgeColor }]}>
            {'🎉 ¡Felicitaciones! 🎉'}
          </Text>

          <Text style={[styles.subtitle, { color: subtextColor }]}>
            Subiste de nivel
          </Text>

          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeNumber}>{level.level}</Text>
          </View>

          <Text style={[styles.title, { color: textColor }]}>
            {level.title}
          </Text>

          <Text style={[styles.description, { color: subtextColor }]}>
            {level.description}
          </Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: badgeColor }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>¡Genial!</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  congratsText: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 20,
  },
  badge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  badgeNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 14,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
