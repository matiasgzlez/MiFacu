import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { Materia } from './types';

interface AddMateriaSheetProps {
  theme: any;
  materiasDisponibles: Materia[];
  loadingAction: boolean;
  backdropStyle: any;
  sheetStyle: any;
  onClose: () => void;
  onSelectMateria: (materia: Materia) => void;
  onHaptic?: () => void;
}

export function AddMateriaSheet({
  theme,
  materiasDisponibles,
  loadingAction,
  backdropStyle,
  sheetStyle,
  onClose,
  onSelectMateria,
  onHaptic,
}: AddMateriaSheetProps) {
  const renderMateriaDisponible = ({ item }: { item: Materia }) => (
    <TouchableOpacity
      style={[styles.disponibleCard, { backgroundColor: theme.backgroundSecondary }]}
      onPress={() => {
        onHaptic?.();
        onSelectMateria(item);
      }}
      disabled={loadingAction}
      activeOpacity={0.7}
      accessibilityLabel={`Agregar ${item.nombre}`}
      accessibilityHint="Toca para agregar esta materia a tu lista"
      accessibilityRole="button"
    >
      <View style={styles.disponibleInfo}>
        <Text style={[styles.disponibleNombre, { color: theme.text }]}>{item.nombre}</Text>
        <Text style={[styles.disponibleNivel, { color: theme.icon }]}>
          Nivel {item.nivel || 'N/A'} - #{item.numero || 'N/A'}
        </Text>
      </View>
      <Ionicons name="add-circle-outline" size={24} color={theme.blue} />
    </TouchableOpacity>
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.modalOverlay, backdropStyle]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[styles.modalContent, { backgroundColor: theme.backgroundSecondary }, sheetStyle]}
            >
              <View style={[styles.modalHandle, { backgroundColor: theme.separator }]} />
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={onClose}
                  accessibilityLabel="Cerrar"
                  accessibilityRole="button"
                >
                  <Text style={[styles.cancelButton, { color: theme.red }]}>Cerrar</Text>
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Seleccionar Materia</Text>
                <View style={{ width: 60 }} />
              </View>

              <Text style={[styles.modalSubtitle, { color: theme.icon }]}>
                Elige una materia para continuar ({materiasDisponibles.length} disponibles)
              </Text>

              {materiasDisponibles.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="checkmark-circle" size={48} color={theme.green} />
                  <Text style={[styles.emptyText, { color: theme.text }]}>¡Todo al día!</Text>
                  <Text style={[styles.emptySubtext, { color: theme.icon }]}>
                    Ya tienes todas las materias disponibles
                  </Text>
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
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
    maxHeight: '85%',
    minHeight: '50%',
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
  modalSubtitle: { fontSize: 14, marginBottom: 20, paddingHorizontal: 5 },
  modalList: { flex: 1 },
  disponibleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
  },
  disponibleInfo: { flex: 1 },
  disponibleNombre: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  disponibleNivel: { fontSize: 13 },
  emptyState: { alignItems: 'center', padding: 40, borderRadius: 20, marginTop: 10 },
  emptyText: { fontSize: 18, fontWeight: '700', marginTop: 15 },
  emptySubtext: { fontSize: 14, marginTop: 5, textAlign: 'center', width: '80%', opacity: 0.7 },
});
