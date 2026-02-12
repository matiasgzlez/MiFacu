import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, mifacuGold } from '../../constants/theme';
import { useColorScheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { materiasApi } from '../../services/api';

const CUSTOM_TAGS_KEY = '@milo_custom_tags';

export interface SelectedSubject {
  id: string;
  name: string;
  type: 'materia' | 'tag';
}

interface SubjectSelectorProps {
  selected: SelectedSubject | null;
  onSelect: (subject: SelectedSubject | null) => void;
}

export function SubjectSelector({ selected, onSelect }: SubjectSelectorProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const { user } = useAuth();
  const isDark = colorScheme === 'dark';

  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [materias, setMaterias] = useState<any[]>([]);
  const [customTags, setCustomTags] = useState<SelectedSubject[]>([]);
  const [loading, setLoading] = useState(false);

  // Load materias and custom tags
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Load user's materias
      if (user?.id) {
        const data = await materiasApi.getMateriasByUsuario(user.id);
        setMaterias(data || []);
      }
      // Load custom tags from AsyncStorage
      const storedTags = await AsyncStorage.getItem(CUSTOM_TAGS_KEY);
      if (storedTags) {
        setCustomTags(JSON.parse(storedTags));
      }
    } catch (e) {
      console.error('Error loading subjects:', e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (modalVisible) {
      loadData();
    }
  }, [modalVisible, loadData]);

  // Save a new custom tag
  const createTag = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const newTag: SelectedSubject = {
      id: `tag_${Date.now()}`,
      name: trimmed,
      type: 'tag',
    };

    const updated = [...customTags, newTag];
    setCustomTags(updated);
    await AsyncStorage.setItem(CUSTOM_TAGS_KEY, JSON.stringify(updated));
    onSelect(newTag);
    setSearch('');
    setModalVisible(false);
  }, [customTags, onSelect]);

  // Remove a custom tag
  const removeTag = useCallback(async (tagId: string) => {
    const updated = customTags.filter((t) => t.id !== tagId);
    setCustomTags(updated);
    await AsyncStorage.setItem(CUSTOM_TAGS_KEY, JSON.stringify(updated));
    if (selected?.id === tagId) {
      onSelect(null);
    }
  }, [customTags, selected, onSelect]);

  // Build combined list: materias + custom tags, filtered by search
  const items = useMemo(() => {
    const query = search.toLowerCase().trim();
    const materiasItems: SelectedSubject[] = materias.map((m) => ({
      id: m.materiaId || m.materia?.id,
      name: m.materia?.nombre || m.nombre || 'Sin nombre',
      type: 'materia' as const,
    }));

    const all = [...materiasItems, ...customTags];
    if (!query) return all;
    return all.filter((item) => item.name.toLowerCase().includes(query));
  }, [materias, customTags, search]);

  // Check if search text matches any existing item
  const canCreateTag = useMemo(() => {
    const trimmed = search.trim();
    if (!trimmed) return false;
    return !items.some((item) => item.name.toLowerCase() === trimmed.toLowerCase());
  }, [search, items]);

  const bgColor = isDark ? '#1C1C1E' : '#F2F2F7';
  const cardColor = isDark ? '#2C2C2E' : '#FFFFFF';
  const modalBg = isDark ? '#1C1C1E' : '#FFFFFF';

  return (
    <>
      {/* Trigger button */}
      <TouchableOpacity
        style={[styles.selector, { backgroundColor: bgColor }]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={selected ? 'book' : 'book-outline'}
          size={18}
          color={selected ? mifacuGold : theme.icon}
        />
        <Text
          style={[
            styles.selectorText,
            { color: selected ? theme.text : theme.icon },
          ]}
          numberOfLines={1}
        >
          {selected ? selected.name : 'Seleccionar materia (opcional)'}
        </Text>
        {selected && (
          <TouchableOpacity
            onPress={() => onSelect(null)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={18} color={theme.icon} />
          </TouchableOpacity>
        )}
        <Ionicons name="chevron-down" size={16} color={theme.icon} style={styles.chevron} />
      </TouchableOpacity>

      {/* Selection modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={[styles.modalContainer, { backgroundColor: modalBg }]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: theme.separator }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Materia de estudio</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={theme.icon} />
            </TouchableOpacity>
          </View>

          {/* Search / Create */}
          <View style={[styles.searchRow, { backgroundColor: bgColor }]}>
            <Ionicons name="search" size={18} color={theme.icon} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Buscar o crear tag..."
              placeholderTextColor={theme.icon}
              value={search}
              onChangeText={setSearch}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={() => canCreateTag && createTag(search)}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={theme.icon} />
              </TouchableOpacity>
            )}
          </View>

          {/* Create tag button */}
          {canCreateTag && (
            <TouchableOpacity
              style={[styles.createTagBtn, { backgroundColor: isDark ? '#2C2C2E' : '#EEF2FF' }]}
              onPress={() => createTag(search)}
            >
              <Ionicons name="add-circle" size={20} color={mifacuGold} />
              <Text style={[styles.createTagText, { color: theme.text }]}>
                Crear tag "{search.trim()}"
              </Text>
            </TouchableOpacity>
          )}

          {/* List */}
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: theme.icon }]}>
                {loading ? 'Cargando...' : 'No hay materias cargadas'}
              </Text>
            }
            renderItem={({ item }) => {
              const isSelected = selected?.id === item.id;
              return (
                <TouchableOpacity
                  style={[
                    styles.listItem,
                    { backgroundColor: isSelected ? (isDark ? '#1A3A6A' : '#EEF2FF') : cardColor },
                  ]}
                  onPress={() => {
                    onSelect(item);
                    setModalVisible(false);
                    setSearch('');
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={item.type === 'materia' ? 'school-outline' : 'pricetag-outline'}
                    size={18}
                    color={isSelected ? mifacuGold : theme.icon}
                  />
                  <Text
                    style={[
                      styles.listItemText,
                      { color: theme.text },
                      isSelected && { fontWeight: '600' },
                    ]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  {item.type === 'tag' && (
                    <TouchableOpacity
                      onPress={() => removeTag(item.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      style={styles.removeBtn}
                    >
                      <Ionicons name="trash-outline" size={16} color={theme.red} />
                    </TouchableOpacity>
                  )}
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={mifacuGold} />
                  )}
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={() => (
              <View style={[styles.separator, { backgroundColor: theme.separator }]} />
            )}
          />
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
  },
  selectorText: {
    flex: 1,
    fontSize: 15,
  },
  chevron: {
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  createTagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  createTagText: {
    fontSize: 15,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 10,
  },
  listItemText: {
    flex: 1,
    fontSize: 15,
  },
  removeBtn: {
    padding: 4,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 2,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
  },
});
