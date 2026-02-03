import React, { useState, memo, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { DataRepository } from '../../services/dataRepository';
import type { ThemeColors, Recordatorio } from '../../types';
import { mifacuNavy } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

interface TaskItemProps {
  task: Recordatorio;
  onDelete: () => void;
  theme: ThemeColors;
  separatorColor: string;
}

/**
 * Individual task item with edit and complete functionality
 * Optimized with React.memo
 */
export const TaskItem = memo<TaskItemProps>(function TaskItem({
  task,
  onDelete,
  theme,
  separatorColor,
}) {
  const { isDark: isDarkMode } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(task.nombre);
  const [description, setDescription] = useState(task.descripcion || '');

  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const handleSave = useCallback(async () => {
    setIsEditing(false);
    const trimmedText = text.trim();
    const trimmedDesc = description.trim() || undefined;

    if (trimmedText !== task.nombre || trimmedDesc !== task.descripcion) {
      try {
        await DataRepository.updateRecordatorio(task.id, {
          nombre: trimmedText,
          descripcion: trimmedDesc,
        });
      } catch (e) {
        console.error('Error updating task', e);
      }
    }
  }, [text, description, task.nombre, task.descripcion, task.id]);

  const handleComplete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0.9, duration: 250, useNativeDriver: true }),
    ]).start(() => {
      onDelete();
    });
  }, [opacity, scale, onDelete]);

  return (
    <Animated.View
      style={[
        styles.taskItem,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={handleComplete}
        style={styles.taskCheckbox}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <View style={[styles.checkboxCircle, { borderColor: theme.separator, backgroundColor: isDarkMode ? 'transparent' : 'white' }]} />
      </TouchableOpacity>

      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            style={[styles.taskInputEdit, { color: theme.text }]}
            value={text}
            onChangeText={setText}
            autoFocus
            returnKeyType="next"
            accessibilityLabel="Editar nombre de tarea"
            placeholder="Título"
            placeholderTextColor={theme.separator}
          />
          <TextInput
            style={[styles.descriptionInputEdit, { color: theme.icon }]}
            value={description}
            onChangeText={setDescription}
            onBlur={handleSave}
            onSubmitEditing={handleSave}
            returnKeyType="done"
            accessibilityLabel="Editar descripción de tarea"
            placeholder="Descripción (opcional)"
            placeholderTextColor={theme.separator}
          />
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => setIsEditing(true)}
          style={styles.textContainer}
          accessibilityLabel={`Tarea: ${text}. Toca para editar`}
          accessibilityRole="button"
        >
          <Text style={[styles.taskText, { color: theme.text, fontWeight: '500' }]} numberOfLines={2}>{text}</Text>
          {task.descripcion && (
            <Text style={[styles.taskDescription, { color: theme.icon }]}>{task.descripcion}</Text>
          )}
        </TouchableOpacity>
      )}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  taskCheckbox: {
    marginRight: 12,
    marginTop: 2,
  },
  checkboxCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
  },
  textContainer: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 21,
  },
  taskDescription: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  editContainer: {
    flex: 1,
  },
  taskInputEdit: {
    fontSize: 16,
    fontWeight: '500',
    padding: 0,
  },
  descriptionInputEdit: {
    fontSize: 13,
    padding: 0,
    marginTop: 4,
  },
});
