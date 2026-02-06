import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { usePremium } from '../../context/PremiumContext';
import { mifacuGold, mifacuNavy } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PaywallOverlayProps {
  featureName?: string;
  isDark?: boolean;
}

const FEATURE_DESCRIPTIONS: Record<string, string> = {
  'Simulador de Correlativas': 'Planifica tu carrera y simula diferentes caminos de cursada',
  'Reseñas de Cátedras': 'Accede a opiniones de otros estudiantes sobre profesores y cátedras',
  'Temas de Finales': 'Descubre qué temas se preguntan frecuentemente en los finales',
  'Calendario Académico': 'Visualiza tu calendario con parciales, finales y entregas',
  'Milo - Tu Compañero de Estudio': 'Tu mascota de estudio con pomodoro timer y gamificación',
};

export function PaywallOverlay({ featureName, isDark = false }: PaywallOverlayProps) {
  const router = useRouter();
  const { restorePurchases } = usePremium();
  const [restoring, setRestoring] = React.useState(false);

  const description = featureName
    ? FEATURE_DESCRIPTIONS[featureName] || 'Desbloquea esta función premium'
    : 'Desbloquea todas las funciones premium';

  const handleUnlock = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/subscription');
  };

  const handleRestore = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRestoring(true);
    const success = await restorePurchases();
    setRestoring(false);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  return (
    <View style={styles.container}>
      <BlurView
        intensity={isDark ? 40 : 60}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={[mifacuGold, '#FFB800']}
            style={styles.iconGradient}
          >
            <Ionicons name="star" size={40} color="#FFFFFF" />
          </LinearGradient>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : mifacuNavy }]}>
          Función Premium
        </Text>

        {/* Feature name */}
        {featureName && (
          <Text style={[styles.featureName, { color: mifacuGold }]}>
            {featureName}
          </Text>
        )}

        {/* Description */}
        <Text style={[styles.description, { color: isDark ? 'rgba(255,255,255,0.7)' : '#666666' }]}>
          {description}
        </Text>

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleUnlock}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[mifacuNavy, '#0F1D45']}
            style={styles.ctaGradient}
          >
            <Ionicons name="lock-open" size={20} color="#FFFFFF" />
            <Text style={styles.ctaText}>Desbloquear</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Restore Button */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={restoring}
          activeOpacity={0.7}
        >
          {restoring ? (
            <ActivityIndicator size="small" color={isDark ? 'rgba(255,255,255,0.6)' : '#666666'} />
          ) : (
            <Text style={[styles.restoreText, { color: isDark ? 'rgba(255,255,255,0.6)' : '#666666' }]}>
              Restaurar compras
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  content: {
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 340,
    alignItems: 'center',
    padding: 32,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  iconContainer: {
    marginBottom: 20,
    shadowColor: mifacuGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  featureName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  ctaButton: {
    width: '100%',
    marginBottom: 16,
    shadowColor: mifacuNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  restoreButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  restoreText: {
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
