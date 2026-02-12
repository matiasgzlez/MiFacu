import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, mifacuGold } from '../../constants/theme';
import { useColorScheme } from '../../context/ThemeContext';

export const MILO_AVATAR_KEY = '@milo_selected_avatar';

const AVATARS = [
  '🐱', '🐶', '🦊', '🐼', '🐨', '🦁',
  '🐯', '🐸', '🐵', '🦉', '🐧', '🐻',
  '🦄', '🐲', '🐺', '🦈', '🐬', '🦅',
  '🧑‍🎓', '👩‍🎓', '👨‍🎓', '🧑‍💻', '👩‍💻', '👨‍💻',
  '🧠', '📚', '🎯', '🔥', '⚡', '💎',
  '🏆', '🎓', '🌟', '🚀', '💪', '🧪',
];

interface AvatarPickerProps {
  visible: boolean;
  currentAvatar: string | null;
  onSelect: (avatar: string) => void;
  onClose: () => void;
}

export function AvatarPicker({ visible, currentAvatar, onSelect, onClose }: AvatarPickerProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  const [selected, setSelected] = useState<string | null>(currentAvatar);

  const accentColor = isDark ? '#F5C842' : mifacuGold;
  const modalBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const cellBg = isDark ? '#2C2C2E' : '#F2F2F7';
  const selectedBg = isDark ? '#3A3000' : '#FEF3C7';

  const handleSelect = async (avatar: string) => {
    setSelected(avatar);
    try {
      await AsyncStorage.setItem(MILO_AVATAR_KEY, avatar);
    } catch {}
    onSelect(avatar);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={[styles.modalContainer, { backgroundColor: modalBg }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.separator }]}>
          <Text style={[styles.title, { color: theme.text }]}>Elegir avatar</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={theme.icon} />
          </TouchableOpacity>
        </View>

        {/* Current selection preview */}
        <View style={styles.previewContainer}>
          <View style={[styles.previewCircle, { backgroundColor: cellBg }]}>
            <Text style={styles.previewEmoji}>{selected || '🐱'}</Text>
          </View>
          <Text style={[styles.previewLabel, { color: theme.icon }]}>
            Tu avatar de Milo
          </Text>
        </View>

        {/* Grid */}
        <FlatList
          data={AVATARS}
          numColumns={6}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => {
            const isSelected = item === selected;
            return (
              <TouchableOpacity
                style={[
                  styles.avatarCell,
                  { backgroundColor: isSelected ? selectedBg : cellBg },
                  isSelected && { borderColor: accentColor, borderWidth: 2 },
                ]}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.avatarEmoji}>{item}</Text>
                {isSelected && (
                  <View style={[styles.checkBadge, { backgroundColor: accentColor }]}>
                    <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  previewContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  previewCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewEmoji: {
    fontSize: 44,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  gridRow: {
    gap: 10,
    marginBottom: 10,
    justifyContent: 'center',
  },
  avatarCell: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  checkBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
