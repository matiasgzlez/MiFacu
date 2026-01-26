import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Dimensions,
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  Keyboard,
  Platform,
  RefreshControl,
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Colors } from '../src/constants/theme';
import { useThemeColor } from '../src/hooks/use-theme-color';
import { useTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';
import { DataRepository } from '../src/services/dataRepository';
import { HomeSkeleton } from '../src/components/Skeleton';

// Hooks
import { useHomeData } from '../src/hooks/useHomeData';
import { useSheetAnimation, useNotificationAnimation } from '../src/hooks/useSheetAnimation';

// Components
import {
  AnimatedItem,
  PriorityCard,
  TableRow,
  SwipeableTask,
  TaskItem,
  StatsModal,
  ProfileModal,
} from '../src/components/home';

// Types
import type { ThemeColors } from '../src/types';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user, isGuest, signOut } = useAuth();
  const { colorScheme, isDark, toggleTheme } = useTheme();
  const theme = Colors[colorScheme] as ThemeColors;

  // Use custom hook for data management
  const {
    loading,
    refreshing,
    tasks,
    stats,
    carreraProgreso,
    proximaClase,
    privacyMode,
    onRefresh,
    togglePrivacyMode,
    setTasks,
    loadData,
  } = useHomeData();

  // Quick Tasks state
  const [newTask, setNewTask] = useState('');
  const [addingTask, setAddingTask] = useState(false);

  // Sheet animations
  const statsSheet = useSheetAnimation({ damping: 15, stiffness: 100 });
  const profileSheet = useSheetAnimation({ damping: 18, stiffness: 120 });
  const notification = useNotificationAnimation();

  // Header scroll animation
  const scrollY = useRef(new Animated.Value(0)).current;

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

  // Show notification when data loads
  useEffect(() => {
    if (!loading && proximaClase) {
      notification.show();
    }
  }, [loading, proximaClase]);

  const handleToggleDarkMode = useCallback(async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleTheme();
  }, [toggleTheme]);

  const handlePrivacyToggle = useCallback(async () => {
    await togglePrivacyMode();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [togglePrivacyMode]);

  const handleAddTask = useCallback(async () => {
    if (!newTask.trim()) return;

    try {
      setAddingTask(true);
      const taskData = {
        nombre: newTask.trim(),
        descripcion: 'Tarea Rápida',
        fecha: new Date().toISOString().split('T')[0],
        hora: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`,
        tipo: 'quick_task',
      };

      const created = await DataRepository.createRecordatorio(isGuest, taskData);
      setTasks((prev) => [...prev, created]);
      setNewTask('');
      Keyboard.dismiss();
    } catch (error) {
      console.error('Error creando tarea:', error);
      Alert.alert('Error', 'No se pudo agregar la tarea');
    } finally {
      setAddingTask(false);
    }
  }, [newTask, isGuest, setTasks]);

  const handleCompleteTask = useCallback(
    async (id: number) => {
      try {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        await DataRepository.deleteRecordatorio(isGuest, id);
      } catch (error) {
        console.error('Error deleting task:', error);
        loadData();
      }
    },
    [isGuest, setTasks, loadData]
  );

  const handleLogout = useCallback(() => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/');
        },
      },
    ]);
  }, [signOut, router]);

  const handleStatsNavigate = useCallback(() => {
    statsSheet.close();
    setTimeout(() => router.push('/mis-materias'), 300);
  }, [statsSheet, router]);

  const handleProfileNavigate = useCallback(() => {
    profileSheet.close();
    setTimeout(() => router.push('/mis-materias'), 300);
  }, [profileSheet, router]);

  const handleProfileLogout = useCallback(() => {
    profileSheet.close();
    setTimeout(() => handleLogout(), 300);
  }, [profileSheet, handleLogout]);

  const handleOpenStats = useCallback(() => {
    statsSheet.open();
  }, [statsSheet]);

  const handleOpenProfile = useCallback(() => {
    profileSheet.open();
  }, [profileSheet]);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* STICKY HEADER WITH BLUR */}
      <Animated.View style={[styles.headerInline, { opacity: headerOpacity }]}>
        <BlurView
          intensity={80}
          tint={colorScheme}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.headerBorder, { borderBottomColor: theme.separator }]} />
        <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
          <View style={styles.headerInlineContent}>
            <Text style={[styles.headerInlineTitle, { color: textColor }]}>Mi Panel</Text>
            <TouchableOpacity
              onPress={handleOpenProfile}
              style={styles.headerInlineAvatar}
              accessibilityLabel="Abrir perfil"
              accessibilityRole="button"
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
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.tint}
            colors={[theme.tint]}
          />
        }
      >
        {/* LARGE TITLE HEADER */}
        <Animated.View style={[styles.header, { borderBottomColor: 'transparent', opacity: largeTitleOpacity }]}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerTop}>
              <View>
                <Text style={[styles.headerLabel, { color: theme.icon }]}>MI PANEL</Text>
                <Text style={[styles.headerTitle, { color: textColor }]}>
                  Hola, {user?.user_metadata?.full_name?.split(' ')[0] || 'Usuario'} 👋
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleOpenProfile}
                style={[styles.avatarContainer, { borderColor: theme.tint + '40' }]}
                accessibilityLabel="Abrir perfil"
                accessibilityRole="button"
              >
                <Image
                  source={{ uri: user?.user_metadata?.avatar_url || 'https://i.pravatar.cc/100?img=33' }}
                  style={styles.avatar}
                  accessibilityLabel="Foto de perfil"
                />
              </TouchableOpacity>
            </View>

            {/* PROGRESS BAR */}
            <View style={styles.progressSection}>
              <Pressable
                onPress={handleOpenStats}
                accessibilityLabel={`Ver estadísticas. Progreso: ${privacyMode ? 'oculto' : carreraProgreso + ' por ciento'}`}
                accessibilityRole="button"
              >
                <View style={styles.progressInfo}>
                  <TouchableOpacity
                    style={styles.progressRow}
                    onPress={handlePrivacyToggle}
                    activeOpacity={0.6}
                    accessibilityLabel={privacyMode ? 'Mostrar progreso' : 'Ocultar progreso'}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.progressText, { color: theme.icon }]}>Progreso de Carrera</Text>
                    <Ionicons
                      name={privacyMode ? 'eye-off-outline' : 'eye-outline'}
                      size={16}
                      color={theme.icon}
                      style={styles.progressIcon}
                    />
                  </TouchableOpacity>

                  <Text style={[styles.progressPercentage, { color: privacyMode ? theme.icon : theme.tint }]}>
                    {privacyMode ? '•••' : `${carreraProgreso}%`}
                  </Text>
                </View>
                <View style={[styles.progressBarBg, { backgroundColor: theme.separator + '40' }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: privacyMode ? '0%' : `${carreraProgreso}%`,
                        backgroundColor: theme.tint,
                        opacity: privacyMode ? 0 : 1,
                      },
                    ]}
                  />
                  {privacyMode && (
                    <View
                      style={[
                        StyleSheet.absoluteFill,
                        styles.progressPrivacy,
                        { backgroundColor: theme.separator },
                      ]}
                    />
                  )}
                </View>
              </Pressable>
            </View>
          </SafeAreaView>
        </Animated.View>

        {/* NEXT CLASS NOTIFICATION */}
        {!loading && proximaClase && (
          <Animated.View
            style={[
              styles.inlinePillContainer,
              {
                opacity: notification.opacity,
                transform: [{ translateY: notification.translateY }],
              },
            ]}
          >
            <Pressable
              style={({ pressed }) => [
                styles.nextStepPill,
                { backgroundColor: theme.tint, opacity: pressed ? 0.9 : 1 },
              ]}
              onPress={() => router.push('/horarios' as never)}
            >
              <View style={styles.pillHeader}>
                <View style={styles.pillBadge}>
                  <Ionicons name="notifications" size={14} color="white" />
                  <Text style={styles.pillBadgeText}>{proximaClase.tipo}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
              </View>

              <Text style={styles.pillMateria}>{proximaClase.materia}</Text>

              <View style={styles.pillFooter}>
                <View style={styles.pillInfoItem}>
                  <Ionicons name="time" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.pillInfoText}>{proximaClase.hora}</Text>
                </View>
                {proximaClase.aula && proximaClase.aula !== '-' && (
                  <View style={[styles.pillInfoItem, styles.pillInfoItemSpaced]}>
                    <Ionicons name="location" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.pillInfoText}>{proximaClase.aula}</Text>
                  </View>
                )}
              </View>
            </Pressable>
          </Animated.View>
        )}

        {/* SKELETON LOADING OR CONTENT */}
        {loading ? (
          <HomeSkeleton />
        ) : (
          <>
            {/* QUICK TASKS SECTION */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.icon }]}>TAREAS RÁPIDAS</Text>
              <View style={styles.tasksContainer}>
                {/* Input Row */}
                <View style={styles.taskInputRow}>
                  <TextInput
                    placeholder="Agregar nueva tarea..."
                    placeholderTextColor={theme.icon}
                    style={[styles.taskInput, { color: theme.text }]}
                    value={newTask}
                    onChangeText={setNewTask}
                    onSubmitEditing={handleAddTask}
                    returnKeyType="done"
                    accessibilityLabel="Agregar nueva tarea"
                    accessibilityHint="Escribe el nombre de la tarea y presiona enter"
                  />
                  <TouchableOpacity
                    onPress={handleAddTask}
                    disabled={addingTask || !newTask.trim()}
                    style={[
                      styles.addTaskButton,
                      { backgroundColor: newTask.trim() ? theme.tint : theme.separator },
                    ]}
                    accessibilityLabel="Agregar tarea"
                    accessibilityRole="button"
                    accessibilityState={{ disabled: addingTask || !newTask.trim() }}
                  >
                    <Ionicons name="add" size={20} color="white" />
                  </TouchableOpacity>
                </View>

                {/* Tasks List */}
                {tasks.length === 0 ? (
                  <View style={styles.emptyTasks} accessibilityLabel="No hay tareas pendientes">
                    <Ionicons name="create-outline" size={24} color={theme.separator} style={styles.emptyIcon} />
                    <Text style={[styles.emptyTasksText, { color: theme.icon }]}>No hay tareas pendientes</Text>
                  </View>
                ) : (
                  tasks.map((task, index) => (
                    <AnimatedItem key={task.id} index={index} delay={50}>
                      <SwipeableTask onDelete={() => handleCompleteTask(task.id)} theme={theme}>
                        <TaskItem
                          task={task}
                          onDelete={() => handleCompleteTask(task.id)}
                          theme={theme}
                          separatorColor={separatorColor}
                          isGuest={isGuest}
                        />
                      </SwipeableTask>
                    </AnimatedItem>
                  ))
                )}
              </View>
            </View>

            {/* QUICK ACCESS SECTION */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.icon }]}>ACCESO RÁPIDO</Text>
              <View style={styles.priorityGrid}>
                <AnimatedItem index={0} delay={100}>
                  <PriorityCard
                    icon="star"
                    label="Finales"
                    subtitle="En curso"
                    color={theme.blue}
                    onPress={() => router.push('/finales')}
                    theme={theme}
                    cardColor={cardColor}
                  />
                </AnimatedItem>
                <AnimatedItem index={1} delay={100}>
                  <PriorityCard
                    icon="calendar"
                    label="Parciales"
                    subtitle="Próximos"
                    color={theme.orange}
                    onPress={() => router.push('/parciales')}
                    theme={theme}
                    cardColor={cardColor}
                  />
                </AnimatedItem>
              </View>
            </View>

            {/* TOOLS SECTION */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.icon }]}>HERRAMIENTAS</Text>
              <View style={[styles.tableContainer, { backgroundColor: cardColor, borderColor: separatorColor }]}>
                <AnimatedItem index={0} delay={150}>
                  <TableRow
                    icon="book"
                    label="Mis Materias"
                    color={theme.blue}
                    onPress={() => router.push('/mis-materias')}
                    isLast={false}
                    theme={theme}
                  />
                </AnimatedItem>
                <AnimatedItem index={1} delay={150}>
                  <TableRow
                    icon="time"
                    label="Horarios"
                    color={theme.green}
                    onPress={() => router.push('/horarios')}
                    isLast={false}
                    theme={theme}
                  />
                </AnimatedItem>
                <AnimatedItem index={2} delay={150}>
                  <TableRow
                    icon="calculator"
                    label="Simulador de Notas"
                    color={theme.red}
                    onPress={() => router.push('/simulador')}
                    isLast={false}
                    theme={theme}
                  />
                </AnimatedItem>
                <AnimatedItem index={3} delay={150}>
                  <TableRow
                    icon="folder-open"
                    label="Repositorio"
                    color={theme.slate}
                    onPress={() => router.push('/repositorio' as never)}
                    isLast
                    theme={theme}
                  />
                </AnimatedItem>
              </View>
            </View>

            <View style={styles.infoBox} accessibilityLabel="Datos sincronizados correctamente">
              <Ionicons name="checkmark-circle-outline" size={14} color={theme.green} />
              <Text style={[styles.infoText, { color: theme.icon }]}>Datos sincronizados correctamente</Text>
            </View>
          </>
        )}
      </Animated.ScrollView>

      {/* STATS MODAL */}
      <StatsModal
        visible={statsSheet.visible}
        onClose={statsSheet.close}
        overlayOpacity={statsSheet.overlayOpacity}
        sheetAnim={statsSheet.sheetAnim}
        theme={theme}
        cardColor={cardColor}
        carreraProgreso={carreraProgreso}
        stats={stats}
        privacyMode={privacyMode}
        onNavigateToMaterias={handleStatsNavigate}
      />

      {/* PROFILE MODAL */}
      <ProfileModal
        visible={profileSheet.visible}
        onClose={profileSheet.close}
        overlayOpacity={profileSheet.overlayOpacity}
        sheetAnim={profileSheet.sheetAnim}
        theme={theme}
        cardColor={cardColor}
        colorScheme={colorScheme}
        user={user}
        isGuest={isGuest}
        stats={stats}
        darkModeEnabled={isDark}
        onToggleDarkMode={handleToggleDarkMode}
        privacyMode={privacyMode}
        onTogglePrivacyMode={togglePrivacyMode}
        onNavigateToMaterias={handleProfileNavigate}
        onLogout={handleProfileLogout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // STICKY HEADER WITH BLUR
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
  headerSafeArea: {
    flex: 1,
  },
  headerInlineContent: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 45 : 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerInlineTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  headerInlineAvatar: {
    padding: 2,
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  // LARGE TITLE HEADER
  header: {
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  avatarContainer: {
    borderWidth: 2,
    padding: 3,
    borderRadius: 50,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  progressSection: {
    marginTop: 5,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressIcon: {
    marginLeft: 6,
    opacity: 0.8,
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressPrivacy: {
    borderRadius: 3,
    opacity: 0.2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Notification Inline
  inlinePillContainer: {
    paddingHorizontal: 20,
    marginTop: 0,
    marginBottom: 25,
  },
  nextStepPill: {
    padding: 20,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  pillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  pillBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 5,
    textTransform: 'uppercase',
  },
  pillMateria: {
    color: 'white',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 15,
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  pillFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: 12,
  },
  pillInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillInfoItemSpaced: {
    marginLeft: 16,
  },
  pillInfoText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
    opacity: 0.9,
  },

  // Quick Tasks
  tasksContainer: {},
  taskInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginBottom: 15,
    backgroundColor: 'rgba(150,150,150,0.1)',
    borderRadius: 12,
  },
  taskInput: {
    flex: 1,
    fontSize: 16,
    marginRight: 10,
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  addTaskButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTasks: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    marginBottom: 5,
  },
  emptyTasksText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.5,
  },

  priorityGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tableContainer: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingBottom: 20,
  },
  infoText: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 6,
  },
});
