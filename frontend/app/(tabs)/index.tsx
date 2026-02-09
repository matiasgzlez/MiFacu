import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  Platform,
  RefreshControl,
  Animated,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../src/config/supabase';
import { Colors, mifacuNavy, mifacuGold } from '../../src/constants/theme';
import { useThemeColor } from '../../src/hooks/use-theme-color';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { DataRepository } from '../../src/services/dataRepository';
import { HomeSkeleton } from '../../src/components/Skeleton';
import { usePremium } from '../../src/context/PremiumContext';

// Hooks
import { useHomeData } from '../../src/hooks/useHomeData';

// Components
import {
  AnimatedItem,
  SwipeableTask,
  TaskItem,
  StatsModal,
  CarreraModal,
} from '../../src/components/home';
import { RippleRect } from '../../src/components/ui/skia-ripple';
import { StaggeredText } from '../../src/components/ui/animated-text';
import { CinematicCarousel } from '../../src/components/ui/cinematic-carousel';

// Types
import type { ThemeColors } from '../../src/types';
import type { MateriaUsuario } from '../../src/hooks/useHomeData';

const SCREEN_WIDTH = Dimensions.get('window').width;
const QUICK_ACCESS_KEY = '@mifacu_quick_access';

// Available quick access options with SF Symbol-like icons
const AVAILABLE_SHORTCUTS = [
  { id: 'finales', icon: 'ribbon', label: 'Finales', subtitle: 'Exámenes finales', color: 'blue', route: '/finales' },
  { id: 'parciales', icon: 'document-text', label: 'Parciales', subtitle: 'Próximos exámenes', color: 'orange', route: '/parciales' },
  { id: 'simulador', icon: 'analytics', label: 'Simulador', subtitle: 'Planifica tu carrera', color: 'red', route: '/simulador' },
  { id: 'horarios', icon: 'calendar', label: 'Horarios', subtitle: 'Ver clases', color: 'green', route: '/horarios' },
  { id: 'repositorio', icon: 'folder', label: 'Repositorio', subtitle: 'Links y recursos', color: 'slate', route: '/repositorio' },
  { id: 'calificaciones', icon: 'chatbubbles', label: 'Reseñas', subtitle: 'Opiniones de cátedras', color: 'tint', route: '/selectMateria' },
  { id: 'timeline', icon: 'calendar-outline', label: 'Calendario', subtitle: 'Visión anual', color: 'tint', route: '/linea-de-tiempo' },
  { id: 'temas-finales', icon: 'document-text', label: 'Temas Finales', subtitle: 'Temas de mesas', color: 'orange', route: '/selectMateriaFija' },
] as const;

type ShortcutId = typeof AVAILABLE_SHORTCUTS[number]['id'];

const DEFAULT_SHORTCUTS: ShortcutId[] = ['finales', 'parciales', 'simulador', 'horarios'];

