import React from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  TouchableWithoutFeedback,
  View,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { MateriaSimulador } from '../../hooks/useSimuladorData';
import { SIMULADOR_COLORS, getSimuladorColors, getEstadoConfig, EstadoVisual } from '../../utils/estadoMapper';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MateriaDetailSheetProps {
  materia: MateriaSimulador | null;
  allMaterias: MateriaSimulador[];
  visible: boolean;
  sheetAnim: Animated.Value;
  overlayOpacity: Animated.Value;
  onClose: () => void;
  onChangeEstado: (nuevoEstado: EstadoVisual) => void;
  isDark: boolean;
}

export function MateriaDetailSheet({
  materia,
  allMaterias,
  visible,
  sheetAnim,
  overlayOpacity,
  onClose,
  onChangeEstado,
  isDark,
}: MateriaDetailSheetProps) {
  const insets = useSafeAreaInsets();
  const colors = getSimuladorColors(isDark);

  if (!visible || !materia) return null;

  const estadoConfig = getEstadoConfig(materia.estado);
  const maxSheetHeight = SCREEN_HEIGHT * 0.85;

  const correlativas = materia.reqs
    .map(reqId => allMaterias.find(m => m.id === reqId))
    .filter(Boolean) as MateriaSimulador[];

  const correlativasCumplidas = correlativas.filter(
    c => c.estado === 'aprobada' || c.estado === 'regularizada'
  );
  const correlativasFaltantes = correlativas.filter(
    c => c.estado !== 'aprobada' && c.estado !== 'regularizada'
  );

  const handleAprobar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onChangeEstado('aprobada');
    onClose();
  };

  const handleRegularizar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onChangeEstado('regularizada');
    onClose();
  };

  const handlePendiente = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChangeEstado('pendiente');
    onClose();
  };

  return (
    <View style={styles.modalContainer} pointerEvents="box-none">
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity, backgroundColor: colors.overlay }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.sheet,
                {
                  transform: [{ translateY: sheetAnim }],
                  maxHeight: maxSheetHeight,
                  paddingBottom: Math.max(insets.bottom, 20) + 20,
                  backgroundColor: colors.backgroundSecondary,
                }
              ]}
            >
              {/* Handle */}
              <View style={[styles.handle, { backgroundColor: colors.backgroundTertiary }]} />

              {/* Header */}
              <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.textTertiary }]}>Detalle</Text>
                <Pressable
                  onPress={onClose}
                  style={styles.closeButtonContainer}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.closeButtonBlur}>
                    <Ionicons name="close" size={18} color={colors.textSecondary} />
                  </BlurView>
                </Pressable>
              </View>

              {/* Scrollable Content */}
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
                bounces={true}
              >
                {/* Materia Info */}
                <View style={styles.materiaInfo}>
                  <View style={[styles.estadoIndicator, { backgroundColor: estadoConfig.color }]}>
                    <Ionicons name={estadoConfig.iconFilled} size={20} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.materiaNombre, { color: colors.textPrimary }]}>{materia.nombre}</Text>
                  <View style={styles.metaRow}>
                    <View style={[styles.badge, { backgroundColor: estadoConfig.bgColor }]}>
                      <Text style={[styles.badgeText, { color: estadoConfig.color }]}>
                        {estadoConfig.label}
                      </Text>
                    </View>
                    <Text style={[styles.nivelText, { color: colors.textTertiary }]}>Año {materia.nivel}</Text>
                  </View>
                </View>

                {/* Correlativas */}
                <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>Correlativas</Text>

                {correlativas.length === 0 ? (
                  <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}>
                      <Ionicons name="checkmark-circle" size={32} color={SIMULADOR_COLORS.aprobada} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Sin requisitos</Text>
                    <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                      Esta materia no tiene correlativas previas
                    </Text>
                  </View>
                ) : (
                  <>
                    {correlativasFaltantes.length > 0 && (
                      <View style={styles.correlativasSection}>
                        <View style={styles.sectionHeader}>
                          <Ionicons name="alert-circle" size={16} color="#FF3B30" />
                          <Text style={[styles.sectionSubtitle, { color: '#FF3B30' }]}>
                            Pendientes ({correlativasFaltantes.length})
                          </Text>
                        </View>
                        {correlativasFaltantes.map(c => (
                          <View key={c.id} style={[styles.correlativaItem, { backgroundColor: colors.background }]}>
                            <View style={[styles.correlativaDot, { backgroundColor: getEstadoConfig(c.estado).color }]} />
                            <Text style={[styles.correlativaText, { color: colors.textPrimary }]} numberOfLines={1}>{c.nombre}</Text>
                            <Text style={[styles.correlativaEstado, { color: getEstadoConfig(c.estado).color }]}>
                              {getEstadoConfig(c.estado).labelShort}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {correlativasCumplidas.length > 0 && (
                      <View style={styles.correlativasSection}>
                        <View style={styles.sectionHeader}>
                          <Ionicons name="checkmark-circle" size={16} color={SIMULADOR_COLORS.aprobada} />
                          <Text style={[styles.sectionSubtitle, { color: SIMULADOR_COLORS.aprobada }]}>
                            Cumplidas ({correlativasCumplidas.length})
                          </Text>
                        </View>
                        {correlativasCumplidas.map(c => (
                          <View key={c.id} style={[styles.correlativaItem, { backgroundColor: colors.background }]}>
                            <View style={[styles.correlativaDot, { backgroundColor: getEstadoConfig(c.estado).color }]} />
                            <Text style={[styles.correlativaText, { color: colors.textPrimary }]} numberOfLines={1}>{c.nombre}</Text>
                            <Text style={[styles.correlativaEstado, { color: getEstadoConfig(c.estado).color }]}>
                              {getEstadoConfig(c.estado).labelShort}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </>
                )}
              </ScrollView>

              {/* Actions - Fixed at bottom */}
              <View style={[styles.actionsContainer, { borderTopColor: colors.separator }]}>
                {materia.estado !== 'bloqueada' && (
                  <View style={styles.actions}>
                    {materia.estado !== 'aprobada' && (
                      <Pressable
                        style={[styles.actionButton, { backgroundColor: SIMULADOR_COLORS.aprobada }]}
                        onPress={handleAprobar}
                      >
                        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Aprobar</Text>
                      </Pressable>
                    )}

                    {materia.estado !== 'regularizada' && materia.estado !== 'aprobada' && (
                      <Pressable
                        style={[styles.actionButton, { backgroundColor: SIMULADOR_COLORS.regularizada }]}
                        onPress={handleRegularizar}
                      >
                        <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Regularizar</Text>
                      </Pressable>
                    )}

                    {(materia.estado === 'aprobada' || materia.estado === 'regularizada') && (
                      <Pressable
                        style={[styles.actionButton, { backgroundColor: colors.background }]}
                        onPress={handlePendiente}
                      >
                        <Ionicons name="refresh" size={20} color={colors.textSecondary} />
                        <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>
                          Resetear
                        </Text>
                      </Pressable>
                    )}
                  </View>
                )}

                {materia.estado === 'bloqueada' && (
                  <View style={[styles.blockedMessage, { backgroundColor: colors.background }]}>
                    <Ionicons name="lock-closed" size={18} color={colors.textTertiary} />
                    <Text style={[styles.blockedText, { color: colors.textTertiary }]}>
                      Completa las correlativas para desbloquear
                    </Text>
                  </View>
                )}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    overflow: 'hidden',
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  closeButtonContainer: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  closeButtonBlur: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  materiaInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  estadoIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  materiaNombre: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  nivelText: {
    fontSize: 14,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  correlativasSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  correlativaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  correlativaDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  correlativaText: {
    flex: 1,
    fontSize: 15,
  },
  correlativaEstado: {
    fontSize: 13,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  resetButton: {},
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  blockedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    gap: 10,
  },
  blockedText: {
    fontSize: 14,
  },
});
