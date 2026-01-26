import React, { memo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CircularProgress } from './CircularProgress';
import { StatItem } from './StatItem';
import type { ThemeColors, Stats } from '../../types';

interface StatsModalProps {
  visible: boolean;
  onClose: () => void;
  overlayOpacity: Animated.Value;
  sheetAnim: Animated.Value;
  theme: ThemeColors;
  cardColor: string;
  carreraProgreso: number;
  stats: Stats;
  privacyMode: boolean;
  onNavigateToMaterias: () => void;
}

/**
 * Modal sheet showing academic statistics
 * Optimized with React.memo
 */
export const StatsModal = memo<StatsModalProps>(function StatsModal({
  visible,
  onClose,
  overlayOpacity,
  sheetAnim,
  theme,
  cardColor,
  carreraProgreso,
  stats,
  privacyMode,
  onNavigateToMaterias,
}) {
  return (
    <Modal
      animationType="none"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
          <View style={StyleSheet.absoluteFill} />
        </Animated.View>
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.sheetContent,
          { backgroundColor: cardColor, transform: [{ translateY: sheetAnim }] },
        ]}
      >
        {/* Handle Bar */}
        <View style={[styles.modalHandle, { backgroundColor: theme.separator }]} />

        <View style={styles.modalHeader}>
          <View>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Estado Académico</Text>
            <Text style={[styles.modalSubtitle, { color: theme.icon }]}>
              Tu resumen hasta el momento
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <View style={[styles.closeBtnCircle, { backgroundColor: theme.separator + '30' }]}>
              <Ionicons name="close" size={20} color={theme.text} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Main Summary with Circular Progress */}
        <View style={styles.statsSummary}>
          <CircularProgress
            percentage={carreraProgreso}
            size={160}
            strokeWidth={12}
            color={theme.tint}
            theme={theme}
            privacyMode={privacyMode}
          />
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatItem
            iconName="school"
            number={privacyMode ? '•' : stats.cursando}
            label="Cursando"
            color={theme.blue}
            theme={theme}
            isBig
          />
          <StatItem
            iconName="checkbox"
            number={privacyMode ? '•' : stats.regulares}
            label="Regulares"
            color={theme.orange}
            theme={theme}
            isBig
          />
          <StatItem
            iconName="trophy"
            number={privacyMode ? '•' : stats.aprobadas}
            label="Aprobadas"
            color={theme.green}
            theme={theme}
            isBig
          />
          <StatItem
            iconName="book-outline"
            number={privacyMode ? '•' : stats.noCursadas}
            label="Pendientes"
            color={theme.icon}
            theme={theme}
            isBig
          />
        </View>

        <TouchableOpacity
          style={[styles.fullReportButton, { backgroundColor: theme.tint }]}
          onPress={onNavigateToMaterias}
          activeOpacity={0.8}
        >
          <Text style={styles.fullReportText}>Ver Mis Materias</Text>
          <Ionicons name="arrow-forward" size={18} color="white" style={styles.buttonIcon} />
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheetContent: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  modalHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
    opacity: 0.3,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  closeBtnCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsSummary: {
    alignItems: 'center',
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  fullReportButton: {
    flexDirection: 'row',
    marginTop: 10,
    padding: 18,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullReportText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  buttonIcon: {
    marginLeft: 8,
  },
});
