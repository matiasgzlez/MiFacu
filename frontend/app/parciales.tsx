
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../src/constants/theme';
import { DataRepository } from '../src/services/dataRepository';
import { useAuth } from '../src/context/AuthContext';

const { width, height } = Dimensions.get('window');

// Paleta de colores iOS (Pastel/Vibrant) de Apple design params
const PALETA_COLORES = [
  '#FF9F0A', // Orange
  '#0A84FF', // Blue
  '#FF453A', // Red
  '#30D158', // Green
  '#BF5AF2', // Purple
  '#FF375F', // Pink
  '#64D2FF'  // Cyan
];

export default function ParcialesScreen() {
  const router = useRouter();
  const { isGuest } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);

  // Form State
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');
  const [nuevoTipo, setNuevoTipo] = useState<'Parcial' | 'Entrega'>('Parcial');
  const [nuevoColor, setNuevoColor] = useState(PALETA_COLORES[0]);

  // Cargar datos
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await DataRepository.getRecordatorios(isGuest);

      // Filtrar solo Parciales y Entregas
      const filtrados = data.filter((item: any) =>
        item.tipo === 'Parcial' || item.tipo === 'Entrega' || item.tipo === 'PARCIAL' || item.tipo === 'ENTREGA'
      );

      // Mapear y Ordenar
      const mapped = filtrados.map((item: any) => ({
        id: item.id,
        titulo: item.nombre || item.titulo,
        tipo: item.tipo === 'PARCIAL' ? 'Parcial' : (item.tipo === 'ENTREGA' ? 'Entrega' : item.tipo),
        fechaRaw: item.fecha,
        fecha: formatearFecha(item.fecha),
        hora: item.hora ? item.hora.toString().slice(0, 5) : "00:00",
        color: item.color || theme.tint,
      })).sort((a: any, b: any) => new Date(a.fechaRaw).getTime() - new Date(b.fechaRaw).getTime());

      setEventos(mapped);
    } catch (e) {
      console.error("Error cargando parciales:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isGuest]);

  // Helpers de Fecha
  const formatearFecha = (fechaISO: string | Date) => {
    if (!fechaISO) return '--/--';
    const date = new Date(fechaISO);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  const getTiempoRestante = (fechaRaw: string) => {
    if (!fechaRaw) return "";
    const fechaEvento = new Date(fechaRaw);
    const hoy = new Date();
    const diffTime = fechaEvento.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Finalizado";
    if (diffDays === 0) return "¡Es hoy!";
    if (diffDays === 1) return "Mañana";
    if (diffDays <= 7) return `En ${diffDays} días`;
    return `Faltan ${diffDays} días`;
  };

  // Handlers
  const handleAgregar = async () => {
    if (!nuevoTitulo || nuevaFecha.length < 5) {
      Alert.alert("Faltan datos", "Ingresá un título y una fecha válida (DD/MM)");
      return;
    }

    try {
      // Parsear fecha DD/MM a ISO YYYY-MM-DD
      const [d, m] = nuevaFecha.split('/');
      const year = new Date().getFullYear();

      const isoDate = `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;

      const nuevoEvento = {
        nombre: nuevoTitulo,
        tipo: nuevoTipo,
        fecha: isoDate,
        hora: nuevaHora || "09:00",
        color: nuevoColor,
        materiaNombre: "General"
      };

      await DataRepository.createRecordatorio(isGuest, nuevoEvento);
      setModalVisible(false);

      // Limpiar form
      setNuevoTitulo('');
      setNuevaFecha('');
      setNuevaHora('');

      loadData();
    } catch (error) {
      Alert.alert("Error", "No se pudo crear el evento.");
    }
  };

  const confirmarEliminacion = (id: number) => {
    Alert.alert(
      "Eliminar Evento",
      "¿Estás seguro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await DataRepository.deleteRecordatorio(isGuest, id);
            loadData();
          }
        }
      ]
    );
  };

  // Input manipulators
  const handleChangeFecha = (text: string) => {
    let limpio = text.replace(/[^0-9]/g, '');
    if (limpio.length > 2) limpio = limpio.slice(0, 2) + '/' + limpio.slice(2, 4);
    setNuevaFecha(limpio);
  };

  const handleChangeHora = (text: string) => {
    let limpio = text.replace(/[^0-9]/g, '');
    if (limpio.length > 2) limpio = limpio.slice(0, 2) + ':' + limpio.slice(2, 4);
    setNuevaHora(limpio);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={styles.safeArea}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: theme.backgroundSecondary }]}
          >
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Exámenes y Entregas</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* LIST */}
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {eventos.map((evento) => (
            <TouchableOpacity
              key={evento.id}
              style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}
              onLongPress={() => confirmarEliminacion(evento.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.cardLeftStrip, { backgroundColor: evento.color }]} />

              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={[styles.tagContainer, { backgroundColor: evento.color + '20' }]}>
                    <Text style={[styles.tagText, { color: evento.color }]}>{evento.tipo.toUpperCase()}</Text>
                  </View>
                  <Text style={[styles.daysLeftText, { color: theme.icon }]}>{getTiempoRestante(evento.fechaRaw)}</Text>
                </View>

                <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>{evento.titulo}</Text>

                <View style={styles.cardFooter}>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={14} color={theme.icon} />
                    <Text style={[styles.metaText, { color: theme.icon }]}>{evento.fecha}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color={theme.icon} />
                    <Text style={[styles.metaText, { color: theme.icon }]}>{evento.hora} hs</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity onPress={() => confirmarEliminacion(evento.id)} style={styles.deleteIconBtn}>
                <Ionicons name="trash-outline" size={20} color={theme.icon} style={{ opacity: 0.5 }} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          {eventos.length === 0 && !loading && (
            <View style={styles.emptyContainer}>
              <Ionicons name="sparkles-outline" size={48} color={theme.icon} style={{ opacity: 0.3 }} />
              <Text style={[styles.emptyText, { color: theme.icon }]}>Más libre que nunca.</Text>
              <Text style={[styles.emptySubtext, { color: theme.icon }]}>No tenés parciales ni entregas pendientes.</Text>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* FAB */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.tint, shadowColor: theme.tint }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>

      </SafeAreaView>

      {/* MODAL CREACIÓN */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={[styles.modalContent, { backgroundColor: theme.backgroundSecondary }]}
              >

                {/* Handle Bar */}
                <View style={[styles.modalHandle, { backgroundColor: theme.icon + '40' }]} />

                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>Nuevo Evento</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                    <Ionicons name="close-circle" size={30} color={theme.icon} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

                  {/* TIPO (Segmented Control Style) */}
                  <View style={[styles.segmentedControl, { backgroundColor: theme.separator + '40' }]}>
                    {(['Parcial', 'Entrega'] as const).map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={[
                          styles.segmentBtn,
                          nuevoTipo === t && styles.segmentBtnActive,
                          { backgroundColor: nuevoTipo === t ? theme.background : 'transparent' }
                        ]}
                        onPress={() => setNuevoTipo(t)}
                      >
                        <Text style={[
                          styles.segmentText,
                          { color: nuevoTipo === t ? theme.text : theme.icon, fontWeight: nuevoTipo === t ? '600' : '400' }
                        ]}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* FORM GROUP */}
                  <View style={[styles.formGroup, { backgroundColor: theme.background }]}>
                    {/* TITULO */}
                    <View style={[styles.inputRow, { borderBottomColor: theme.separator }]}>
                      <Text style={[styles.inputLabel, { color: theme.text }]}>Título</Text>
                      <TextInput
                        style={[styles.inputField, { color: theme.text }]}
                        placeholder="Ej: Análisis II"
                        placeholderTextColor={theme.icon}
                        value={nuevoTitulo}
                        onChangeText={setNuevoTitulo}
                      />
                    </View>

                    {/* FECHA */}
                    <View style={[styles.inputRow, { borderBottomColor: theme.separator }]}>
                      <Text style={[styles.inputLabel, { color: theme.text }]}>Fecha</Text>
                      <TextInput
                        style={[styles.inputField, { color: theme.text }]}
                        placeholder="DD/MM"
                        placeholderTextColor={theme.icon}
                        keyboardType="numeric"
                        maxLength={5}
                        value={nuevaFecha}
                        onChangeText={handleChangeFecha}
                      />
                    </View>

                    {/* HORA */}
                    <View style={[styles.inputRow, { borderBottomWidth: 0 }]}>
                      <Text style={[styles.inputLabel, { color: theme.text }]}>Hora</Text>
                      <TextInput
                        style={[styles.inputField, { color: theme.text }]}
                        placeholder="09:00"
                        placeholderTextColor={theme.icon}
                        keyboardType="numeric"
                        maxLength={5}
                        value={nuevaHora}
                        onChangeText={handleChangeHora}
                      />
                    </View>
                  </View>

                  {/* COLOR */}
                  <Text style={[styles.sectionHeader, { color: theme.icon }]}>ETIQUETA</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorRow}>
                    {PALETA_COLORES.map(c => (
                      <TouchableOpacity
                        key={c}
                        style={[styles.colorCircle, { backgroundColor: c }, nuevoColor === c && styles.colorSelected]}
                        onPress={() => setNuevoColor(c)}
                      >
                        {nuevoColor === c && <Ionicons name="checkmark" size={20} color="white" />}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* BOTÓN GUARDAR */}
                  <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: theme.tint }]}
                    onPress={handleAgregar}
                  >
                    <Text style={styles.saveButtonText}>Guardar Evento</Text>
                  </TouchableOpacity>

                  {/* Spacer for keyboard */}
                  <View style={{ height: 20 }} />

                </ScrollView>

              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  listContent: { padding: 20 },

  // CARD
  card: {
    borderRadius: 16, flexDirection: 'row', marginBottom: 15,
    overflow: 'hidden', elevation: 2, shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5
  },
  cardLeftStrip: { width: 6, height: '100%' },
  cardContent: { flex: 1, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  tagContainer: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 10, fontWeight: '800' },
  daysLeftText: { fontSize: 11, fontWeight: '500' },
  cardTitle: { fontSize: 17, fontWeight: '700', marginBottom: 8 },
  cardFooter: { flexDirection: 'row' },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 15 },
  metaText: { fontSize: 12, marginLeft: 4, fontWeight: '500' },
  deleteIconBtn: { padding: 16, justifyContent: 'center' },

  // EMPTY
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 18, fontWeight: '700', marginTop: 15 },
  emptySubtext: { fontSize: 14, marginTop: 5, textAlign: 'center', width: '70%' },

  // FAB
  fab: {
    position: 'absolute', bottom: 30, right: 20,
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5
  },

  // MODAL - iOS Style
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30,
    maxHeight: '90%', // Limit height better
    minHeight: '50%',
  },
  modalHandle: {
    width: 40, height: 5, borderRadius: 3,
    alignSelf: 'center', marginBottom: 15
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10
  },
  modalTitle: { fontSize: 22, fontWeight: '800' },
  closeBtn: { padding: 5 },

  // Segmented Control
  segmentedControl: {
    flexDirection: 'row', borderRadius: 9, padding: 2, marginBottom: 25, height: 36
  },
  segmentBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 7 },
  segmentBtnActive: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  segmentText: { fontSize: 13 },

  // Form Group
  formGroup: { borderRadius: 12, overflow: 'hidden', marginBottom: 25 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 50,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  inputLabel: { width: 80, fontSize: 16, fontWeight: '500' },
  inputField: { flex: 1, fontSize: 16, height: '100%', textAlign: 'right' },

  sectionHeader: { fontSize: 12, fontWeight: '600', marginBottom: 10, marginLeft: 5, textTransform: 'uppercase' },
  colorRow: { flexDirection: 'row', paddingBottom: 10, marginBottom: 15 },
  colorCircle: { width: 44, height: 44, borderRadius: 22, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  colorSelected: { borderWidth: 3, borderColor: 'rgba(150,150,150,0.5)' },

  saveButton: {
    height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    marginTop: 10, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 4, elevation: 4
  },
  saveButtonText: { color: 'white', fontSize: 17, fontWeight: '700' },
});