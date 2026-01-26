import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  Switch,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeColors, Stats } from '../../types';

interface User {
  user_metadata?: {
    avatar_url?: string;
    full_name?: string;
  };
  email?: string;
}

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  overlayOpacity: Animated.Value;
  sheetAnim: Animated.Value;
  theme: ThemeColors;
  cardColor: string;
  colorScheme: 'light' | 'dark';
  user: User | null;
  isGuest: boolean;
  stats: Stats;
  darkModeEnabled: boolean;
  onToggleDarkMode: (value: boolean) => void;
  privacyMode: boolean;
  onTogglePrivacyMode: (value: boolean) => void;
  onNavigateToMaterias: () => void;
  onLogout: () => void;
}

/**
 * Modal sheet showing user profile and settings
 * Optimized with React.memo
 */
export const ProfileModal = memo<ProfileModalProps>(function ProfileModal({
  visible,
  onClose,
  overlayOpacity,
  sheetAnim,
  theme,
  cardColor,
  colorScheme,
  user,
  isGuest,
  stats,
  darkModeEnabled,
  onToggleDarkMode,
  privacyMode,
  onTogglePrivacyMode,
  onNavigateToMaterias,
  onLogout,
}) {
  const handlePrivacyChange = useCallback(
    (val: boolean) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      AsyncStorage.setItem('privacy_mode', String(val));
      onTogglePrivacyMode(val);
    },
    [onTogglePrivacyMode]
  );

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
          styles.profileSheetContent,
          { backgroundColor: cardColor, transform: [{ translateY: sheetAnim }] },
        ]}
      >
        {/* Handle Bar */}
        <View style={[styles.modalHandle, { backgroundColor: theme.separator }]} />

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatarSection}>
            <View style={[styles.profileAvatarRing, { borderColor: theme.tint }]}>
              <Image
                source={{
                  uri: user?.user_metadata?.avatar_url || 'https://i.pravatar.cc/100?img=33',
                }}
                style={styles.profileAvatar}
              />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.text }]}>
                {user?.user_metadata?.full_name || 'Usuario Invitado'}
              </Text>
              <Text style={[styles.profileEmail, { color: theme.icon }]}>
                {user?.email || 'Modo sin conexión'}
              </Text>
              {isGuest && (
                <View style={[styles.guestBadge, { backgroundColor: theme.orange + '20' }]}>
                  <Ionicons name="person-outline" size={12} color={theme.orange} />
                  <Text style={[styles.guestBadgeText, { color: theme.orange }]}>Invitado</Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <View style={[styles.closeBtnCircle, { backgroundColor: theme.separator + '30' }]}>
              <Ionicons name="close" size={20} color={theme.text} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={styles.profileSection}>
          <Text style={[styles.profileSectionTitle, { color: theme.icon }]}>PREFERENCIAS</Text>

          {/* Dark Mode Toggle */}
          <View style={[styles.profileOptionRow, { backgroundColor: theme.background }]}>
            <View
              style={[
                styles.profileOptionIcon,
                { backgroundColor: colorScheme === 'dark' ? theme.blue : theme.orange },
              ]}
            >
              <Ionicons name={colorScheme === 'dark' ? 'moon' : 'sunny'} size={18} color="white" />
            </View>
            <View style={styles.profileOptionContent}>
              <Text style={[styles.profileOptionLabel, { color: theme.text }]}>Modo Oscuro</Text>
              <Text style={[styles.profileOptionHint, { color: theme.icon }]}>
                {colorScheme === 'dark' ? 'Activado' : 'Desactivado'}
              </Text>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={onToggleDarkMode}
              trackColor={{ false: theme.separator, true: theme.tint + '60' }}
              thumbColor={darkModeEnabled ? theme.tint : '#f4f3f4'}
              ios_backgroundColor={theme.separator}
            />
          </View>

          {/* Privacy Mode Toggle */}
          <View style={[styles.profileOptionRow, styles.optionRowSpaced, { backgroundColor: theme.background }]}>
            <View style={[styles.profileOptionIcon, { backgroundColor: theme.slate }]}>
              <Ionicons name={privacyMode ? 'eye-off' : 'eye'} size={18} color="white" />
            </View>
            <View style={styles.profileOptionContent}>
              <Text style={[styles.profileOptionLabel, { color: theme.text }]}>Modo Privado</Text>
              <Text style={[styles.profileOptionHint, { color: theme.icon }]}>
                Oculta tu progreso académico
              </Text>
            </View>
            <Switch
              value={privacyMode}
              onValueChange={handlePrivacyChange}
              trackColor={{ false: theme.separator, true: theme.tint + '60' }}
              thumbColor={privacyMode ? theme.tint : '#f4f3f4'}
              ios_backgroundColor={theme.separator}
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.profileSection}>
          <Text style={[styles.profileSectionTitle, { color: theme.icon }]}>CUENTA</Text>

          {/* My Subjects */}
          <TouchableOpacity
            style={[styles.profileOptionRow, { backgroundColor: theme.background }]}
            onPress={onNavigateToMaterias}
            activeOpacity={0.7}
          >
            <View style={[styles.profileOptionIcon, { backgroundColor: theme.blue }]}>
              <Ionicons name="school" size={18} color="white" />
            </View>
            <View style={styles.profileOptionContent}>
              <Text style={[styles.profileOptionLabel, { color: theme.text }]}>Mis Materias</Text>
              <Text style={[styles.profileOptionHint, { color: theme.icon }]}>
                {stats.aprobadas} aprobadas de {stats.totalPlan}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.separator} />
          </TouchableOpacity>

          {/* Storage Info */}
          <View style={[styles.profileOptionRow, styles.optionRowSpaced, { backgroundColor: theme.background }]}>
            <View style={[styles.profileOptionIcon, { backgroundColor: theme.green }]}>
              <Ionicons name="cloud-done" size={18} color="white" />
            </View>
            <View style={styles.profileOptionContent}>
              <Text style={[styles.profileOptionLabel, { color: theme.text }]}>
                {isGuest ? 'Datos Locales' : 'Sincronizado'}
              </Text>
              <Text style={[styles.profileOptionHint, { color: theme.icon }]}>
                {isGuest ? 'Los datos se guardan en tu dispositivo' : 'Conectado con tu cuenta'}
              </Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: theme.green }]} />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.red + '15' }]}
          onPress={onLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color={theme.red} />
          <Text style={[styles.logoutButtonText, { color: theme.red }]}>
            {isGuest ? 'Salir del Modo Invitado' : 'Cerrar Sesión'}
          </Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={[styles.versionText, { color: theme.icon }]}>miFACU v1.0.0</Text>
      </Animated.View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  profileSheetContent: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 25,
  },
  modalHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
    opacity: 0.3,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  profileAvatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileAvatarRing: {
    padding: 3,
    borderRadius: 40,
    borderWidth: 2.5,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  profileEmail: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  guestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  guestBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
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
  profileSection: {
    marginBottom: 20,
  },
  profileSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  profileOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
  },
  optionRowSpaced: {
    marginTop: 8,
  },
  profileOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileOptionContent: {
    flex: 1,
    marginLeft: 14,
  },
  profileOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  profileOptionHint: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 16,
    opacity: 0.6,
  },
});