// Compact Shortcut Item for horizontal row
const ShortcutItem = React.memo(({
  shortcut,
  theme,
  isDarkMode,
  onPress
}: {
  shortcut: typeof AVAILABLE_SHORTCUTS[number];
  theme: ThemeColors;
  isDarkMode: boolean;
  onPress: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const getColor = (colorName: string) => {
    return theme[colorName as keyof ThemeColors] || theme.tint;
  };

  return (
    <Animated.View style={[styles.shortcutItem, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.shortcutItemInner}
      >
        <View style={[styles.shortcutIcon, { backgroundColor: getColor(shortcut.color) }]}>
          <Ionicons name={shortcut.icon as any} size={20} color="white" />
        </View>
        <Text style={[styles.shortcutLabel, { color: theme.text }]} numberOfLines={1}>
          {shortcut.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
});

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colorScheme, isDark: isDarkMode } = useTheme();
  const { isPro } = usePremium();
  const theme = Colors[colorScheme] as ThemeColors;

  // Data hook
  const {
    loading,
    refreshing,
    tasks,
    stats,
    carreraProgreso,
    proximaClase,
    cursandoMaterias,
    subtituloContextual,
    privacyMode,
    onRefresh,
    togglePrivacyMode,
    setTasks,
    loadData,
  } = useHomeData();

  // Quick access state
  const [selectedShortcuts, setSelectedShortcuts] = useState<ShortcutId[]>(DEFAULT_SHORTCUTS);
  const [showEditModal, setShowEditModal] = useState(false);
  const [tempShortcuts, setTempShortcuts] = useState<ShortcutId[]>([]);

  // Stats modal
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showCarreraModal, setShowCarreraModal] = useState(false);
  const statsOverlayOpacity = useRef(new Animated.Value(0)).current;
  const statsSheetAnim = useRef(new Animated.Value(0)).current;

  // Progress card collapsed state
  const [progressCollapsed, setProgressCollapsed] = useState(false);
  const progressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    AsyncStorage.getItem('@mifacu_progress_collapsed').then((val) => {
      if (val === 'true') {
        setProgressCollapsed(true);
        progressAnim.setValue(0);
      }
    });
  }, []);

  const toggleProgressCollapsed = useCallback(() => {
    const newVal = !progressCollapsed;
    setProgressCollapsed(newVal);
    AsyncStorage.setItem('@mifacu_progress_collapsed', String(newVal));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(progressAnim, {
      toValue: newVal ? 0 : 1,
      useNativeDriver: false,
      friction: 8,
    }).start();
  }, [progressCollapsed, progressAnim]);

  // Quick Tasks state
  const [newTask, setNewTask] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [addingTask, setAddingTask] = useState(false);

  // Animations
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<any>(null);
  const taskInputRef = useRef<TextInput>(null);

  const headerOpacity = scrollY.interpolate({
    inputRange: [40, 70],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const largeTitleOpacity = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Dynamic colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'backgroundSecondary');
  const separatorColor = useThemeColor({}, 'separator');

  const hour = new Date().getHours();
  const currentGreeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Hola' : 'Buenas noches';
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Estudiante';
  const userCarrera = user?.user_metadata?.carrera;

  // Onboarding: Si no hay carrera, mostrar modal
  useEffect(() => {
    if (user && !userCarrera && !loading) {
      setTimeout(() => setShowCarreraModal(true), 1500);
    }
  }, [user, userCarrera, loading]);

  // Load shortcuts from storage
  useEffect(() => {
    const loadShortcuts = async () => {
      try {
        const saved = await AsyncStorage.getItem(QUICK_ACCESS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as ShortcutId[];
          setSelectedShortcuts(parsed);
        }
      } catch (error) {
        console.error('Error loading shortcuts:', error);
      }
    };
    loadShortcuts();
  }, []);

  // Stats modal handlers
  const openStatsModal = useCallback(() => {
    setShowStatsModal(true);
    Animated.parallel([
      Animated.timing(statsOverlayOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(statsSheetAnim, {
        toValue: 1,
        damping: 15,
        stiffness: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const closeStatsModal = useCallback(() => {
    Animated.parallel([
      Animated.timing(statsOverlayOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(statsSheetAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => setShowStatsModal(false));
  }, []);

  const handleAddTask = useCallback(async () => {
    if (!newTask.trim() || addingTask) return;

    const taskText = newTask.trim();
    const taskDescription = newTaskDescription.trim() || undefined;
    const tempId = Date.now();

    const optimisticTask = {
      id: tempId,
      nombre: taskText,
      descripcion: taskDescription,
      fecha: new Date().toISOString().split('T')[0],
      hora: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`,
      tipo: 'quick_task',
    };

    setTasks((prev) => [...prev, optimisticTask as any]);
    setNewTask('');
    setNewTaskDescription('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      setAddingTask(true);
      const created = await DataRepository.createRecordatorio(false, {
        nombre: taskText,
        descripcion: taskDescription,
        fecha: optimisticTask.fecha,
        hora: optimisticTask.hora,
        tipo: 'quick_task',
      });

      setTasks((prev) => prev.map((t) => (t.id === tempId ? created : t)));
    } catch (error) {
      console.error('Error creando tarea:', error);
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
      Alert.alert('Error', 'No se pudo agregar la tarea');
    } finally {
      setAddingTask(false);
    }
  }, [newTask, newTaskDescription, setTasks, addingTask]);

  const handleCompleteTask = useCallback(
    async (id: number) => {
      try {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        await DataRepository.deleteRecordatorio(false, id);
      } catch (error) {
        console.error('Error deleting task:', error);
        loadData();
      }
    },
    [setTasks, loadData]
  );

  // Quick access handlers
  const openEditModal = useCallback(() => {
    setTempShortcuts([...selectedShortcuts]);
    setShowEditModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [selectedShortcuts]);

  const toggleShortcut = useCallback((id: ShortcutId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTempShortcuts((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 2) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          return prev;
        }
        return prev.filter((s) => s !== id);
      }
      if (prev.length >= 5) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return prev;
      }
      return [...prev, id];
    });
  }, []);

  const saveShortcuts = useCallback(async () => {
    try {
      await AsyncStorage.setItem(QUICK_ACCESS_KEY, JSON.stringify(tempShortcuts));
      setSelectedShortcuts(tempShortcuts);
      setShowEditModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error saving shortcuts:', error);
      Alert.alert('Error', 'No se pudieron guardar los accesos');
    }
  }, [tempShortcuts]);

  const handleSelectCarrera = useCallback(async (carreraId: string, carreraNombre: string) => {
    try {
      const userId = user?.id;
      if (!userId) {
        Alert.alert('Error', 'No se encontró sesión activa');
        return;
      }

      await DataRepository.updateCareer(userId, carreraId);

      const { error } = await supabase.auth.updateUser({
        data: { carrera: carreraNombre, carreraId: carreraId }
      });
      if (error) throw error;

      setShowCarreraModal(false);
      loadData();
    } catch (error) {
      console.error('Error selecting carrera:', error);
      Alert.alert('Error', 'No se pudo guardar la carrera');
    }
  }, [user, loadData]);

  // Get active shortcuts data
  const activeShortcuts = selectedShortcuts
    .map((id) => AVAILABLE_SHORTCUTS.find((s) => s.id === id))
    .filter(Boolean) as typeof AVAILABLE_SHORTCUTS[number][];

  // Gradient colors
  const heroGradientColors = isDarkMode
    ? ['#0A1628', '#050D1A'] as const
    : ['#1E3A8A', '#0F1D45'] as const;

  // Hero card: free day or has class
  const isDiaLibre = !proximaClase || proximaClase.tipo === 'Horarios';

  // Carousel constants
  const CAROUSEL_ITEM_WIDTH = Math.round(SCREEN_WIDTH * 0.75);
  const CAROUSEL_ITEM_HEIGHT = 160;

  const DAY_LABELS: Record<string, string> = {
    LU: 'LUNES', MA: 'MARTES', MI: 'MIÉRCOLES',
    JU: 'JUEVES', VI: 'VIERNES', SA: 'SÁBADO', DO: 'DOMINGO',
  };

  const renderCursandoItem = useCallback((item: MateriaUsuario) => {
    const horaNum = typeof item.hora === 'number' ? item.hora : parseInt(String(item.hora));
    const duracion = item.duracion || 2;
    const horaFin = horaNum + duracion;
    const horaStr = `${horaNum}:00`;
    const horaFinStr = `${horaFin}:00`;
    const nombre = item.materia?.nombre || item.nombre || 'Materia';
    const dia = DAY_LABELS[item.dia || ''] || item.dia || '';
    const aula = item.aula || '-';

    return (
      <LinearGradient
        colors={isDarkMode
          ? ['#1a1a2e', '#16213e', '#0f3460'] as const
          : ['#4338CA', '#6366F1', '#818CF8'] as const}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.carouselCard}
      >
        <View style={styles.carouselCardHeader}>
          <Ionicons name="book" size={16} color="rgba(255,255,255,0.7)" />
          <Text style={styles.carouselCardDay}>{dia}</Text>
        </View>
        <Text style={styles.carouselCardMateria} numberOfLines={2}>
          {nombre}
        </Text>
        <View style={styles.carouselCardFooter}>
          <View style={styles.carouselCardInfo}>
            <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.carouselCardInfoText}>{horaStr} - {horaFinStr}</Text>
          </View>
          {aula !== '-' && (
            <View style={styles.carouselCardInfo}>
              <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.6)" />
              <Text style={styles.carouselCardInfoText}>{aula}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    );
  }, [isDarkMode]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* STICKY HEADER WITH BLUR - Navy */}
      <Animated.View style={[styles.headerInline, { opacity: headerOpacity }]}>
        <BlurView
          intensity={80}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: isDarkMode ? 'rgba(17,24,39,0.85)' : 'rgba(30,58,138,0.85)' }]} />
        <View style={[styles.headerBorder, { borderBottomColor: 'rgba(255,255,255,0.15)' }]} />
        <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
          <View style={styles.headerInlineContent}>
            <Text style={[styles.headerInlineTitle, { color: '#FFFFFF' }]}>Inicio</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/perfil')}
              style={styles.headerInlineAvatar}
            >
              <Image
                source={{ uri: user?.user_metadata?.avatar_url || 'https://i.pravatar.cc/100?img=33' }}
                style={styles.avatarSmall}
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>

      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
            colors={['#FFFFFF']}
          />
        }
      >
        {/* COMPACT HEADER - Hero Gradient */}
        <Animated.View style={[{ opacity: largeTitleOpacity }]}>
          <LinearGradient
            colors={heroGradientColors}
            style={styles.heroGradient}
          >
            <SafeAreaView edges={['top']}>
              <View style={styles.headerTop}>
                <View style={{ flex: 1 }}>
                  <StaggeredText
                    text={`${currentGreeting}, ${userName}`}
                    style={styles.headerTitle}
                    animationConfig={{
                      characterDelay: 20,
                      maxBlurIntensity: 40,
                      spring: { damping: 15, stiffness: 210, mass: 1 },
                    }}
                    enterFrom={{ opacity: 0, translateY: 30, scale: 0.3, rotate: 0 }}
                  />
                  {!loading && (
                    <Text style={styles.headerSubtitle}>
                      {subtituloContextual}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => router.push('/perfil')}
                  activeOpacity={0.8}
                  style={[styles.headerAvatarContainer, { borderColor: isPro ? mifacuGold : 'rgba(255,255,255,0.3)' }]}
                >
                  <Image
                    source={{ uri: user?.user_metadata?.avatar_url || 'https://i.pravatar.cc/100?img=33' }}
                    style={styles.avatarLarge}
                  />
                  {isPro && (
                    <View style={styles.premiumAvatarBadge}>
                      <Ionicons name="star" size={10} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* PROGRESS CARD - Collapsible */}
              <View style={styles.progressCardContainer}>
                <Animated.View style={{
                  maxHeight: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 120],
                  }),
                  opacity: progressAnim,
                  overflow: 'hidden',
                }}>
                  <Pressable onPress={openStatsModal} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
                    <View style={styles.progressContent}>
                      <View style={styles.progressInfo}>
                        <Text style={styles.progressSubtitle} numberOfLines={1}>
                          {user?.user_metadata?.carrera || 'Mi carrera'}
                        </Text>
                        <Text style={styles.progressPercentage}>
                          {privacyMode ? '•••' : `${carreraProgreso}%`}
                        </Text>
                      </View>
                      <View style={styles.progressBarBg}>
                        <Animated.View
                          style={[
                            styles.progressBarFill,
                            {
                              width: privacyMode ? '0%' : `${carreraProgreso}%`,
                              opacity: privacyMode ? 0 : 1,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </Pressable>
                </Animated.View>
                <Pressable
                  onPress={toggleProgressCollapsed}
                  style={styles.progressToggle}
                  hitSlop={{ top: 6, bottom: 6, left: 10, right: 10 }}
                >
                  <Text style={styles.progressToggleText}>
                    {progressCollapsed ? 'Ver más' : 'Ver menos'}
                  </Text>
                  <Ionicons
                    name={progressCollapsed ? 'chevron-down' : 'chevron-up'}
                    size={14}
                    color="rgba(255,255,255,0.5)"
                  />
                </Pressable>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </Animated.View>

        {/* SKELETON LOADING OR CONTENT */}
        {loading ? (
          <HomeSkeleton />
        ) : (
          <>
            {/* ═══ BENTO GRID ═══ */}
            <View style={styles.bentoSection}>
              {/* Hero Card — Próxima Clase */}
              <RippleRect
                width={Dimensions.get('window').width - 40}
                height={120}
                borderRadius={20}
                color={isDarkMode ? 'rgba(10,22,40,0.9)' : mifacuNavy}
                onPress={() => router.push('/horarios')}
                style={styles.heroCardContent}
              >
                {isDiaLibre ? (
                  <>
                    <View style={styles.heroIconRow}>
                      <Ionicons name="sunny" size={28} color="rgba(255,255,255,0.8)" />
                    </View>
                    <Text style={styles.heroLabel}>Día libre</Text>
                    <Text style={styles.heroHint}>Sin clases hoy</Text>
                  </>
                ) : (
                  <>
                    <View style={styles.heroBadgeRow}>
                      <View style={styles.heroBadge}>
                        <View style={[styles.heroBadgeDot, {
                          backgroundColor: proximaClase?.tipo === 'Clase Actual' ? '#30D158' : '#FF9F0A',
                        }]} />
                        <Text style={styles.heroBadgeText}>{proximaClase?.tipo}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.5)" />
                    </View>
                    <Text style={styles.heroMateria} numberOfLines={2}>
                      {proximaClase?.materia}
                    </Text>
                    <View style={styles.heroFooter}>
                      <View style={styles.heroInfoItem}>
                        <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.heroInfoText}>{proximaClase?.hora}</Text>
                      </View>
                      {proximaClase?.aula && proximaClase.aula !== '-' && (
                        <View style={[styles.heroInfoItem, { marginLeft: 12 }]}>
                          <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.7)" />
                          <Text style={styles.heroInfoText}>{proximaClase.aula}</Text>
                        </View>
                      )}
                    </View>
                  </>
                )}
              </RippleRect>

              {/* Carousel — Materias Cursando */}
              {cursandoMaterias.length > 0 && (
                <View>
                  <Text style={[styles.carouselSectionTitle, { color: theme.text }]}>
                    Cursando
                  </Text>
                  <CinematicCarousel
                    data={cursandoMaterias}
                    renderItem={renderCursandoItem}
                    itemWidth={CAROUSEL_ITEM_WIDTH}
                    itemHeight={CAROUSEL_ITEM_HEIGHT}
                    style={styles.carouselContainer}
                  />
                </View>
              )}

              {/* Row 2: Shortcuts horizontal */}
              <View style={styles.shortcutsRow}>
                {activeShortcuts.map((shortcut) => (
                  <ShortcutItem
                    key={shortcut.id}
                    shortcut={shortcut}
                    theme={theme}
                    isDarkMode={isDarkMode}
                    onPress={() => router.push(shortcut.route as any)}
                  />
                ))}
                <Pressable
                  onPress={openEditModal}
                  style={styles.shortcutItemInner}
                >
                  <View style={[styles.shortcutIcon, { backgroundColor: isDarkMode ? '#38383A' : '#E2E8F0' }]}>
                    <Ionicons name="pencil" size={18} color={theme.icon} />
                  </View>
                  <Text style={[styles.shortcutLabel, { color: theme.icon }]}>Editar</Text>
                </Pressable>
              </View>
            </View>

            {/* ═══ TAREAS — Attio style ═══ */}
            <View style={styles.tasksSection}>
              <View style={styles.tasksSectionHeader}>
                <Text style={[styles.tasksTitle, { color: theme.text }]}>Tareas</Text>
                {tasks.length > 0 && (
                  <View style={[styles.countBadge, { backgroundColor: isDarkMode ? theme.tint + '20' : mifacuNavy + '12' }]}>
                    <Text style={[styles.countBadgeText, { color: isDarkMode ? theme.tint : mifacuNavy }]}>
                      {tasks.length}
                    </Text>
                  </View>
                )}
              </View>

              <View style={[styles.tasksContainer, { backgroundColor: cardColor, borderColor: isDarkMode ? '#38383A' : '#E2E8F0' }]}>
                {tasks.length > 0 ? (
                  tasks.map((task, index) => (
                    <AnimatedItem key={task.id} index={index} delay={40}>
                      <View>
                        <SwipeableTask onDelete={() => handleCompleteTask(task.id)} theme={theme}>
                          <TaskItem
                            task={task}
                            onDelete={() => handleCompleteTask(task.id)}
                            theme={theme}
                            separatorColor={separatorColor}
                          />
                        </SwipeableTask>
                        {index < tasks.length - 1 && (
                          <View style={[styles.taskSeparator, { backgroundColor: separatorColor }]} />
                        )}
                      </View>
                    </AnimatedItem>
                  ))
                ) : (
                  <View style={styles.emptyTasks}>
                    <Ionicons name="checkmark-circle-outline" size={28} color={theme.separator} />
                    <Text style={[styles.emptyTasksText, { color: theme.icon }]}>
                      Sin tareas pendientes
                    </Text>
                  </View>
                )}

                {/* Task Input */}
                <View style={[styles.taskInputRow, { borderTopColor: separatorColor }]}>
                  <View style={[styles.inputDot, { borderColor: theme.separator }]} />
                  <View style={styles.taskInputFields}>
                    <TextInput
                      ref={taskInputRef}
                      placeholder="+ Nueva tarea..."
                      placeholderTextColor={theme.icon}
                      style={[styles.taskInput, { color: theme.text }]}
                      value={newTask}
                      onChangeText={setNewTask}
                      onFocus={() => {
                        setTimeout(() => {
                          (scrollViewRef.current as any)?.scrollToEnd?.({ animated: true });
                        }, 150);
                      }}
                      onSubmitEditing={() => {
                        if (newTask.trim() && !newTaskDescription) {
                          handleAddTask();
                        }
                      }}
                      returnKeyType={newTaskDescription ? 'next' : 'done'}
                      blurOnSubmit={false}
                    />
                    {newTask.trim().length > 0 && (
                      <TextInput
                        placeholder="Descripción (opcional)"
                        placeholderTextColor={theme.separator}
                        style={[styles.taskDescriptionInput, { color: theme.icon }]}
                        value={newTaskDescription}
                        onChangeText={setNewTaskDescription}
                        onSubmitEditing={handleAddTask}
                        returnKeyType="done"
                        blurOnSubmit={false}
                      />
                    )}
                  </View>
                  {newTask.trim().length > 0 && (
                    <Pressable
                      onPress={handleAddTask}
                      disabled={addingTask || !newTask.trim()}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      style={({ pressed }) => [
                        styles.addTaskButton,
                        {
                          backgroundColor: isDarkMode ? theme.tint : mifacuNavy,
                          opacity: pressed ? 0.7 : 1,
                          transform: [{ scale: pressed ? 0.9 : 1 }],
                        },
                      ]}
                    >
                      <Ionicons name="arrow-up" size={16} color="white" />
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
          </>
        )}
      </Animated.ScrollView>

      {/* STATS MODAL */}
      <StatsModal
        visible={showStatsModal}
        onClose={closeStatsModal}
        overlayOpacity={statsOverlayOpacity}
        sheetAnim={statsSheetAnim}
        theme={theme}
        cardColor={cardColor}
        carreraProgreso={carreraProgreso}
        stats={stats}
        privacyMode={privacyMode}
        onNavigateToMaterias={() => {
          closeStatsModal();
          setTimeout(() => router.push('/(tabs)/materias'), 300);
        }}
      />

      {/* CARRERA MODAL (Onboarding) */}
      <CarreraModal
        visible={showCarreraModal}
        onClose={() => setShowCarreraModal(false)}
        onSelect={handleSelectCarrera}
        theme={theme}
        isDarkMode={isDarkMode}
      />

      {/* EDIT SHORTCUTS MODAL */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor }]}>
          <SafeAreaView edges={['top']} style={styles.modalSafeArea}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: separatorColor }]}>
              <TouchableOpacity onPress={() => setShowEditModal(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={[styles.modalCancel, { color: theme.tint }]}>Cancelar</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: textColor }]}>Accesos Rápidos</Text>
              <TouchableOpacity onPress={saveShortcuts} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={[styles.modalSave, { color: theme.tint }]}>Listo</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalDescription, { color: theme.icon }]}>
                Selecciona los accesos que quieres ver en tu inicio. Puedes elegir entre 2 y 5.
              </Text>

              {/* Options List */}
              <View style={[styles.optionsList, { backgroundColor: cardColor }]}>
                {AVAILABLE_SHORTCUTS.map((shortcut, index) => {
                  const isSelected = tempShortcuts.includes(shortcut.id);
                  const getOptColor = (colorName: string) => theme[colorName as keyof ThemeColors] || theme.tint;

                  return (
                    <TouchableOpacity
                      key={shortcut.id}
                      onPress={() => toggleShortcut(shortcut.id)}
                      activeOpacity={0.6}
                      style={[
                        styles.optionRow,
                        index < AVAILABLE_SHORTCUTS.length - 1 && {
                          borderBottomWidth: StyleSheet.hairlineWidth,
                          borderBottomColor: separatorColor,
                        },
                      ]}
                    >
                      <View style={[styles.optionIconBox, { backgroundColor: getOptColor(shortcut.color) }]}>
                        <Ionicons name={shortcut.icon as any} size={18} color="white" />
                      </View>
                      <View style={styles.optionInfo}>
                        <Text style={[styles.optionLabel, { color: theme.text }]}>{shortcut.label}</Text>
                        <Text style={[styles.optionSubtitle, { color: theme.icon }]}>{shortcut.subtitle}</Text>
                      </View>
                      <View style={[
                        styles.optionCheckbox,
                        isSelected
                          ? { backgroundColor: theme.tint }
                          : { borderWidth: 2, borderColor: theme.separator }
                      ]}>
                        {isSelected && <Ionicons name="checkmark" size={14} color="white" />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.modalFooterText, { color: theme.icon }]}>
                {tempShortcuts.length} de 5 seleccionados
              </Text>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Sticky header
  headerInline: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 70,
    zIndex: 100,
    overflow: 'hidden',
  },
  headerBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerSafeArea: { flex: 1 },
  headerInlineContent: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 45 : 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerInlineTitle: { fontSize: 17, fontWeight: '600' },
  headerInlineAvatar: { padding: 2 },
  avatarSmall: { width: 32, height: 32, borderRadius: 16 },

  // Hero gradient header — compact
  heroGradient: {
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  headerAvatarContainer: {
    borderWidth: 2,
    padding: 2,
    borderRadius: 24,
    position: 'relative',
  },
  avatarLarge: { width: 40, height: 40, borderRadius: 20 },
  premiumAvatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: mifacuGold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: mifacuNavy,
  },

  // Progress Card - Collapsible in header gradient
  progressCardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  progressContent: {
    padding: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  progressSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  progressBarBg: {
    height: 10,
    borderRadius: 5,
    width: '100%',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  progressToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  progressToggleText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
  },

  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 120 },

  // ═══ BENTO GRID ═══
  bentoSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },

  // Hero Card — Próxima Clase (full width)
  heroCardContent: {
    padding: 16,
    justifyContent: 'space-between',
    flex: 1,
  },
  heroIconRow: {
    marginBottom: 12,
  },
  heroLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  heroHint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 5,
  },
  heroBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  heroBadgeText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  heroMateria: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroInfoText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '500',
  },

  // Shortcuts Row
  shortcutsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shortcutItem: {
    flex: 1,
    alignItems: 'center',
  },
  shortcutItemInner: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  shortcutIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },

  // ═══ TASKS SECTION (Attio style) ═══
  tasksSection: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  tasksSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  tasksTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  tasksContainer: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  taskSeparator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 50,
  },
  emptyTasks: {
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 6,
  },
  emptyTasksText: { fontSize: 15, fontWeight: '500' },

  // Task Input (integrated)
  taskInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inputDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    backgroundColor: 'transparent',
    marginRight: 12,
    marginTop: 4,
  },
  taskInputFields: {
    flex: 1,
  },
  taskInput: {
    fontSize: 15,
    paddingVertical: 6,
    paddingHorizontal: 0,
  },
  taskDescriptionInput: {
    fontSize: 13,
    paddingVertical: 2,
    paddingHorizontal: 0,
    marginTop: 2,
  },
  addTaskButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  // Modal
  modalContainer: { flex: 1 },
  modalSafeArea: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalCancel: { fontSize: 17 },
  modalTitle: { fontSize: 17, fontWeight: '600' },
  modalSave: { fontSize: 17, fontWeight: '600' },
  modalContent: { flex: 1, paddingTop: 20 },
  modalDescription: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 24,
    lineHeight: 20,
  },

  optionsList: {
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionIconBox: {
    width: 30,
    height: 30,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionInfo: {
    flex: 1,
    marginLeft: 14,
  },
  optionLabel: { fontSize: 16, fontWeight: '500' },
  optionSubtitle: { fontSize: 13, marginTop: 1 },
  optionCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalFooterText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 40,
  },

  // ═══ CINEMATIC CAROUSEL ═══
  carouselSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 10,
  },
  carouselContainer: {
    marginHorizontal: -20,
  },
  carouselCard: {
    flex: 1,
    borderRadius: 20,
    padding: 18,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  carouselCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  carouselCardDay: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  carouselCardMateria: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    flex: 1,
  },
  carouselCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 10,
  },
  carouselCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  carouselCardInfoText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '500',
  },
});
