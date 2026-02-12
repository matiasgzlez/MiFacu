import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  TextInput,
  LayoutAnimation,
  UIManager,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { BlurView } from 'expo-blur';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type EstadoMateriaKey = 'no_cursado' | 'cursado' | 'regular' | 'aprobado';
import type { Schedule } from '../../src/types/models';
import { materiasApi as api } from '../../src/services/api';
import { Colors } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useSaveNotification } from '../../src/context/SaveNotificationContext';
import SpinButton from '../../src/components/ui/spin-button';
import { useMisMaterias, useMateriasDisponibles, useAddMateria, useUpdateEstadoMateria, useRemoveMateria } from '../../src/hooks/useQueries';
import { useRefetchOnFocus } from '../../src/hooks/useRefetchOnFocus';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const getEstadosMateria = (theme: any) => ({
  no_cursado: { label: 'No cursado', color: theme.icon, bgColor: theme.icon + '20' },
  cursado: { label: 'Cursando', color: theme.blue, bgColor: theme.blue + '20' },
  regular: { label: 'Regular', color: theme.orange, bgColor: theme.orange + '20' },
  aprobado: { label: 'Aprobado', color: theme.green, bgColor: theme.green + '20' }
} as const);

interface Materia {
  id: number;
  nombre: string;
  nivel?: string;
  numero?: number;
}

interface UsuarioMateria {
  id: number;
  usuarioId: string;
  materiaId: number;
  estado: EstadoMateriaKey;
  createdAt: string;
  updatedAt: string;
  materia: Materia;
  dia?: string;
  hora?: number;
  duracion?: number;
  aula?: string;
  schedules?: Schedule[];
}

const AnimatedItem = ({ children, index }: { children: React.ReactNode, index?: number }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: (index || 0) * 50, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: (index || 0) * 50, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      {children}
    </Animated.View>
  );
};

