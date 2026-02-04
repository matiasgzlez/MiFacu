import React from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  View,
  Animated,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MateriaSimulador } from '../../hooks/useSimuladorData';
import { SIMULADOR_COLORS, getSimuladorColors, getEstadoConfig } from '../../utils/estadoMapper';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CorrelativaFaltante {
  materia: MateriaSimulador;
  tipoRequerido: 'regularizada' | 'aprobada';
}

interface BlockedMateriaSheetProps {
  materia: MateriaSimulador | null;
  correlativasFaltantes: CorrelativaFaltante[];
  visible: boolean;
  sheetAnim: Animated.Value;
  overlayOpacity: Animated.Value;
  onClose: () => void;
  isDark: boolean;
}

export function BlockedMateriaSheet({
  materia,
  correlativasFaltantes,
  visible,
  sheetAnim,
  overlayOpacity,
  onClose,
  isDark,
}: BlockedMateriaSheetProps) {
  const insets = useSafeAreaInsets();
  const colors = getSimuladorColors(isDark);

  if (!visible || !materia) return null;

  const faltantesRegularizadas = correlativasFaltantes.filter(c => c.tipoRequerido === 'regularizada');
  const faltantesAprobadas = correlativasFaltantes.filter(c => c.tipoRequerido === 'aprobada');

  const maxSheetHeight = SCREEN_HEIGHT * 0.85;

  const renderCorrelativaItem = (item: CorrelativaFaltante) => {
    const { materia: correlativa, tipoRequerido } = item;
    const estadoConfig = getEstadoConfig(correlativa.estado);
    const requiereAprobada = tipoRequerido === 'aprobada';

    return (
      <View key={`${correlativa.id}-${tipoRequerido}`} style={[styles.correlativaItem, { backgroundColor: colors.background }]}>
        <View style={[styles.correlativaDot, { backgroundColor: estadoConfig.color }]} />
        <View style={styles.correlativaInfo}>
          <Text style={[styles.correlativaText, { color: colors.textPrimary }]} numberOfLines={2}>
            {correlativa.nombre}
          </Text>
          <View style={styles.correlativaMeta}>
            <Text style={[styles.correlativaNivel, { color: colors.textTertiary }]}>Año {correlativa.nivel}</Text>
            <View style={[styles.miniTag, { backgroundColor: estadoConfig.bgColor }]}>
              <Text style={[styles.miniTagText, { color: estadoConfig.color }]}>
                {estadoConfig.labelShort}
              </Text>
            </View>
          </View>
        </View>
        <View style={[styles.requiredBadge, { backgroundColor: requiereAprobada ? 'rgba(255, 59, 48, 0.1)' : 'rgba(255, 149, 0, 0.1)' }]}>
          <Ionicons
            name={requiereAprobada ? 'school-outline' : 'document-text-outline'}
            size={16}
            color={requiereAprobada ? '#FF3B30' : '#FF9500'}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.modalContainer}>
      {/* Backdrop - toca para cerrar */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View style={[styles.backdropInner, { opacity: overlayOpacity, backgroundColor: colors.overlay }]} />
      </Pressable>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [{ translateY: sheetAnim }],
            maxHeight: maxSheetHeight,
            backgroundColor: colors.backgroundSecondary,
          }
        ]}
      >
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={[styles.handle, { backgroundColor: colors.backgroundTertiary }]} />
        </View>

        {/* Header fijo */}
        <View style={[styles.headerFixed, { borderBottomColor: colors.separator }]}>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed" size={24} color="#FF3B30" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Materia Bloqueada</Text>
            <Text style={[styles.materiaNombre, { color: colors.textPrimary }]} numberOfLines={2}>{materia.nombre}</Text>
          </View>
        </View>

        {/* Contenido scrolleable */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          bounces={true}
          nestedScrollEnabled={true}
        >
          {/* Message */}
          <View style={[styles.messageBox, { backgroundColor: isDark ? 'rgba(0, 122, 255, 0.12)' : 'rgba(0, 122, 255, 0.06)' }]}>
            <Ionicons name="information-circle" size={18} color={colors.pendiente} />
            <Text style={[styles.messageText, { color: colors.textSecondary }]}>
              Necesitas completar estas correlativas:
            </Text>
          </View>

          {/* Correlativas - Regularizar */}
          {faltantesRegularizadas.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: 'rgba(255, 149, 0, 0.1)' }]}>
                  <Ionicons name="document-text" size={14} color="#FF9500" />
                </View>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Regularizar</Text>
                <View style={[styles.countBadge, { backgroundColor: colors.background }]}>
                  <Text style={[styles.countText, { color: colors.textSecondary }]}>{faltantesRegularizadas.length}</Text>
                </View>
              </View>
              {faltantesRegularizadas.map(renderCorrelativaItem)}
            </View>
          )}

          {/* Correlativas - Aprobar */}
          {faltantesAprobadas.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: 'rgba(255, 59, 48, 0.1)' }]}>
                  <Ionicons name="school" size={14} color="#FF3B30" />
                </View>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Aprobar (con final)</Text>
                <View style={[styles.countBadge, { backgroundColor: colors.background }]}>
                  <Text style={[styles.countText, { color: colors.textSecondary }]}>{faltantesAprobadas.length}</Text>
                </View>
              </View>
              {faltantesAprobadas.map(renderCorrelativaItem)}
            </View>
          )}
        </ScrollView>

        {/* Botón fijo abajo */}
        <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 16), backgroundColor: colors.backgroundSecondary, borderTopColor: colors.separator }]}>
          <Pressable
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Entendido</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

export type { CorrelativaFaltante };

const styles = StyleSheet.create({
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropInner: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'column',
  },
  handleContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
  },
  headerFixed: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 14,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF3B30',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  materiaNombre: {
    fontSize: 17,
    fontWeight: '600',
  },
  scrollView: {
    flexGrow: 1,
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    gap: 10,
  },
  messageText: {
    flex: 1,
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  countText: {
    fontSize: 13,
    fontWeight: '600',
  },
  correlativaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
  },
  correlativaDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  correlativaInfo: {
    flex: 1,
  },
  correlativaText: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  correlativaMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  correlativaNivel: {
    fontSize: 12,
  },
  miniTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  miniTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  requiredBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  buttonContainer: {
    flexShrink: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  closeButton: {
    backgroundColor: SIMULADOR_COLORS.pendiente,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
