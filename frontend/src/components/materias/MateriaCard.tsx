import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { UsuarioMateria, EstadosMateria } from './types';

interface MateriaCardProps {
  item: UsuarioMateria;
  theme: any;
  estadosMateria: EstadosMateria;
  index?: number;
  onPress: () => void;
  onDelete: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function MateriaCard({
  item,
  theme,
  estadosMateria,
  index = 0,
  onPress,
  onDelete,
  accessibilityLabel,
  accessibilityHint,
}: MateriaCardProps) {
  const estadoInfo = estadosMateria[item.estado];

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400).springify()}>
      <TouchableOpacity
        style={[styles.materiaCard, { backgroundColor: theme.backgroundSecondary }]}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityLabel={accessibilityLabel || `Materia ${item.materia.nombre}, estado ${estadoInfo.label}`}
        accessibilityHint={accessibilityHint || 'Toca para editar esta materia'}
        accessibilityRole="button"
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
              onPress={onDelete}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel={`Eliminar ${item.materia.nombre}`}
              accessibilityHint="Toca dos veces para eliminar esta materia"
              accessibilityRole="button"
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
                {item.aula ? ` - ${item.aula}` : ''}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.chevronContainer}>
          <Ionicons name="chevron-forward" size={18} color={theme.icon} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  materiaCard: {
    borderRadius: 16,
    flexDirection: 'row',
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardLeftStrip: { width: 6, height: '100%' },
  cardMainContent: { flex: 1, padding: 16 },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagContainer: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 10, fontWeight: '800' },
  materiaNombre: { fontSize: 17, fontWeight: '700', marginBottom: 6 },
  cardFooter: { flexDirection: 'row' },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 15 },
  materiaNivel: { fontSize: 12, marginLeft: 4, fontWeight: '500' },
  chevronContainer: { paddingRight: 12, justifyContent: 'center' },
  scheduleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,122,255,0.2)',
  },
  scheduleText: { fontSize: 11, fontWeight: '600', marginLeft: 4 },
});
