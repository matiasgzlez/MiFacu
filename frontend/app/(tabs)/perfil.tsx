import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  TouchableOpacity,
  Pressable,
  Image,
  Switch,
  Alert,
  Dimensions,
  type GestureResponderEvent,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CarreraModal } from '../../src/components/home';
import { FeedbackModal } from '../../src/components/profile/FeedbackModal';
import { Colors, mifacuNavy, mifacuGold } from '../../src/constants/theme';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { DataRepository } from '../../src/services/dataRepository';
import { supabase } from '../../src/config/supabase';
import { usePremium } from '../../src/context/PremiumContext';
import { RippleRect } from '../../src/components/ui/skia-ripple';
import { AnimatedHeaderScrollView } from '../../src/components/ui/animated-header-scrollview';

interface Stats {
  aprobadas: number;
  regulares: number;
  cursando: number;
  totalPlan: number;
}

export default function PerfilScreen() {
  const router = useRouter();
  const { colorScheme, isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { isPro, __devSetPremium, __devOverrideActive, __mockMode } = usePremium();
  const theme = Colors[colorScheme];

  const [privacyMode, setPrivacyMode] = useState(false);
  const [showCarreraModal, setShowCarreraModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [carrera, setCarrera] = useState('No seleccionada');
  const [stats, setStats] = useState<Stats>({ aprobadas: 0, regulares: 0, cursando: 0, totalPlan: 0 });
  const [showDevToggle, setShowDevToggle] = useState(false);
  const devTapCount = useRef(0);
  const devTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const userId = user?.id;
      if (!userId) return;

      const savedPrivacy = await AsyncStorage.getItem('privacy_mode');
      if (savedPrivacy !== null) {
        setPrivacyMode(savedPrivacy === 'true');
      }

      const profile = await DataRepository.getUserProfile(userId);
      setCarrera(profile.carrera?.nombre || 'No seleccionada');

      const materias = await DataRepository.getMisMaterias(userId);
      const aprobadas = materias.filter((m: any) => m.estado === 'aprobado').length;
      const regulares = materias.filter((m: any) => m.estado === 'regular').length;
      const cursando = materias.filter((m: any) => m.estado === 'cursado').length;

      const allMaterias = await DataRepository.getMateriasDisponibles(userId);
      const totalPlan = materias.length + allMaterias.length;

      setStats({ aprobadas, regulares, cursando, totalPlan });
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const handleToggleDarkMode = useCallback(async (e: GestureResponderEvent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { pageX, pageY } = e.nativeEvent;
    await toggleTheme({ touchX: pageX, touchY: pageY });
  }, [toggleTheme]);

  const handlePrivacyChange = useCallback(async (val: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await AsyncStorage.setItem('privacy_mode', String(val));
    setPrivacyMode(val);
  }, []);

  const handleLogout = useCallback(() => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  }, [signOut]);

  const handleSelectCarrera = useCallback(async (carreraId: string, carreraNombre: string) => {
    try {
      const userId = user?.id;
      if (!userId) return;

      await DataRepository.updateCareer(userId, carreraId);

      await supabase.auth.updateUser({
        data: {
          carrera: carreraNombre,
          carreraId: carreraId
        }
      });

      setShowCarreraModal(false);
      loadData();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error updating carrera:', error);
      Alert.alert('Error', 'No se pudo actualizar la carrera');
    }
  }, [user, loadData]);

  const handleVersionTap = useCallback(() => {
    devTapCount.current += 1;
    if (devTapTimer.current) clearTimeout(devTapTimer.current);
    devTapTimer.current = setTimeout(() => { devTapCount.current = 0; }, 2000);

    if (devTapCount.current >= 7) {
      devTapCount.current = 0;
      setShowDevToggle((prev) => !prev);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  const progreso = stats.totalPlan > 0 ? Math.round((stats.aprobadas / stats.totalPlan) * 100) : 0;

  // Theme-aware gradient/blur config
  const headerGradient = isDark
    ? {
        colors: ['rgba(0, 0, 0, 0.9)', 'rgba(0, 0, 0, 0.8)', 'transparent'] as const,
        start: { x: 0.5, y: 0 } as const,
        end: { x: 0.5, y: 1 } as const,
      }
    : {
        colors: ['rgba(30, 58, 138, 0.95)', 'rgba(30, 58, 138, 0.85)', 'transparent'] as const,
        start: { x: 0.5, y: 0 } as const,
        end: { x: 0.5, y: 1 } as const,
      };

  const headerBlur = isDark
    ? { intensity: 10, tint: Platform.OS === 'ios' ? 'systemThickMaterialDark' as const : 'dark' as const }
    : { intensity: 15, tint: Platform.OS === 'ios' ? 'systemThickMaterialLight' as const : 'light' as const };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'light-content'} />

      <AnimatedHeaderScrollView
        largeTitle="Perfil"
        largeTitleLabel="MI CUENTA"
        subtitle={user?.email || undefined}
        containerStyle={{ backgroundColor: theme.background }}
        contentContainerStyle={styles.scrollContent}
        headerBackgroundGradient={headerGradient}
        headerBlurConfig={headerBlur}
        smallTitleBlurTint={isDark ? 'dark' : 'light'}
        largeHeaderTitleStyle={[styles.headerLargeTitle, { color: theme.text }]}
        largeHeaderSubtitleStyle={{ color: theme.icon, fontSize: 14, fontWeight: '500' }}
        largeTitleLabelStyle={{ color: theme.icon }}
        smallHeaderTitleStyle={[styles.headerInlineTitle, { color: theme.text }]}
      >
        {/* PROFILE CARD */}
        <View style={styles.section}>
          <RippleRect
            width={Dimensions.get('window').width - 64}
            height={200}
            borderRadius={20}
            color={theme.backgroundSecondary}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            style={styles.profileCardContent}
          >
            <View style={[styles.avatarRing, { borderColor: theme.tint }]}>
              <Image
                source={{ uri: user?.user_metadata?.avatar_url || 'https://i.pravatar.cc/100?img=33' }}
                style={styles.avatar}
              />
            </View>
            <Text style={[styles.profileName, { color: theme.text }]}>
              {user?.user_metadata?.full_name || 'Usuario miFACU'}
            </Text>
            <Text style={[styles.profileEmail, { color: theme.icon }]}>
              {user?.email || 'Sincronizado'}
            </Text>
          </RippleRect>
        </View>

        {/* STATS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.icon }]}>ESTADÍSTICAS</Text>
          <View style={[styles.statsCard, { backgroundColor: theme.backgroundSecondary }]}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.tint }]}>
                  {privacyMode ? '•••' : `${progreso}%`}
                </Text>
                <Text style={[styles.statLabel, { color: theme.icon }]}>Progreso</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.separator }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.green }]}>
                  {privacyMode ? '•••' : stats.aprobadas}
                </Text>
                <Text style={[styles.statLabel, { color: theme.icon }]}>Aprobadas</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.separator }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.orange }]}>
                  {privacyMode ? '•••' : stats.regulares}
                </Text>
                <Text style={[styles.statLabel, { color: theme.icon }]}>Regulares</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.separator }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.blue }]}>
                  {privacyMode ? '•••' : stats.cursando}
                </Text>
                <Text style={[styles.statLabel, { color: theme.icon }]}>Cursando</Text>
              </View>
            </View>
          </View>
        </View>

        {/* PREFERENCES */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.icon }]}>PREFERENCIAS</Text>
          <View style={[styles.optionsContainer, { backgroundColor: theme.backgroundSecondary }]}>
            {/* Dark Mode */}
            <Pressable
              style={[styles.optionRow, { borderBottomColor: theme.separator }]}
              onPress={handleToggleDarkMode}
            >
              <View style={[styles.optionIcon, { backgroundColor: isDark ? theme.blue : theme.orange }]}>
                <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color="white" />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionLabel, { color: theme.text }]}>Modo Oscuro</Text>
                <Text style={[styles.optionHint, { color: theme.icon }]}>
                  {isDark ? 'Activado' : 'Desactivado'}
                </Text>
              </View>
              <View
                style={[
                  styles.themeToggle,
                  { backgroundColor: isDark ? theme.tint + '60' : theme.separator },
                ]}
              >
                <View
                  style={[
                    styles.themeToggleThumb,
                    {
                      backgroundColor: isDark ? theme.tint : '#f4f3f4',
                      transform: [{ translateX: isDark ? 20 : 0 }],
                    },
                  ]}
                />
              </View>
            </Pressable>

            {/* Privacy Mode */}
            <View style={styles.optionRow}>
              <View style={[styles.optionIcon, { backgroundColor: theme.slate }]}>
                <Ionicons name={privacyMode ? 'eye-off' : 'eye'} size={18} color="white" />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionLabel, { color: theme.text }]}>Modo Privado</Text>
                <Text style={[styles.optionHint, { color: theme.icon }]}>Oculta tu progreso</Text>
              </View>
              <Switch
                value={privacyMode}
                onValueChange={handlePrivacyChange}
                trackColor={{ false: theme.separator, true: theme.tint + '60' }}
                thumbColor={privacyMode ? theme.tint : '#f4f3f4'}
                ios_backgroundColor={theme.separator}
              />
            </View>
          </View>
        </View>

        {/* ACCOUNT */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.icon }]}>CUENTA</Text>
          <View style={[styles.optionsContainer, { backgroundColor: theme.backgroundSecondary }]}>
            {/* Premium Button/Badge */}
            {isPro ? (
              <View style={[styles.optionRow, { borderBottomColor: theme.separator }]}>
                <View style={[styles.optionIcon, { backgroundColor: mifacuGold }]}>
                  <Ionicons name="checkmark-circle" size={18} color="white" />
                </View>
                <View style={styles.optionContent}>
                  <View style={styles.premiumBadgeRow}>
                    <Text style={[styles.optionLabel, { color: theme.text }]}>MiFacu Premium</Text>
                    <View style={[styles.premiumBadge, { backgroundColor: mifacuGold + '20' }]}>
                      <Text style={[styles.premiumBadgeText, { color: mifacuGold }]}>Activo</Text>
                    </View>
                  </View>
                  <Text style={[styles.optionHint, { color: mifacuGold }]}>
                    Eres miembro Premium
                  </Text>
                </View>
                {__devOverrideActive && (
                  <TouchableOpacity
                    onPress={() => __devSetPremium(false)}
                    style={styles.devToggle}
                  >
                    <Text style={[styles.devToggleText, { color: theme.icon }]}>DEV</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.optionRow, { borderBottomColor: theme.separator }]}
                onPress={() => router.push('/subscription')}
                activeOpacity={0.6}
              >
                <View style={[styles.optionIcon, { backgroundColor: mifacuGold }]}>
                  <Ionicons name="star" size={18} color="white" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionLabel, { color: theme.text }]}>MiFacu Premium</Text>
                  <Text style={[styles.optionHint, { color: theme.icon }]}>
                    Desbloquear funciones
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.separator} />
              </TouchableOpacity>
            )}

            {/* Change Career */}
            <TouchableOpacity
              style={[styles.optionRow, { borderBottomWidth: 0 }]}
              onPress={() => setShowCarreraModal(true)}
              activeOpacity={0.6}
            >
              <View style={[styles.optionIcon, { backgroundColor: mifacuNavy }]}>
                <Ionicons name="brush" size={18} color={mifacuGold} />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionLabel, { color: theme.text }]}>Mi Carrera</Text>
                <Text style={[styles.optionHint, { color: theme.icon }]}>
                  {carrera}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.separator} />
            </TouchableOpacity>
          </View>
        </View>

        {/* LOGOUT */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: theme.red + '15' }]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color={theme.red} />
            <Text style={[styles.logoutText, { color: theme.red }]}>
              Cerrar Sesión
            </Text>
          </TouchableOpacity>
        </View>

        {/* SUPPORT */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.icon }]}>SOPORTE</Text>
          <View style={[styles.optionsContainer, { backgroundColor: theme.backgroundSecondary }]}>
            <TouchableOpacity
              style={[styles.optionRow, { borderBottomColor: theme.separator }]}
              onPress={() => setShowFeedbackModal(true)}
              activeOpacity={0.6}
            >
              <View style={[styles.optionIcon, { backgroundColor: theme.purple }]}>
                <Ionicons name="chatbox-ellipses" size={18} color="white" />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionLabel, { color: theme.text }]}>Enviar Comentarios</Text>
                <Text style={[styles.optionHint, { color: theme.icon }]}>
                  Sugerencias, errores o consultas
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.separator} />
            </TouchableOpacity>

            {/* DEV: Premium Toggle */}
            {(__DEV__ || __mockMode || showDevToggle) && (
              <View style={[styles.optionRow, { borderBottomWidth: 0 }]}>
                <View style={[styles.optionIcon, { backgroundColor: __mockMode ? '#FF9500' : '#FF3B30' }]}>
                  <Ionicons name="flask" size={18} color="white" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionLabel, { color: theme.text }]}>
                    Premium {__mockMode ? '(Demo)' : __DEV__ ? '(DEV)' : '(Test)'}
                  </Text>
                  <Text style={[styles.optionHint, { color: theme.icon }]}>
                    {__mockMode
                      ? 'Modo demo - RevenueCat no disponible'
                      : (__devOverrideActive ? 'Override activo' : 'Simular estado premium')
                    }
                  </Text>
                </View>
                <Switch
                  value={isPro}
                  onValueChange={(val) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    __devSetPremium(val);
                  }}
                  trackColor={{ false: theme.separator, true: mifacuGold + '60' }}
                  thumbColor={isPro ? mifacuGold : '#f4f3f4'}
                  ios_backgroundColor={theme.separator}
                />
              </View>
            )}
          </View>
        </View>

        {/* VERSION */}
        <TouchableOpacity onPress={handleVersionTap} activeOpacity={0.6}>
          <Text style={[styles.versionText, { color: theme.icon }]}>
            miFACU v1.0.0{showDevToggle ? ' (Dev)' : ''}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </AnimatedHeaderScrollView>

      {/* CARRERA MODAL */}
      <CarreraModal
        visible={showCarreraModal}
        onClose={() => setShowCarreraModal(false)}
        onSelect={handleSelectCarrera}
        theme={theme}
        isDarkMode={isDark}
      />

      {/* FEEDBACK MODAL */}
      <FeedbackModal
        visible={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        theme={theme}
        isDarkMode={isDark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  // Header title styles (used by AnimatedHeaderScrollView)
  headerLargeTitle: { fontSize: 34, fontWeight: '800', letterSpacing: 0.37 },
  headerInlineTitle: { fontSize: 17, fontWeight: '700' },

  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
  },

  // Profile card
  profileCardContent: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  avatarRing: { padding: 3, borderRadius: 50, borderWidth: 3 },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  profileName: { fontSize: 22, fontWeight: '700', marginTop: 16, letterSpacing: -0.3 },
  profileEmail: { fontSize: 14, fontWeight: '500', marginTop: 4 },

  // Stats
  statsCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '600', marginTop: 4, textTransform: 'uppercase' },
  statDivider: { width: 1, height: 40 },

  // Options
  optionsContainer: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionContent: { flex: 1, marginLeft: 14 },
  optionLabel: { fontSize: 16, fontWeight: '600' },
  optionHint: { fontSize: 12, fontWeight: '500', marginTop: 2 },

  // Premium Badge
  premiumBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  premiumBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  premiumBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  devToggle: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255,0,0,0.1)',
  },
  devToggleText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
  },
  logoutText: { fontSize: 16, fontWeight: '600', marginLeft: 10 },

  // Custom toggle for dark mode
  themeToggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
  },
  themeToggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },

  versionText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    opacity: 0.6,
  },
});
