import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Materia, EstadoMateriaKey, EstadosMateria } from './types';

interface EstadoHorarioSheetProps {
  theme: any;
  materiaSeleccionada: Materia | null;
  estadoSeleccionado: EstadoMateriaKey;
  setEstadoSeleccionado: (estado: EstadoMateriaKey) => void;
  estadosMateria: EstadosMateria;
  modoEdicion: boolean;
  loadingAction: boolean;
  // Horario props
  dia: string;
  setDia: (dia: string) => void;
  horaInicio: string;
  horaInicioDate: Date;
  onHoraInicioChange: (event: DateTimePickerEvent, date?: Date) => void;
  showInicioTimePicker: boolean;
  setShowInicioTimePicker: (show: boolean) => void;
  horaFin: string;
  horaFinDate: Date;
  onHoraFinChange: (event: DateTimePickerEvent, date?: Date) => void;
  showFinTimePicker: boolean;
  setShowFinTimePicker: (show: boolean) => void;
  aula: string;
  setAula: (aula: string) => void;
  // Animation props
  backdropStyle: any;
  sheetStyle: any;
  // Callbacks
  onClose: () => void;
  onSave: () => void;
  onHaptic?: () => void;
}

export function EstadoHorarioSheet({
  theme,
  materiaSeleccionada,
  estadoSeleccionado,
  setEstadoSeleccionado,
  estadosMateria,
  modoEdicion,
  loadingAction,
  dia,
  setDia,
  horaInicio,
  horaInicioDate,
  onHoraInicioChange,
  showInicioTimePicker,
  setShowInicioTimePicker,
  horaFin,
  horaFinDate,
  onHoraFinChange,
  showFinTimePicker,
  setShowFinTimePicker,
  aula,
  setAula,
  backdropStyle,
  sheetStyle,
  onClose,
  onSave,
  onHaptic,
}: EstadoHorarioSheetProps) {
  const dias = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA'];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.modalOverlay, backdropStyle]}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[styles.estadoModalContent, { backgroundColor: theme.backgroundSecondary }, sheetStyle]}
              >
                <View style={[styles.modalHandle, { backgroundColor: theme.icon + '40' }]} />
                <View style={styles.modalHeader}>
                  <TouchableOpacity
                    onPress={onClose}
                    accessibilityLabel="Cancelar"
                    accessibilityRole="button"
                  >
                    <Text style={[styles.cancelButton, { color: theme.red }]}>Cancelar</Text>
                  </TouchableOpacity>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>
                    {modoEdicion ? 'Editar' : 'Estado'}
                  </Text>
                  <TouchableOpacity
                    onPress={onSave}
                    disabled={loadingAction}
                    accessibilityLabel={modoEdicion ? 'Guardar cambios' : 'Agregar materia'}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.doneButton, { color: theme.blue }, loadingAction && { opacity: 0.5 }]}>
                      {loadingAction ? '...' : modoEdicion ? 'Guardar' : 'Agregar'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {materiaSeleccionada && (
                  <View style={[styles.materiaSeleccionadaContainer, { backgroundColor: theme.background }]}>
                    <View style={styles.materiaSeleccionadaInfo}>
                      <Text style={[styles.materiaSeleccionadaNombre, { color: theme.text }]}>
                        {materiaSeleccionada.nombre}
                      </Text>
                      <Text style={[styles.materiaSeleccionadaNivel, { color: theme.icon }]}>
                        Nivel {materiaSeleccionada.nivel || 'N/A'} - #{materiaSeleccionada.numero || 'N/A'}
                      </Text>
                    </View>
                  </View>
                )}

                <ScrollView
                  style={styles.estadoOptionsScrollView}
                  contentContainerStyle={styles.estadoOptionsContent}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={[styles.sectionHeader, { color: theme.icon }]}>SELECCIONAR ESTADO</Text>
                  <View style={[styles.formGroup, { backgroundColor: theme.background }]}>
                    {Object.entries(estadosMateria).map(([key, info], index, arr) => (
                      <TouchableOpacity
                        key={key}
                        style={[
                          styles.inputRow,
                          {
                            borderBottomColor: theme.separator,
                            borderBottomWidth: index === arr.length - 1 ? 0 : StyleSheet.hairlineWidth,
                          },
                        ]}
                        onPress={() => {
                          onHaptic?.();
                          setEstadoSeleccionado(key as EstadoMateriaKey);
                        }}
                        disabled={loadingAction}
                        accessibilityLabel={`Estado ${info.label}`}
                        accessibilityState={{ selected: estadoSeleccionado === key }}
                        accessibilityRole="radio"
                      >
                        <View style={styles.estadoOptionLeft}>
                          <View style={[styles.estadoDot, { backgroundColor: info.color }]} />
                          <Text
                            style={[
                              styles.estadoOptionText,
                              { color: theme.text },
                              estadoSeleccionado === key && { fontWeight: '600' },
                            ]}
                          >
                            {info.label}
                          </Text>
                        </View>
                        {estadoSeleccionado === key && <Ionicons name="checkmark" size={20} color={theme.blue} />}
                      </TouchableOpacity>
                    ))}
                  </View>

                  {estadoSeleccionado === 'cursado' && (
                    <>
                      <Text style={[styles.sectionHeader, { color: theme.icon, marginTop: 10 }]}>
                        HORARIO DE CURSADA
                      </Text>
                      <View style={[styles.formGroup, { backgroundColor: theme.background }]}>
                        {/* DÍA */}
                        <View
                          style={[
                            styles.inputRow,
                            { borderBottomColor: theme.separator, borderBottomWidth: StyleSheet.hairlineWidth },
                          ]}
                        >
                          <Text style={[styles.inputLabel, { color: theme.text }]}>Día</Text>
                          <View style={styles.daysContainer}>
                            {dias.map((d) => (
                              <TouchableOpacity
                                key={d}
                                onPress={() => {
                                  onHaptic?.();
                                  setDia(d);
                                }}
                                style={[
                                  styles.dayOption,
                                  { backgroundColor: dia === d ? theme.blue : theme.backgroundSecondary },
                                ]}
                                accessibilityLabel={`Día ${d}`}
                                accessibilityState={{ selected: dia === d }}
                                accessibilityRole="radio"
                              >
                                <Text style={[styles.dayOptionText, { color: dia === d ? '#fff' : theme.text }]}>
                                  {d}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>

                        {/* HORA INICIO */}
                        <View
                          style={[
                            styles.inputRow,
                            { borderBottomColor: theme.separator, borderBottomWidth: StyleSheet.hairlineWidth },
                          ]}
                        >
                          <Text style={[styles.inputLabel, { color: theme.text }]}>Hora Inicio</Text>
                          {Platform.OS === 'ios' ? (
                            <DateTimePicker
                              value={horaInicioDate}
                              mode="time"
                              is24Hour={true}
                              display="spinner"
                              onChange={onHoraInicioChange}
                              minuteInterval={30}
                              style={styles.timePicker}
                            />
                          ) : (
                            <>
                              <TouchableOpacity
                                onPress={() => setShowInicioTimePicker(true)}
                                style={styles.timeButton}
                                accessibilityLabel={`Hora inicio: ${horaInicio}`}
                                accessibilityHint="Toca para cambiar la hora de inicio"
                                accessibilityRole="button"
                              >
                                <Text style={[styles.timeButtonText, { color: theme.blue }]}>{horaInicio}</Text>
                              </TouchableOpacity>
                              {showInicioTimePicker && (
                                <DateTimePicker
                                  value={horaInicioDate}
                                  mode="time"
                                  is24Hour={true}
                                  display="default"
                                  onChange={onHoraInicioChange}
                                  minuteInterval={30}
                                />
                              )}
                            </>
                          )}
                        </View>

                        {/* HORA FIN */}
                        <View
                          style={[
                            styles.inputRow,
                            { borderBottomColor: theme.separator, borderBottomWidth: StyleSheet.hairlineWidth },
                          ]}
                        >
                          <Text style={[styles.inputLabel, { color: theme.text }]}>Hora Fin</Text>
                          {Platform.OS === 'ios' ? (
                            <DateTimePicker
                              value={horaFinDate}
                              mode="time"
                              is24Hour={true}
                              display="spinner"
                              onChange={onHoraFinChange}
                              minuteInterval={30}
                              style={styles.timePicker}
                            />
                          ) : (
                            <>
                              <TouchableOpacity
                                onPress={() => setShowFinTimePicker(true)}
                                style={styles.timeButton}
                                accessibilityLabel={`Hora fin: ${horaFin}`}
                                accessibilityHint="Toca para cambiar la hora de fin"
                                accessibilityRole="button"
                              >
                                <Text style={[styles.timeButtonText, { color: theme.blue }]}>{horaFin}</Text>
                              </TouchableOpacity>
                              {showFinTimePicker && (
                                <DateTimePicker
                                  value={horaFinDate}
                                  mode="time"
                                  is24Hour={true}
                                  display="default"
                                  onChange={onHoraFinChange}
                                  minuteInterval={30}
                                />
                              )}
                            </>
                          )}
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
                            accessibilityLabel="Aula"
                            accessibilityHint="Ingresa el aula o ubicación de la clase"
                          />
                        </View>
                      </View>
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
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  estadoModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
    height: '95%',
  },
  modalHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 15,
    marginTop: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 5,
  },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  cancelButton: { fontSize: 17 },
  doneButton: { fontSize: 17, fontWeight: '600' },
  materiaSeleccionadaContainer: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  materiaSeleccionadaInfo: { flex: 1 },
  materiaSeleccionadaNombre: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  materiaSeleccionadaNivel: { fontSize: 13 },
  estadoOptionsScrollView: { flex: 1 },
  estadoOptionsContent: { paddingBottom: 10 },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    marginLeft: 5,
    textTransform: 'uppercase',
  },
  formGroup: { borderRadius: 12, overflow: 'hidden', marginBottom: 25 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 50,
  },
  estadoOptionLeft: { flexDirection: 'row', alignItems: 'center' },
  estadoDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  estadoOptionText: { fontSize: 17 },
  inputLabel: { fontSize: 17, minWidth: 100 },
  textInput: { flex: 1, fontSize: 17, textAlign: 'right' },
  daysContainer: { flexDirection: 'row', flex: 1, justifyContent: 'flex-end' },
  dayOption: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginLeft: 4 },
  dayOptionText: { fontSize: 13, fontWeight: '600' },
  timePicker: { width: 100, height: 100 },
  timeButton: { paddingVertical: 8, paddingHorizontal: 12 },
  timeButtonText: { fontSize: 17, fontWeight: '500' },
});
