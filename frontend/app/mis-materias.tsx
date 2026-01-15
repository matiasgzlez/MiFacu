import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  useColorScheme,
  TouchableWithoutFeedback,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export type EstadoMateriaKey = 'no_cursado' | 'cursado' | 'regular' | 'aprobado';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { materiasApi as api } from '../src/services/api';
import { Colors } from '../src/constants/theme';

const { width } = Dimensions.get('window');

// Estados posibles para las materias
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
}

function MisMateriasScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const ESTADOS_MATERIA = getEstadosMateria(theme);

  const [usuarioId, setUsuarioId] = useState<string>('');
  const [misMaterias, setMisMaterias] = useState<UsuarioMateria[]>([]);
  const [materiasDisponibles, setMateriasDisponibles] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [estadoModalVisible, setEstadoModalVisible] = useState(false);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<Materia | null>(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<EstadoMateriaKey>('no_cursado');
  const [materiaEditando, setMateriaEditando] = useState<UsuarioMateria | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Estados para el Horario (solo si está cursando)
  const [dia, setDia] = useState<string>('LU');
  const [horaInicio, setHoraInicio] = useState<string>('18:00');
  const [horaFin, setHoraFin] = useState<string>('20:00');
  const [aula, setAula] = useState<string>('');

  // Cargar datos iniciales
  useFocusEffect(
    React.useCallback(() => {
      cargarDatos();
    }, [])
  );

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Obtener usuario actual
      const userId = await AsyncStorage.getItem('usuario_nombre');
      if (!userId) {
        Alert.alert('Error', 'No se encontró información del usuario');
        router.replace('/');
        return;
      }

      setUsuarioId(userId);

      // Cargar materias del usuario y disponibles
      await Promise.all([
        cargarMisMaterias(userId),
        cargarMateriasDisponibles(userId)
      ]);

    } catch (error) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const cargarMisMaterias = async (userId: string) => {
    try {
      const data = await api.getMateriasByUsuario(userId);

      // Ordenar: 1. Cursando primero, 2. Por número de materia
      const sortedData = data.sort((a: any, b: any) => {
        if (a.estado === 'cursado' && b.estado !== 'cursado') return -1;
        if (a.estado !== 'cursado' && b.estado === 'cursado') return 1;
        return (a.materia.numero || 0) - (b.materia.numero || 0);
      });
      setMisMaterias(sortedData);
    } catch (error: any) {
      console.error('Error cargando mis materias:', error);
      throw error;
    }
  };

  const cargarMateriasDisponibles = async (userId: string) => {
    try {
      const data = await api.getMateriasDisponibles(userId);
      setMateriasDisponibles(data);
    } catch (error: any) {
      console.error('Error cargando materias disponibles:', error);
      throw error;
    }
  };

  const seleccionarMateria = (materia: Materia) => {
    setMateriaSeleccionada(materia);
    setEstadoSeleccionado('no_cursado'); // Estado por defecto
    setDia('LU');
    setHoraInicio('18:00');
    setHoraFin('20:00');
    setAula('');
    setModoEdicion(false);
    setModalVisible(false); // Cerrar primera modal
    setEstadoModalVisible(true); // Abrir segunda modal
  };

  const guardarMateria = async () => {
    if (!materiaSeleccionada) return;

    try {
      setLoadingAction(true);

      // Parsear horas y calcular duración
      const startH = parseInt(horaInicio.split(':')[0]) || 8;
      const endH = parseInt(horaFin.split(':')[0]) || startH + 2;
      const dur = Math.max(1, endH - startH);

      const schedule = estadoSeleccionado === 'cursado' ? {
        dia,
        hora: startH,
        duracion: dur,
        aula
      } : { dia: null, hora: null, duracion: null, aula: null };

      if (modoEdicion && materiaEditando) {
        // Modo edición: actualizar estado
        await api.updateEstadoMateria(usuarioId, materiaEditando.materiaId, estadoSeleccionado, schedule);
        Alert.alert('¡Éxito!', 'Materia actualizada correctamente');
      } else {
        // Modo agregar: crear nueva materia
        await api.addMateriaToUsuario(usuarioId, materiaSeleccionada.id, estadoSeleccionado as any, schedule);
        Alert.alert('¡Éxito!', 'Materia agregada correctamente');
      }

      setEstadoModalVisible(false);
      setMateriaSeleccionada(null);
      setMateriaEditando(null);
      setEstadoSeleccionado('no_cursado');
      setDia('LU');
      setHoraInicio('18:00');
      setHoraFin('20:00');
      setAula('');
      setModoEdicion(false);

      await cargarDatos(); // Recargar datos
    } catch (error: any) {
      console.error('Error guardando materia:', error);
      Alert.alert('Error', error.message || 'No se pudo guardar la materia');
    } finally {
      setLoadingAction(false);
    }
  };

  const cambiarEstado = async (materiaId: number, nuevoEstado: keyof typeof ESTADOS_MATERIA) => {
    try {
      setLoadingAction(true);
      await api.updateEstadoMateria(usuarioId, materiaId, nuevoEstado);
      await cargarDatos(); // Recargar datos
    } catch (error: any) {
      console.error('Error cambiando estado:', error);
      Alert.alert('Error', error.message || 'No se pudo cambiar el estado de la materia');
    } finally {
      setLoadingAction(false);
    }
  };

  const eliminarMateria = async (materiaId: number, nombreMateria: string) => {
    Alert.alert(
      'Eliminar materia',
      `¿Estás seguro de que quieres eliminar "${nombreMateria}" de tus materias?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoadingAction(true);
              await api.removeMateriaFromUsuario(usuarioId, materiaId);
              Alert.alert('¡Éxito!', 'Materia eliminada correctamente');
              await cargarDatos(); // Recargar datos
            } catch (error: any) {
              console.error('Error eliminando materia:', error);
              Alert.alert('Error', error.message || 'No se pudo eliminar la materia');
            } finally {
              setLoadingAction(false);
            }
          }
        }
      ]
    );
  };

  const abrirDetalleMateria = (usuarioMateria: UsuarioMateria) => {
    setMateriaSeleccionada(usuarioMateria.materia);
    setEstadoSeleccionado(usuarioMateria.estado);
    setMateriaEditando(usuarioMateria);
    setDia(usuarioMateria.dia || 'LU');

    const hIni = usuarioMateria.hora || 18;
    const hFin = hIni + (usuarioMateria.duracion || 2);

    setHoraInicio(`${hIni}:00`);
    setHoraFin(`${hFin}:00`);
    setAula(usuarioMateria.aula || '');
    setModoEdicion(true);
    setEstadoModalVisible(true);
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
              <Text style={[styles.tagText, { color: estadoInfo.color }]}>
                {estadoInfo.label.toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => eliminarMateria(item.materiaId, item.materia.nombre)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={18} color={theme.icon} style={{ opacity: 0.6 }} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.materiaNombre, { color: theme.text }]} numberOfLines={1}>
            {item.materia.nombre}
          </Text>

          <View style={styles.cardFooter}>
            <View style={styles.metaItem}>
              <Ionicons name="layers-outline" size={12} color={theme.icon} />
              <Text style={[styles.materiaNivel, { color: theme.icon }]}>
                Nivel {item.materia.nivel || 'N/A'}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="barcode-outline" size={12} color={theme.icon} />
              <Text style={[styles.materiaNivel, { color: theme.icon }]}>
                #{item.materia.numero || 'N/A'}
              </Text>
            </View>
          </View>

          {item.estado === 'cursado' && item.dia && item.hora && (
            <View style={[styles.scheduleBadge, { backgroundColor: theme.background }]}>
              <Ionicons name="time-outline" size={12} color={theme.blue} />
              <Text style={[styles.scheduleText, { color: theme.blue }]}>
                {item.dia} {item.hora}:00 ({item.duracion}hs)
                {item.aula ? ` • ${item.aula}` : ''}
              </Text>
            </View>
          )}
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
      onPress={() => seleccionarMateria(item)}
      disabled={loadingAction}
      activeOpacity={0.7}
    >
      <View style={styles.disponibleInfo}>
        <Text style={[styles.disponibleNombre, { color: theme.text }]}>{item.nombre}</Text>
        <Text style={[styles.disponibleNivel, { color: theme.icon }]}>
          Nivel {item.nivel || 'N/A'} • #{item.numero || 'N/A'}
        </Text>
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
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* HEADER */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: theme.backgroundSecondary }]}
          >
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Mis Materias</Text>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={[styles.backButton, { backgroundColor: theme.backgroundSecondary }]}
          >
            <Ionicons name="add" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* MIS MATERIAS */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.icon }]}>MIS MATERIAS ({misMaterias.length})</Text>
            </View>

            {misMaterias.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: theme.backgroundSecondary }]}>
                <Ionicons name="book-outline" size={48} color={theme.icon} style={{ opacity: 0.3 }} />
                <Text style={[styles.emptyText, { color: theme.text }]}>No tienes materias</Text>
                <Text style={[styles.emptySubtext, { color: theme.icon }]}>Agrega tus primeras materias para comenzar</Text>
              </View>
            ) : (
              <FlatList
                data={misMaterias}
                renderItem={renderMateriaItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* MODAL PARA AGREGAR MATERIAS */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: theme.backgroundSecondary }]}>
                <View style={[styles.modalHandle, { backgroundColor: theme.icon + '40' }]} />
                <View style={styles.modalHeaderStyle}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>Seleccionar Materia</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close-circle" size={30} color={theme.icon} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.modalSubtitle, { color: theme.icon }]}>
                  Elige una materia para continuar ({materiasDisponibles.length} disponibles)
                </Text>

                {materiasDisponibles.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="checkmark-circle" size={48} color={theme.green} />
                    <Text style={[styles.emptyText, { color: theme.text }]}>¡Todo al día!</Text>
                    <Text style={[styles.emptySubtext, { color: theme.icon }]}>Ya tienes todas las materias disponibles</Text>
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
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* MODAL PARA SELECCIONAR ESTADO */}
      <Modal visible={estadoModalVisible} animationType="slide" transparent={true}>
        <TouchableWithoutFeedback onPress={() => setEstadoModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.estadoModalContent, { backgroundColor: theme.backgroundSecondary }]}>
                <View style={[styles.modalHandle, { backgroundColor: theme.icon + '40' }]} />
                <View style={styles.estadoModalHeader}>
                  <TouchableOpacity onPress={() => setEstadoModalVisible(false)}>
                    <Text style={[styles.cancelButton, { color: theme.red }]}>Cancelar</Text>
                  </TouchableOpacity>
                  <Text style={[styles.estadoModalTitle, { color: theme.text }]}>
                    {modoEdicion ? 'Editar' : 'Estado'}
                  </Text>
                  <TouchableOpacity onPress={guardarMateria} disabled={loadingAction}>
                    <Text style={[styles.doneButton, { color: theme.blue }, loadingAction && { opacity: 0.5 }]}>
                      {loadingAction ? '...' : (modoEdicion ? 'Guardar' : 'Agregar')}
                    </Text>
                  </TouchableOpacity>
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

                <ScrollView
                  style={styles.estadoOptionsScrollView}
                  contentContainerStyle={styles.estadoOptionsContent}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={[styles.modalSectionHeader, { color: theme.icon }]}>SELECCIONAR ESTADO</Text>
                  <View style={[styles.formGroup, { backgroundColor: theme.background }]}>
                    {Object.entries(ESTADOS_MATERIA).map(([key, info], index, arr) => (
                      <TouchableOpacity
                        key={key}
                        style={[
                          styles.inputRow,
                          { borderBottomColor: theme.separator, borderBottomWidth: index === arr.length - 1 ? 0 : StyleSheet.hairlineWidth }
                        ]}
                        onPress={() => setEstadoSeleccionado(key as EstadoMateriaKey)}
                        disabled={loadingAction}
                      >
                        <View style={styles.estadoOptionLeft}>
                          <View style={[styles.estadoDot, { backgroundColor: info.color }]} />
                          <Text style={[
                            styles.estadoOptionText,
                            { color: theme.text },
                            estadoSeleccionado === key && { fontWeight: '600' }
                          ]}>
                            {info.label}
                          </Text>
                        </View>
                        {estadoSeleccionado === key && (
                          <Ionicons name="checkmark" size={20} color={theme.blue} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>

                  {estadoSeleccionado === 'cursado' && (
                    <>
                      <Text style={[styles.modalSectionHeader, { color: theme.icon, marginTop: 10 }]}>HORARIO DE CURSADA</Text>
                      <View style={[styles.formGroup, { backgroundColor: theme.background }]}>
                        {/* DÍA */}
                        <View style={[styles.inputRow, { borderBottomColor: theme.separator, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                          <Text style={[styles.inputLabel, { color: theme.text }]}>Día</Text>
                          <View style={styles.daysContainer}>
                            {['LU', 'MA', 'MI', 'JU', 'VI', 'SA'].map((d) => (
                              <TouchableOpacity
                                key={d}
                                onPress={() => setDia(d)}
                                style={[
                                  styles.dayOption,
                                  { backgroundColor: dia === d ? theme.blue : theme.backgroundSecondary }
                                ]}
                              >
                                <Text style={[styles.dayOptionText, { color: dia === d ? '#fff' : theme.text }]}>{d}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>

                        {/* HORA INICIO */}
                        <View style={[styles.inputRow, { borderBottomColor: theme.separator, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                          <Text style={[styles.inputLabel, { color: theme.text }]}>Hora Inicio</Text>
                          <TextInput
                            style={[styles.textInput, { color: theme.text }]}
                            value={horaInicio}
                            onChangeText={setHoraInicio}
                            placeholder="Ej: 17:00 hs"
                            placeholderTextColor={theme.icon}
                          />
                        </View>

                        {/* HORA FIN */}
                        <View style={[styles.inputRow, { borderBottomColor: theme.separator, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                          <Text style={[styles.inputLabel, { color: theme.text }]}>Hora Fin</Text>
                          <TextInput
                            style={[styles.textInput, { color: theme.text }]}
                            value={horaFin}
                            onChangeText={setHoraFin}
                            placeholder="Ej: 21:00 hs"
                            placeholderTextColor={theme.icon}
                          />
                        </View>

                        {/* AULA */}
                        <View style={styles.inputRow}>
                          <Text style={[styles.inputLabel, { color: theme.text }]}>Aula</Text>
                          <TextInput
                            style={[styles.textInput, { color: theme.text }]}
                            value={aula}
                            onChangeText={setAula}
                            placeholder="Ej: 304 o Zoom"
                            placeholderTextColor={theme.icon}
                          />
                        </View>
                      </View>
                    </>
                  )}
                </ScrollView>
                <View style={{ height: 30 }} />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

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
  safeArea: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },

  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 50 },

  section: { marginBottom: 30 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 15, paddingHorizontal: 5
  },
  sectionTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },

  // CARD - iOS Style
  materiaCard: {
    borderRadius: 16, flexDirection: 'row', marginBottom: 12,
    overflow: 'hidden', elevation: 2, shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5
  },
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

  // DISPONIBLE CARD
  disponibleCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 14,
    padding: 16, marginBottom: 10, elevation: 1, shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3
  },
  disponibleInfo: { flex: 1 },
  disponibleNombre: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  disponibleNivel: { fontSize: 13 },

  // EMPTY
  emptyState: {
    alignItems: 'center', padding: 40, borderRadius: 20, marginTop: 10
  },
  emptyText: { fontSize: 18, fontWeight: '700', marginTop: 15 },
  emptySubtext: { fontSize: 14, marginTop: 5, textAlign: 'center', width: '80%', opacity: 0.7 },

  // MODAL - iOS Style
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 30,
    maxHeight: '85%', minHeight: '50%'
  },
  estadoModalContent: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 30,
    height: '95%', // Forzar altura para ocupar casi toda la pantalla
  },
  modalHandle: {
    width: 40, height: 5, borderRadius: 3,
    alignSelf: 'center', marginBottom: 15, marginTop: 5
  },
  modalHeaderStyle: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15
  },
  modalTitle: { fontSize: 22, fontWeight: '800' },
  modalSubtitle: { fontSize: 14, marginBottom: 20, paddingHorizontal: 5 },
  modalList: { flex: 1 },

  // Estado Modal Specific
  estadoModalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20, paddingTop: 5
  },
  estadoModalTitle: { fontSize: 17, fontWeight: '700' },
  cancelButton: { fontSize: 17 },
  doneButton: { fontSize: 17, fontWeight: '600' },

  materiaSeleccionadaContainer: {
    padding: 16, borderRadius: 14, marginBottom: 25,
    flexDirection: 'row', alignItems: 'center'
  },
  materiaSeleccionadaInfo: { flex: 1 },
  materiaSeleccionadaNombre: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  materiaSeleccionadaNivel: { fontSize: 13 },

  estadoOptionsScrollView: { flex: 1 },
  estadoOptionsContent: { paddingBottom: 10 },
  modalSectionHeader: { fontSize: 12, fontWeight: '600', marginBottom: 10, marginLeft: 5, textTransform: 'uppercase' },

  // iOS-like Form Group
  formGroup: { borderRadius: 12, overflow: 'hidden', marginBottom: 25 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 50,
  },
  estadoOptionLeft: { flexDirection: 'row', alignItems: 'center' },
  estadoDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  estadoOptionText: { fontSize: 17 },

  inputLabel: { fontSize: 17, minWidth: 100 },
  textInput: { flex: 1, fontSize: 17, textAlign: 'right' },
  daysContainer: { flexDirection: 'row', flex: 1, justifyContent: 'flex-end' },
  dayOption: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginLeft: 4 },
  dayOptionText: { fontSize: 13, fontWeight: '600' },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center', zIndex: 999
  },
  scheduleBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    marginTop: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(0,122,255,0.2)'
  },
  scheduleText: { fontSize: 11, fontWeight: '600', marginLeft: 4 },
});

export default MisMateriasScreen;
