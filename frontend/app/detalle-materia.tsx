import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { materiasApi } from '../src/services/api';
import { DataRepository } from '../src/services/dataRepository';
import { useAuth } from '../src/context/AuthContext';
import { Colors } from '../src/constants/theme';
import { AnimatedHeaderScrollView } from '../src/components/ui/animated-header-scrollview';

const MESES_CORTOS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

const getTiempoRestante = (fechaStr: string) => {
  const fecha = new Date(fechaStr);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Finalizado';
  if (diffDays === 0) return '¡Hoy!';
  if (diffDays === 1) return 'Mañana';
  return `En ${diffDays} días`;
};

interface Examen {
  id: number;
  titulo: string;
  tipo: string;
  fecha: string;
  hora: string;
  color: string;
  dia: number;
  mes: number;
  mesLabel: string;
}

interface Materia {
  id: number;
  nombre: string;
  nivel: number;
  estado: string;
  dia?: string;
  hora?: number;
  aula?: string;
}

export default function DetalleMateriaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id } = params as { id: string };

  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme];

  const { isGuest, user } = useAuth();
  const [materia, setMateria] = useState<Materia | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  const [nuevoDia, setNuevoDia] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');
  const [nuevaAula, setNuevaAula] = useState('');

  const [examenes, setExamenes] = useState<Examen[]>([]);

  const loadMateria = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await materiasApi.getMateriasByUsuario(user?.id);
      const item = data.find((um: any) => um.materiaId.toString() === id.toString());

      if (item) {
        setMateria({
          id: item.materiaId,
          nombre: item.materia.nombre,
          nivel: parseInt(item.materia.nivel) || 1,
          estado: item.estado,
          dia: item.dia,
          hora: item.hora,
          aula: item.aula
        });
        setNuevoDia(item.dia || 'LU');
        setNuevaHora(item.hora?.toString() || '18');
        setNuevaAula(item.aula || 'Sin aula');
      }

      try {
        const allRecordatorios = await DataRepository.getRecordatorios();
        const filtered = (allRecordatorios || [])
          .filter((r: any) => {
            const tipoLower = (r.tipo || '').toLowerCase();
            const matchesTipo = tipoLower === 'parcial' || tipoLower === 'entrega';
            const matchesMateria = r.materiaId?.toString() === id.toString();
            return matchesTipo && matchesMateria;
          })
          .map((r: any) => {
            const fecha = new Date(r.fecha);
            return {
              id: r.id,
              titulo: r.nombre || r.titulo,
              tipo: (r.tipo || '').charAt(0).toUpperCase() + (r.tipo || '').slice(1).toLowerCase(),
              fecha: r.fecha,
              hora: r.hora ? r.hora.toString().slice(0, 5) : '09:00',
              color: r.color || '#0A84FF',
              dia: fecha.getDate(),
              mes: fecha.getMonth(),
              mesLabel: MESES_CORTOS[fecha.getMonth()] || '',
            };
          })
          .sort((a: Examen, b: Examen) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

        setExamenes(filtered);
      } catch (err) {
        console.error('Error cargando exámenes:', err);
      }
    } catch (e) {
      console.error("Error cargando materia:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMateria();
  }, [id, isGuest]);

  const handleGuardar = async () => {
    const horaNum = parseInt(nuevaHora);
    if (isNaN(horaNum) || horaNum < 8 || horaNum > 23) return Alert.alert("Hora inválida", "La facultad abre de 8 a 23.");

    try {
      if (materia) {
        await materiasApi.updateEstadoMateria(user?.id, id, materia.estado, {
          dia: nuevoDia.toUpperCase(),
          hora: horaNum,
          aula: nuevaAula
        });

        Alert.alert("¡Horario Actualizado!", "Se reflejará en tu agenda.");
        loadMateria();
        setEditMode(false);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el horario.");
    }
  };

  // Color based on estado
  const getColorTema = () => {
    if (materia?.estado === 'aprobado') return theme.green;
    if (materia?.estado === 'regular') return theme.orange;
    if (materia?.estado === 'cursado') return theme.blue;
    return theme.tint;
  };

  const getEstadoLabel = () => {
    if (materia?.estado === 'aprobado') return 'Aprobada';
    if (materia?.estado === 'regular') return 'Regular';
    if (materia?.estado === 'cursado') return 'Cursando';
    return materia?.estado || '';
  };

  if (loading) return (
    <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center' }]}>
      <ActivityIndicator size="large" color={theme.tint} />
    </View>
  );

  if (!materia) return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.notFoundText, { color: theme.text }]}>Materia no encontrada</Text>
    </View>
  );

  const colorTema = getColorTema();

  // Theme-aware gradient using materia color
  const headerGradient = {
    colors: [
      colorTema + 'F2',
      colorTema + 'CC',
      'transparent',
    ] as const,
    start: { x: 0.5, y: 0 } as const,
    end: { x: 0.5, y: 1 } as const,
  };

  const headerBlur = isDark
    ? { intensity: 12, tint: Platform.OS === 'ios' ? 'systemThickMaterialDark' as const : 'dark' as const }
    : { intensity: 15, tint: Platform.OS === 'ios' ? 'systemThickMaterialLight' as const : 'light' as const };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colorTema} />

      <AnimatedHeaderScrollView
        largeTitle={materia.nombre}
        subtitle={getEstadoLabel()}
        containerStyle={{ backgroundColor: theme.background }}
        contentContainerStyle={styles.scrollContent}
        headerBackgroundGradient={headerGradient}
        headerBlurConfig={headerBlur}
        smallTitleBlurTint={isDark ? 'dark' : 'light'}
        largeHeaderTitleStyle={styles.largeMateriaTitle}
        largeHeaderSubtitleStyle={[styles.largeSubtitle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
        smallHeaderTitleStyle={[styles.smallTitle, { color: theme.text }]}
        smallHeaderSubtitleStyle={{ color: theme.icon }}
        leftComponent={
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.headerButton}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
        }
        rightComponent={
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              editMode ? handleGuardar() : setEditMode(true);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.headerButton}
          >
            <Ionicons
              name={editMode ? 'checkmark-circle' : 'create-outline'}
              size={22}
              color="#fff"
            />
          </TouchableOpacity>
        }
      >
        {/* Información de Cursada */}
        <View style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {editMode ? 'Editar Horarios' : 'Información de Cursada'}
          </Text>

          {/* DÍA */}
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: colorTema + '18' }]}>
              <Ionicons name="calendar-outline" size={18} color={colorTema} />
            </View>
            {editMode ? (
              <View style={styles.editRow}>
                <Text style={[styles.label, { color: theme.icon }]}>Día (LU, MA, MI...):</Text>
                <TextInput
                  style={[styles.input, { color: theme.text, borderBottomColor: theme.separator }]}
                  value={nuevoDia}
                  onChangeText={setNuevoDia}
                  maxLength={2}
                  placeholderTextColor={theme.icon}
                />
              </View>
            ) : (
              <View style={styles.rowTextContainer}>
                <Text style={[styles.rowLabel, { color: theme.icon }]}>Día</Text>
                <Text style={[styles.rowValue, { color: theme.text }]}>{materia.dia || 'A confirmar'}</Text>
              </View>
            )}
          </View>

          {/* HORA */}
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: colorTema + '18' }]}>
              <Ionicons name="time-outline" size={18} color={colorTema} />
            </View>
            {editMode ? (
              <View style={styles.editRow}>
                <Text style={[styles.label, { color: theme.icon }]}>Hora Inicio (0-23):</Text>
                <TextInput
                  style={[styles.input, { color: theme.text, borderBottomColor: theme.separator }]}
                  value={nuevaHora}
                  onChangeText={setNuevaHora}
                  keyboardType="numeric"
                  placeholderTextColor={theme.icon}
                />
              </View>
            ) : (
              <View style={styles.rowTextContainer}>
                <Text style={[styles.rowLabel, { color: theme.icon }]}>Horario</Text>
                <Text style={[styles.rowValue, { color: theme.text }]}>{materia.hora}:00 hs</Text>
              </View>
            )}
          </View>

          {/* AULA */}
          <View style={[styles.row, { marginBottom: editMode ? 8 : 0 }]}>
            <View style={[styles.rowIcon, { backgroundColor: colorTema + '18' }]}>
              <Ionicons name="location-outline" size={18} color={colorTema} />
            </View>
            {editMode ? (
              <View style={styles.editRow}>
                <Text style={[styles.label, { color: theme.icon }]}>Aula:</Text>
                <TextInput
                  style={[styles.input, { color: theme.text, borderBottomColor: theme.separator }]}
                  value={nuevaAula}
                  onChangeText={setNuevaAula}
                  placeholderTextColor={theme.icon}
                />
              </View>
            ) : (
              <View style={styles.rowTextContainer}>
                <Text style={[styles.rowLabel, { color: theme.icon }]}>Aula</Text>
                <Text style={[styles.rowValue, { color: theme.text }]}>{materia.aula || 'Sin aula'}</Text>
              </View>
            )}
          </View>

          {editMode && (
            <Text style={[styles.hint, { color: theme.icon }]}>
              Toca el check arriba a la derecha para guardar.
            </Text>
          )}
        </View>

        {/* Parciales y entregas */}
        <View style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Parciales y Entregas</Text>
          {examenes.length === 0 ? (
            <View style={styles.emptyExams}>
              <Ionicons name="document-text-outline" size={28} color={theme.separator} />
              <Text style={[styles.emptyExamsText, { color: theme.icon }]}>
                No hay parciales o entregas cargados para esta materia
              </Text>
            </View>
          ) : (
            examenes.map((exam, index) => {
              const tiempoRestante = getTiempoRestante(exam.fecha);
              const esPasado = tiempoRestante === 'Finalizado';
              return (
                <View
                  key={exam.id}
                  style={[
                    styles.examRow,
                    index < examenes.length - 1 && { marginBottom: 14 },
                    esPasado && { opacity: 0.5 },
                  ]}
                >
                  <View style={[styles.dateBox, { borderColor: exam.color }]}>
                    <Text style={[styles.dateBoxDay, { color: exam.color }]}>{exam.dia}</Text>
                    <Text style={[styles.dateBoxMonth, { color: exam.color }]}>{exam.mesLabel}</Text>
                  </View>
                  <View style={styles.examInfo}>
                    <View style={styles.examTitleRow}>
                      <Text style={[styles.examTitle, { color: theme.text }]} numberOfLines={1}>
                        {exam.titulo}
                      </Text>
                      <View style={[styles.tipoBadge, { backgroundColor: exam.color + '18' }]}>
                        <Text style={[styles.tipoBadgeText, { color: exam.color }]}>{exam.tipo}</Text>
                      </View>
                    </View>
                    <View style={styles.examDetails}>
                      <Text style={[styles.examTime, { color: theme.icon }]}>
                        {exam.hora} hs
                      </Text>
                      <Text style={[styles.examCountdown, { color: esPasado ? theme.icon : colorTema }]}>
                        {tiempoRestante}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 40 }} />
      </AnimatedHeaderScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  notFoundText: { textAlign: 'center', marginTop: 50, fontSize: 16 },

  // Header elements
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeMateriaTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  largeSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  smallTitle: {
    fontSize: 17,
    fontWeight: '700',
  },

  // Cards
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },

  // Rows
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowTextContainer: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },

  // Edit mode
  editRow: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: 12, marginRight: 10 },
  input: { borderBottomWidth: 1, flex: 1, paddingVertical: 2, fontSize: 14 },
  hint: { fontSize: 11, textAlign: 'center', marginTop: 10, fontStyle: 'italic' },

  // Examenes
  emptyExams: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  emptyExamsText: { fontSize: 13, textAlign: 'center', paddingHorizontal: 10 },
  examRow: { flexDirection: 'row', alignItems: 'center' },
  dateBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  dateBoxDay: { fontSize: 18, fontWeight: '800', lineHeight: 20 },
  dateBoxMonth: { fontSize: 10, fontWeight: '700' },
  examInfo: { flex: 1 },
  examTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  examTitle: { fontSize: 15, fontWeight: '600', flexShrink: 1 },
  tipoBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  tipoBadgeText: { fontSize: 10, fontWeight: '700' },
  examDetails: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  examTime: { fontSize: 13 },
  examCountdown: { fontSize: 12, fontWeight: '600' },
});