export default function MateriasScreen() {
  const router = useRouter();
  const { colorScheme, isDark } = useTheme();
  const theme = Colors[colorScheme];
  const ESTADOS_MATERIA = getEstadosMateria(theme);

  const { user, isGuest } = useAuth();
  const { showNotification } = useSaveNotification();
  const usuarioId = user?.id || (isGuest ? 'guest' : '');

  const misMateriasQuery = useMisMaterias();
  const materiasDisponiblesQuery = useMateriasDisponibles();
  useRefetchOnFocus(misMateriasQuery);
  useRefetchOnFocus(materiasDisponiblesQuery);

  const addMateriaMutation = useAddMateria();
  const updateEstadoMateriaMutation = useUpdateEstadoMateria();
  const removeMateriaMutation = useRemoveMateria();

  const misMaterias = React.useMemo(() => {
    const data = misMateriasQuery.data as UsuarioMateria[] | undefined;
    if (!data) return [];
    return [...data].sort((a: any, b: any) => {
      if (a.estado === 'cursado' && b.estado !== 'cursado') return -1;
      if (a.estado !== 'cursado' && b.estado === 'cursado') return 1;
      return (a.materia.numero || 0) - (b.materia.numero || 0);
    });
  }, [misMateriasQuery.data]);

  const materiasDisponibles = (materiasDisponiblesQuery.data || []) as Materia[];
  const loading = (!misMateriasQuery.data && misMateriasQuery.isLoading);

  const [modalVisible, setModalVisible] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [estadoModalVisible, setEstadoModalVisible] = useState(false);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<Materia | null>(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<EstadoMateriaKey>('no_cursado');
  const [materiaEditando, setMateriaEditando] = useState<UsuarioMateria | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  const [schedules, setSchedules] = useState<Schedule[]>([
    { dia: 'LU', hora: 18, duracion: 2, aula: '' }
  ]);
  const [activeScheduleIndex, setActiveScheduleIndex] = useState(0);

  const [horaInicioDate, setHoraInicioDate] = useState<Date>(() => {
    const d = new Date(); d.setHours(18, 0, 0, 0); return d;
  });
  const [horaFinDate, setHoraFinDate] = useState<Date>(() => {
    const d = new Date(); d.setHours(20, 0, 0, 0); return d;
  });
  const [showInicioTimePicker, setShowInicioTimePicker] = useState(false);
  const [showFinTimePicker, setShowFinTimePicker] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filtroActivo, setFiltroActivo] = useState<'todas' | EstadoMateriaKey>('todas');

  const materiasFiltradas = useMemo(() => {
    let filtered = misMaterias;
    if (filtroActivo !== 'todas' && filtroActivo !== 'no_cursado') {
      filtered = filtered.filter(m => m.estado === filtroActivo);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(m =>
        m.materia.nombre.toLowerCase().includes(query) ||
        m.materia.nivel?.toString().includes(query) ||
        m.materia.numero?.toString().includes(query)
      );
    }
    return filtered;
  }, [misMaterias, searchQuery, filtroActivo]);

  const materiasDisponiblesFiltradas = useMemo(() => {
    if (filtroActivo !== 'no_cursado') return [];
    if (!searchQuery.trim()) return materiasDisponibles;
    const query = searchQuery.toLowerCase().trim();
    return materiasDisponibles.filter(m =>
      m.nombre.toLowerCase().includes(query) ||
      m.nivel?.toString().includes(query) ||
      m.numero?.toString().includes(query)
    );
  }, [materiasDisponibles, searchQuery, filtroActivo]);

  const scrollY = useRef(new Animated.Value(0)).current;
  const modalSheetAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const modalBackdropAnim = useRef(new Animated.Value(0)).current;
  const estadoSheetAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const estadoBackdropAnim = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [40, 70], outputRange: [0, 1], extrapolate: 'clamp',
  });
  const headerLargeOpacity = scrollY.interpolate({
    inputRange: [0, 40], outputRange: [1, 0], extrapolate: 'clamp',
  });

  const triggerHaptic = (type: 'light' | 'medium' | 'success' = 'light') => {
    if (Platform.OS !== 'web') {
      if (type === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      else if (type === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      else if (type === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const animarAbrirModal = (sheetAnim: Animated.Value, backdropAnim: Animated.Value) => {
    Animated.parallel([
      Animated.timing(backdropAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(sheetAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  };

  const animarCerrarModal = (sheetAnim: Animated.Value, backdropAnim: Animated.Value, callback: () => void) => {
    Animated.parallel([
      Animated.timing(backdropAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(sheetAnim, { toValue: SCREEN_HEIGHT, duration: 300, useNativeDriver: true }),
    ]).start(callback);
  };

  const cerrarModalSeleccion = () => {
    animarCerrarModal(modalSheetAnim, modalBackdropAnim, () => setModalVisible(false));
  };

  const cerrarModalEstado = () => {
    animarCerrarModal(estadoSheetAnim, estadoBackdropAnim, () => {
      setEstadoModalVisible(false);
      setMateriaSeleccionada(null);
      setMateriaEditando(null);
      setModoEdicion(false);
    });
  };

  const refreshData = useCallback(async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await Promise.all([
      misMateriasQuery.refetch(),
      materiasDisponiblesQuery.refetch(),
    ]);
  }, [misMateriasQuery.refetch, materiasDisponiblesQuery.refetch]);

  // ─── Schedule helpers ───
  const MAX_SCHEDULES = 3;

  const addScheduleBlock = () => {
    if (schedules.length >= MAX_SCHEDULES) return;
    triggerHaptic();
    setSchedules(prev => [...prev, { dia: 'LU', hora: 18, duracion: 2, aula: '' }]);
    setActiveScheduleIndex(schedules.length);
  };

  const removeScheduleBlock = (index: number) => {
    if (schedules.length <= 1) return;
    triggerHaptic();
    setSchedules(prev => prev.filter((_, i) => i !== index));
    setActiveScheduleIndex(prev => Math.min(prev, schedules.length - 2));
  };

  const updateScheduleField = (index: number, field: keyof Schedule, value: any) => {
    setSchedules(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  // ─── Conflict validation ───
  const timeBlocksOverlap = (
    a: { dia: string; hora: number; duracion: number },
    b: { dia: string; hora: number; duracion: number }
  ): boolean => {
    if (a.dia !== b.dia) return false;
    const aEnd = a.hora + a.duracion;
    const bEnd = b.hora + b.duracion;
    return a.hora < bEnd && b.hora < aEnd;
  };

  const getConflictForBlock = (index: number): string | null => {
    const block = schedules[index];
    // Internal conflict (same materia)
    for (let i = 0; i < schedules.length; i++) {
      if (i === index) continue;
      if (timeBlocksOverlap(block, schedules[i])) {
        return `Se superpone con Horario ${i + 1}`;
      }
    }
    // External conflict (other materias)
    const currentMateriaId = materiaEditando?.materiaId ?? materiaSeleccionada?.id;
    const allMaterias = (misMateriasQuery.data as UsuarioMateria[] | undefined) || [];
    for (const m of allMaterias) {
      if (m.materiaId === currentMateriaId) continue;
      if (m.estado !== 'cursado') continue;
      const otherSchedules: Schedule[] = m.schedules?.length
        ? m.schedules
        : (m.dia && m.hora != null ? [{ dia: m.dia, hora: m.hora, duracion: m.duracion || 2, aula: m.aula }] : []);
      for (const other of otherSchedules) {
        if (timeBlocksOverlap(block, { dia: other.dia, hora: other.hora, duracion: other.duracion })) {
          return `Conflicto con ${m.materia.nombre} (${other.dia} ${other.hora}:00)`;
        }
      }
    }
    return null;
  };

  const onHoraInicioChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android' || event.type === 'set' || event.type === 'dismissed') {
      setShowInicioTimePicker(false);
    }
    if (selectedDate && event.type !== 'dismissed') {
      setHoraInicioDate(selectedDate);
      const newHora = selectedDate.getHours();
      const currentSched = schedules[activeScheduleIndex];
      const currentEnd = currentSched.hora + currentSched.duracion;
      if (newHora >= currentEnd) {
        updateScheduleField(activeScheduleIndex, 'hora', newHora);
        updateScheduleField(activeScheduleIndex, 'duracion', 2);
      } else {
        updateScheduleField(activeScheduleIndex, 'hora', newHora);
        updateScheduleField(activeScheduleIndex, 'duracion', currentEnd - newHora);
      }
    }
  };

  const onHoraFinChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android' || event.type === 'set' || event.type === 'dismissed') {
      setShowFinTimePicker(false);
    }
    if (selectedDate && event.type !== 'dismissed') {
      setHoraFinDate(selectedDate);
      const endH = selectedDate.getHours();
      const startH = schedules[activeScheduleIndex].hora;
      const dur = Math.max(1, endH - startH);
      updateScheduleField(activeScheduleIndex, 'duracion', dur);
    }
  };

  const seleccionarMateria = (materia: Materia) => {
    setMateriaSeleccionada(materia);
    setEstadoSeleccionado('cursado');
    setSchedules([{ dia: 'LU', hora: 18, duracion: 2, aula: '' }]);
    setActiveScheduleIndex(0);
    setModoEdicion(false);

    const initDate = new Date(); initDate.setHours(18, 0, 0, 0); setHoraInicioDate(initDate);
    const endDate = new Date(); endDate.setHours(20, 0, 0, 0); setHoraFinDate(endDate);

    animarCerrarModal(modalSheetAnim, modalBackdropAnim, () => {
      setModalVisible(false);
      setEstadoModalVisible(true);
      animarAbrirModal(estadoSheetAnim, estadoBackdropAnim);
    });
  };

  const guardarMateria = async () => {
    if (!materiaSeleccionada) return;

    // Validar conflictos antes de guardar
    if (estadoSeleccionado === 'cursado') {
      for (let i = 0; i < schedules.length; i++) {
        const conflict = getConflictForBlock(i);
        if (conflict) {
          Alert.alert('Conflicto de horario', conflict);
          return;
        }
      }
    }

    try {
      setLoadingAction(true);

      const schedule = estadoSeleccionado === 'cursado'
        ? {
            schedules: schedules.map(s => ({
              dia: s.dia,
              hora: s.hora,
              duracion: s.duracion,
              aula: (typeof s.aula === 'string' ? s.aula.trim() : null) || null,
            }))
          }
        : { schedules: [], dia: null, hora: null, duracion: null, aula: null };

      if (modoEdicion && materiaEditando) {
        await updateEstadoMateriaMutation.mutateAsync({ materiaId: materiaEditando.materiaId, estado: estadoSeleccionado, schedule });
        triggerHaptic('success');
      } else {
        await addMateriaMutation.mutateAsync({ materiaId: materiaSeleccionada.id, estado: estadoSeleccionado, schedule });
        triggerHaptic('success');
      }
      setModoEdicion(false);
      cerrarModalEstado();
      showNotification(modoEdicion ? 'Materia actualizada' : 'Materia agregada');
    } catch (error: any) {
      showNotification(error.message || 'No se pudo guardar la materia', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const eliminarMateria = async (materiaId: number) => {
    try {
      setLoadingAction(true);
      await removeMateriaMutation.mutateAsync(materiaId);
      triggerHaptic('success');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo eliminar la materia');
    } finally {
      setLoadingAction(false);
    }
  };

  const confirmarEliminar = (materiaId: number, nombre: string) => {
    Alert.alert('Eliminar materia', `¿Estás seguro de eliminar "${nombre}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => eliminarMateria(materiaId) }
    ]);
  };

  const abrirDetalleMateria = (usuarioMateria: UsuarioMateria) => {
    setMateriaSeleccionada(usuarioMateria.materia);
    setEstadoSeleccionado(usuarioMateria.estado);
    setMateriaEditando(usuarioMateria);

    // Load schedules from array if available, else fallback to flat columns
    if (usuarioMateria.schedules && usuarioMateria.schedules.length > 0) {
      setSchedules(usuarioMateria.schedules.map(s => ({
        dia: s.dia || 'LU',
        hora: s.hora ?? 18,
        duracion: s.duracion ?? 2,
        aula: s.aula || '',
      })));
    } else if (usuarioMateria.dia && usuarioMateria.hora != null) {
      setSchedules([{
        dia: usuarioMateria.dia,
        hora: usuarioMateria.hora,
        duracion: usuarioMateria.duracion || 2,
        aula: usuarioMateria.aula || '',
      }]);
    } else {
      setSchedules([{ dia: 'LU', hora: 18, duracion: 2, aula: '' }]);
    }
    setActiveScheduleIndex(0);

    const firstHora = usuarioMateria.schedules?.[0]?.hora ?? usuarioMateria.hora ?? 18;
    const firstDur = usuarioMateria.schedules?.[0]?.duracion ?? usuarioMateria.duracion ?? 2;
    const initDate = new Date(); initDate.setHours(firstHora, 0, 0, 0); setHoraInicioDate(initDate);
    const endDate = new Date(); endDate.setHours(firstHora + firstDur, 0, 0, 0); setHoraFinDate(endDate);

    setModoEdicion(true);
    setEstadoModalVisible(true);
    animarAbrirModal(estadoSheetAnim, estadoBackdropAnim);
  };

  const renderMateriaItem = ({ item }: { item: UsuarioMateria }) => {
    const estadoInfo = ESTADOS_MATERIA[item.estado];
    return (
      <TouchableOpacity
        style={[styles.materiaCard, { backgroundColor: theme.backgroundSecondary }]}
        onPress={() => abrirDetalleMateria(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.cardLeftStrip, { backgroundColor: estadoInfo.color }]} />
        <View style={styles.cardMainContent}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.tagContainer, { backgroundColor: estadoInfo.bgColor }]}>
              <Text style={[styles.tagText, { color: estadoInfo.color }]}>{estadoInfo.label.toUpperCase()}</Text>
            </View>
            <TouchableOpacity onPress={() => confirmarEliminar(item.materiaId, item.materia.nombre)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="trash-outline" size={18} color={theme.icon} style={{ opacity: 0.6 }} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.materiaNombre, { color: theme.text }]} numberOfLines={1}>{item.materia.nombre}</Text>
          <View style={styles.cardFooter}>
            <View style={styles.metaItem}>
              <Ionicons name="layers-outline" size={12} color={theme.icon} />
              <Text style={[styles.materiaNivel, { color: theme.icon }]}>Nivel {item.materia.nivel || 'N/A'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="barcode-outline" size={12} color={theme.icon} />
              <Text style={[styles.materiaNivel, { color: theme.icon }]}>#{item.materia.numero || 'N/A'}</Text>
            </View>
          </View>
          {item.estado === 'cursado' && (() => {
            const scheds: Schedule[] = item.schedules?.length
              ? item.schedules
              : (item.dia && item.hora != null ? [{ dia: item.dia!, hora: item.hora!, duracion: item.duracion || 2, aula: item.aula }] : []);
            return scheds.map((s, idx) => (
              <View key={idx} style={[styles.scheduleBadge, { backgroundColor: theme.background }]}>
                <Ionicons name="time-outline" size={12} color={theme.blue} />
                <Text style={[styles.scheduleText, { color: theme.blue }]}>
                  {s.dia} {s.hora}:00 ({s.duracion}hs){s.aula ? ` \u2022 ${s.aula}` : ''}
                </Text>
              </View>
            ));
          })()}
        </View>
        <View style={styles.chevronContainer}>
          <Ionicons name="chevron-forward" size={18} color={theme.icon} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderMateriaDisponible = ({ item }: { item: Materia }) => (
    <TouchableOpacity
      style={[styles.disponibleCard, { backgroundColor: theme.backgroundSecondary }]}
      onPress={() => { triggerHaptic(); seleccionarMateria(item); }}
      disabled={loadingAction}
      activeOpacity={0.7}
    >
      <View style={styles.disponibleInfo}>
        <Text style={[styles.disponibleNombre, { color: theme.text }]}>{item.nombre}</Text>
        <Text style={[styles.disponibleNivel, { color: theme.icon }]}>Nivel {item.nivel || 'N/A'} • #{item.numero || 'N/A'}</Text>
      </View>
      <Ionicons name="add-circle-outline" size={24} color={theme.blue} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
        <Text style={[styles.loadingText, { color: theme.icon }]}>Cargando tus materias...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* STICKY HEADER */}
      <Animated.View style={[styles.headerInline, { opacity: headerOpacity }]}>
        <BlurView intensity={80} tint={colorScheme} style={StyleSheet.absoluteFill} />
        <View style={[styles.headerBorder, { borderBottomColor: theme.separator }]} />
        <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
          <View style={styles.headerInlineContent}>
            <Text style={[styles.headerInlineTitle, { color: theme.text }]}>Materias</Text>
            <TouchableOpacity
              onPress={() => {
                triggerHaptic('medium');
                setModalVisible(true);
                animarAbrirModal(modalSheetAnim, modalBackdropAnim);
              }}
              style={styles.headerBtn}
            >
              <Ionicons name="add" size={28} color={theme.blue} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        {/* LARGE TITLE HEADER */}
        <Animated.View style={[styles.headerLarge, { opacity: headerLargeOpacity }]}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerTopRow}>
              <Text style={[styles.headerLargeTitle, { color: theme.text }]}>Materias</Text>
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic('medium');
                  setModalVisible(true);
                  animarAbrirModal(modalSheetAnim, modalBackdropAnim);
                }}
                style={[styles.circularBtn, { backgroundColor: theme.tint + '15' }]}
              >
                <Ionicons name="add" size={28} color={theme.blue} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>

        {/* BÚSQUEDA Y FILTROS */}
        <View style={styles.searchSection}>
          <View style={[styles.searchContainer, { backgroundColor: theme.backgroundSecondary }]}>
            <Ionicons name="search" size={18} color={theme.icon} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Buscar materia..."
              placeholderTextColor={theme.icon}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close-circle" size={18} color={theme.icon} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll} contentContainerStyle={styles.filtersContent}>
            <TouchableOpacity
              onPress={() => { triggerHaptic(); setFiltroActivo('todas'); }}
              style={[styles.filterChip, { backgroundColor: filtroActivo === 'todas' ? theme.blue : theme.backgroundSecondary }]}
            >
              <Text style={[styles.filterChipText, { color: filtroActivo === 'todas' ? '#fff' : theme.text }]}>Todas</Text>
            </TouchableOpacity>
            {Object.entries(ESTADOS_MATERIA).map(([key, info]) => (
              <TouchableOpacity
                key={key}
                onPress={() => { triggerHaptic(); setFiltroActivo(key as EstadoMateriaKey); }}
                style={[styles.filterChip, { backgroundColor: filtroActivo === key ? info.color : theme.backgroundSecondary }]}
              >
                <Text style={[styles.filterChipText, { color: filtroActivo === key ? '#fff' : theme.text }]}>{info.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* MIS MATERIAS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.icon }]}>
              {filtroActivo === 'todas' ? 'MIS MATERIAS' : filtroActivo === 'no_cursado' ? `NO CURSADAS (${materiasDisponiblesFiltradas.length})` : `${ESTADOS_MATERIA[filtroActivo].label.toUpperCase()} (${materiasFiltradas.length})`}
            </Text>
          </View>

          {filtroActivo === 'no_cursado' ? (
            materiasDisponiblesFiltradas.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: theme.backgroundSecondary }]}>
                <Ionicons name="checkmark-circle" size={48} color={theme.green} />
                <Text style={[styles.emptyText, { color: theme.text }]}>Ya tienes todas las materias</Text>
                <Text style={[styles.emptySubtext, { color: theme.icon }]}>No quedan materias disponibles</Text>
              </View>
            ) : (
              materiasDisponiblesFiltradas.map((item, index) => (
                <AnimatedItem key={item.id} index={index}>
                  {renderMateriaDisponible({ item })}
                </AnimatedItem>
              ))
            )
          ) : materiasFiltradas.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.backgroundSecondary }]}>
              {misMaterias.length === 0 ? (
                <>
                  <Ionicons name="book-outline" size={48} color={theme.icon} style={{ opacity: 0.3 }} />
                  <Text style={[styles.emptyText, { color: theme.text }]}>No tienes materias</Text>
                  <Text style={[styles.emptySubtext, { color: theme.icon }]}>Agrega tus primeras materias para comenzar</Text>
                </>
              ) : (
                <>
                  <Ionicons name="search-outline" size={48} color={theme.icon} style={{ opacity: 0.3 }} />
                  <Text style={[styles.emptyText, { color: theme.text }]}>Sin resultados</Text>
                  <Text style={[styles.emptySubtext, { color: theme.icon }]}>No hay materias que coincidan</Text>
                </>
              )}
            </View>
          ) : (
            materiasFiltradas.map((item, index) => (
              <AnimatedItem key={item.id} index={index}>
                {renderMateriaItem({ item })}
              </AnimatedItem>
            ))
          )}
        </View>

        <View style={{ height: 120 }} />
      </Animated.ScrollView>

      {/* MODAL PARA AGREGAR MATERIAS */}
      {modalVisible && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <TouchableWithoutFeedback onPress={cerrarModalSeleccion}>
            <Animated.View style={[styles.modalOverlay, { opacity: modalBackdropAnim }]}>
              <TouchableWithoutFeedback>
                <Animated.View style={[styles.modalContent, { backgroundColor: theme.backgroundSecondary, transform: [{ translateY: modalSheetAnim }] }]}>
                  <View style={[styles.modalHandle, { backgroundColor: theme.separator }]} />
                  <View style={styles.estadoModalHeader}>
                    <TouchableOpacity onPress={cerrarModalSeleccion}>
                      <Text style={[styles.cancelButton, { color: theme.red }]}>Cerrar</Text>
                    </TouchableOpacity>
                    <Text style={[styles.estadoModalTitle, { color: theme.text }]}>Seleccionar Materia</Text>
                    <View style={{ width: 60 }} />
                  </View>
                  <Text style={[styles.modalSubtitle, { color: theme.icon }]}>
                    Elige una materia ({materiasDisponibles.length} disponibles)
                  </Text>
                  {materiasDisponibles.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Ionicons name="checkmark-circle" size={48} color={theme.green} />
                      <Text style={[styles.emptyText, { color: theme.text }]}>¡Todo al día!</Text>
                      <Text style={[styles.emptySubtext, { color: theme.icon }]}>Ya tienes todas las materias</Text>
                    </View>
                  ) : (
                    <FlatList
                      data={materiasDisponibles}
                      renderItem={renderMateriaDisponible}
                      keyExtractor={(item) => item.id.toString()}
                      style={styles.modalList}
                      showsVerticalScrollIndicator={false}
                    />
                  )}
                  <View style={{ height: 30 }} />
                </Animated.View>
              </TouchableWithoutFeedback>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      )}

      {/* MODAL PARA SELECCIONAR ESTADO */}
      {estadoModalVisible && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={cerrarModalEstado}>
              <Animated.View style={[styles.modalOverlay, { opacity: estadoBackdropAnim }]}>
                <TouchableWithoutFeedback>
                  <Animated.View style={[styles.estadoModalContent, { backgroundColor: theme.backgroundSecondary, transform: [{ translateY: estadoSheetAnim }] }]}>
                    <View style={[styles.modalHandle, { backgroundColor: theme.icon + '40' }]} />
                    <View style={styles.estadoModalHeader}>
                      <TouchableOpacity onPress={cerrarModalEstado}>
                        <Text style={[styles.cancelButton, { color: theme.red }]}>Cancelar</Text>
                      </TouchableOpacity>
                      <Text style={[styles.estadoModalTitle, { color: theme.text }]}>{modoEdicion ? 'Editar' : 'Estado'}</Text>
                      <SpinButton
                        idleText={modoEdicion ? 'Guardar' : 'Agregar'}
                        activeText="Guardando"
                        controlled
                        isActive={loadingAction}
                        disabled={loadingAction}
                        onPress={() => guardarMateria()}
                        colors={{
                          idle: { background: theme.blue, text: '#FFFFFF' },
                          active: { background: theme.blue, text: '#FFFFFF' },
                        }}
                        buttonStyle={{
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 20,
                          fontSize: 14,
                          fontWeight: '600',
                        }}
                        spinnerConfig={{
                          size: 14,
                          strokeWidth: 1.5,
                          color: '#FFFFFF',
                          containerSize: 24,
                          containerBackground: theme.blue,
                          position: { right: -8, bottom: 14 },
                        }}
                      />
                    </View>

                    {materiaSeleccionada && (
                      <View style={[styles.materiaSeleccionadaContainer, { backgroundColor: theme.background }]}>
                        <View style={styles.materiaSeleccionadaInfo}>
                          <Text style={[styles.materiaSeleccionadaNombre, { color: theme.text }]}>{materiaSeleccionada.nombre}</Text>
                          <Text style={[styles.materiaSeleccionadaNivel, { color: theme.icon }]}>
                            Nivel {materiaSeleccionada.nivel || 'N/A'} • #{materiaSeleccionada.numero || 'N/A'}
                          </Text>
                        </View>
                      </View>
                    )}

                    <ScrollView style={styles.estadoOptionsScrollView} contentContainerStyle={styles.estadoOptionsContent} showsVerticalScrollIndicator={false}>
                      <Text style={[styles.modalSectionHeader, { color: theme.icon }]}>SELECCIONAR ESTADO</Text>
                      <View style={[styles.formGroup, { backgroundColor: theme.background }]}>
                        {Object.entries(ESTADOS_MATERIA).filter(([key]) => modoEdicion || key !== 'no_cursado').map(([key, info], index, arr) => (
                          <TouchableOpacity
                            key={key}
                            style={[styles.inputRow, { borderBottomColor: theme.separator, borderBottomWidth: index === arr.length - 1 ? 0 : StyleSheet.hairlineWidth }]}
                            onPress={() => { triggerHaptic(); setEstadoSeleccionado(key as EstadoMateriaKey); }}
                            disabled={loadingAction}
                          >
                            <View style={styles.estadoOptionLeft}>
                              <View style={[styles.estadoDot, { backgroundColor: info.color }]} />
                              <Text style={[styles.estadoOptionText, { color: theme.text }, estadoSeleccionado === key && { fontWeight: '600' }]}>{info.label}</Text>
                            </View>
                            {estadoSeleccionado === key && <Ionicons name="checkmark" size={20} color={theme.blue} />}
                          </TouchableOpacity>
                        ))}
                      </View>

                      {estadoSeleccionado === 'cursado' && (
                        <>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 10, paddingHorizontal: 5 }}>
                            <Text style={[styles.modalSectionHeader, { color: theme.icon, marginBottom: 0 }]}>HORARIOS DE CURSADA ({schedules.length})</Text>
                            {schedules.length < MAX_SCHEDULES && (
                              <TouchableOpacity onPress={addScheduleBlock} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Ionicons name="add-circle" size={24} color={theme.blue} />
                              </TouchableOpacity>
                            )}
                          </View>

                          {schedules.map((sched, idx) => {
                            const conflict = getConflictForBlock(idx);
                            const endHour = sched.hora + sched.duracion;

                            return (
                              <View key={idx} style={[styles.formGroup, { backgroundColor: theme.background, marginBottom: 12 }]}>
                                <View style={[styles.inputRow, { borderBottomColor: theme.separator, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                                  <Text style={[styles.inputLabel, { color: theme.text, fontWeight: '700' }]}>Horario {idx + 1}</Text>
                                  {schedules.length > 1 && (
                                    <TouchableOpacity onPress={() => removeScheduleBlock(idx)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                      <Ionicons name="close-circle" size={22} color={theme.red} />
                                    </TouchableOpacity>
                                  )}
                                </View>

                                <View style={[styles.inputRow, { borderBottomColor: theme.separator, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                                  <Text style={[styles.inputLabel, { color: theme.text }]}>Dia</Text>
                                  <View style={styles.daysContainer}>
                                    {['LU', 'MA', 'MI', 'JU', 'VI', 'SA'].map((d) => (
                                      <TouchableOpacity
                                        key={d}
                                        onPress={() => { triggerHaptic(); updateScheduleField(idx, 'dia', d); }}
                                        style={[styles.dayOption, { backgroundColor: sched.dia === d ? theme.blue : theme.backgroundSecondary }]}
                                      >
                                        <Text style={[styles.dayOptionText, { color: sched.dia === d ? '#fff' : theme.text }]}>{d}</Text>
                                      </TouchableOpacity>
                                    ))}
                                  </View>
                                </View>

                                <View style={[styles.inputRow, { borderBottomColor: theme.separator, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                                  <Text style={[styles.inputLabel, { color: theme.text }]}>Hora Inicio</Text>
                                  <TouchableOpacity
                                    onPress={() => {
                                      setActiveScheduleIndex(idx);
                                      const d = new Date(); d.setHours(sched.hora, 0, 0, 0); setHoraInicioDate(d);
                                      setShowInicioTimePicker(true);
                                    }}
                                    style={styles.timeButton}
                                  >
                                    <Text style={[styles.timeButtonText, { color: conflict ? theme.red : theme.blue }]}>
                                      {conflict ? '--:--' : `${sched.hora.toString().padStart(2, '0')}:00`}
                                    </Text>
                                  </TouchableOpacity>
                                </View>

                                <View style={[styles.inputRow, { borderBottomColor: theme.separator, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                                  <Text style={[styles.inputLabel, { color: theme.text }]}>Hora Fin</Text>
                                  <TouchableOpacity
                                    onPress={() => {
                                      setActiveScheduleIndex(idx);
                                      const d = new Date(); d.setHours(endHour, 0, 0, 0); setHoraFinDate(d);
                                      setShowFinTimePicker(true);
                                    }}
                                    style={styles.timeButton}
                                  >
                                    <Text style={[styles.timeButtonText, { color: conflict ? theme.red : theme.blue }]}>
                                      {conflict ? '--:--' : `${endHour.toString().padStart(2, '0')}:00`}
                                    </Text>
                                  </TouchableOpacity>
                                </View>

                                <View style={styles.inputRow}>
                                  <Text style={[styles.inputLabel, { color: theme.text }]}>Aula</Text>
                                  <TextInput
                                    style={[styles.textInput, { color: theme.text }]}
                                    value={sched.aula || ''}
                                    onChangeText={(val) => updateScheduleField(idx, 'aula', val)}
                                    placeholder="Ej: 304"
                                    placeholderTextColor={theme.icon}
                                  />
                                </View>

                                {conflict && (
                                  <View style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: theme.red + '10', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
                                    <Text style={{ color: theme.red, fontSize: 12, fontWeight: '600' }}>{conflict}</Text>
                                  </View>
                                )}
                              </View>
                            );
                          })}

                          {showInicioTimePicker && (
                            <DateTimePicker value={horaInicioDate} mode="time" is24Hour={true} display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onHoraInicioChange} minuteInterval={30} />
                          )}
                          {showFinTimePicker && (
                            <DateTimePicker value={horaFinDate} mode="time" is24Hour={true} display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onHoraFinChange} minuteInterval={30} />
                          )}
                        </>
                      )}
                    </ScrollView>
                    <View style={{ height: 30 }} />
                  </Animated.View>
                </TouchableWithoutFeedback>
              </Animated.View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      )}

      {loadingAction && (
        <View style={[styles.loadingOverlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
          <ActivityIndicator size="large" color={theme.tint} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  section: { marginBottom: 30, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingHorizontal: 5 },
  sectionTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },

  materiaCard: { borderRadius: 16, flexDirection: 'row', marginBottom: 12, overflow: 'hidden', elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  cardLeftStrip: { width: 6, height: '100%' },
  cardMainContent: { flex: 1, padding: 16 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  tagContainer: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 10, fontWeight: '800' },
  materiaNombre: { fontSize: 17, fontWeight: '700', marginBottom: 6 },
  cardFooter: { flexDirection: 'row' },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 15 },
  materiaNivel: { fontSize: 12, marginLeft: 4, fontWeight: '500' },
  chevronContainer: { paddingRight: 12, justifyContent: 'center' },

  disponibleCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 16, marginBottom: 10, elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3 },
  disponibleInfo: { flex: 1 },
  disponibleNombre: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  disponibleNivel: { fontSize: 13 },

  emptyState: { alignItems: 'center', padding: 40, borderRadius: 20, marginTop: 10 },
  emptyText: { fontSize: 18, fontWeight: '700', marginTop: 15 },
  emptySubtext: { fontSize: 14, marginTop: 5, textAlign: 'center', width: '80%', opacity: 0.7 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 30, maxHeight: '85%', minHeight: '50%' },
  estadoModalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 30, height: '95%' },
  modalHandle: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: 15, marginTop: 5 },
  modalSubtitle: { fontSize: 14, marginBottom: 20, paddingHorizontal: 5 },
  modalList: { flex: 1 },

  estadoModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingTop: 5 },
  estadoModalTitle: { fontSize: 17, fontWeight: '700' },
  cancelButton: { fontSize: 17 },
  doneButton: { fontSize: 17, fontWeight: '600' },

  materiaSeleccionadaContainer: { padding: 16, borderRadius: 14, marginBottom: 25, flexDirection: 'row', alignItems: 'center' },
  materiaSeleccionadaInfo: { flex: 1 },
  materiaSeleccionadaNombre: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  materiaSeleccionadaNivel: { fontSize: 13 },

  estadoOptionsScrollView: { flex: 1 },
  estadoOptionsContent: { paddingBottom: 10 },
  modalSectionHeader: { fontSize: 12, fontWeight: '600', marginBottom: 10, marginLeft: 5, textTransform: 'uppercase' },

  formGroup: { borderRadius: 12, overflow: 'hidden', marginBottom: 25 },
  inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 50 },
  estadoOptionLeft: { flexDirection: 'row', alignItems: 'center' },
  estadoDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  estadoOptionText: { fontSize: 17 },

  inputLabel: { fontSize: 17, minWidth: 100 },
  textInput: { flex: 1, fontSize: 17, textAlign: 'right' },
  daysContainer: { flexDirection: 'row', flex: 1, justifyContent: 'flex-end' },
  timeButton: { paddingVertical: 8, paddingHorizontal: 12 },
  timeButtonText: { fontSize: 17, fontWeight: '500' },
  dayOption: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginLeft: 4 },
  dayOptionText: { fontSize: 13, fontWeight: '600' },

  loadingOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 999 },
  scheduleBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(0,122,255,0.2)' },
  scheduleText: { fontSize: 11, fontWeight: '600', marginLeft: 4 },

  // Header styles
  headerInline: { position: 'absolute', top: 0, left: 0, right: 0, height: Platform.OS === 'ios' ? 100 : 70, zIndex: 100, overflow: 'hidden' },
  headerBorder: { position: 'absolute', bottom: 0, left: 0, right: 0, height: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth },
  headerSafeArea: { flex: 1 },
  headerInlineContent: { flex: 1, paddingTop: Platform.OS === 'ios' ? 45 : 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  headerInlineTitle: { fontSize: 17, fontWeight: '700' },
  headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },

  searchSection: { paddingHorizontal: 20, marginBottom: 15 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, height: 44, marginBottom: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, height: '100%' },
  filtersScroll: { marginHorizontal: -20 },
  filtersContent: { paddingHorizontal: 20, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  filterChipText: { fontSize: 14, fontWeight: '600' },

  headerLarge: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 15 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  circularBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  headerLargeTitle: { fontSize: 34, fontWeight: '800', letterSpacing: 0.37 },
});
