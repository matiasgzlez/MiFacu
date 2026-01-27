import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EstadoMateriaKey, EstadosMateria } from './types';

interface MateriaSearchBarProps {
  theme: any;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filtroActivo: 'todas' | EstadoMateriaKey;
  onFiltroChange: (filtro: 'todas' | EstadoMateriaKey) => void;
  estadosMateria: EstadosMateria;
  onHaptic?: () => void;
}

export function MateriaSearchBar({
  theme,
  searchQuery,
  onSearchChange,
  filtroActivo,
  onFiltroChange,
  estadosMateria,
  onHaptic,
}: MateriaSearchBarProps) {
  const handleFilterPress = (filtro: 'todas' | EstadoMateriaKey) => {
    onHaptic?.();
    onFiltroChange(filtro);
  };

  return (
    <View style={styles.searchSection}>
      {/* Barra de búsqueda */}
      <View style={[styles.searchContainer, { backgroundColor: theme.backgroundSecondary }]}>
        <Ionicons name="search" size={18} color={theme.icon} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Buscar materia..."
          placeholderTextColor={theme.icon}
          value={searchQuery}
          onChangeText={onSearchChange}
          returnKeyType="search"
          accessibilityLabel="Buscar materia"
          accessibilityHint="Escribe el nombre de la materia que buscas"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => onSearchChange('')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Limpiar búsqueda"
            accessibilityRole="button"
          >
            <Ionicons name="close-circle" size={18} color={theme.icon} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros por estado */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContent}
      >
        <TouchableOpacity
          onPress={() => handleFilterPress('todas')}
          style={[
            styles.filterChip,
            { backgroundColor: filtroActivo === 'todas' ? theme.blue : theme.backgroundSecondary },
          ]}
          accessibilityLabel="Filtrar todas las materias"
          accessibilityState={{ selected: filtroActivo === 'todas' }}
          accessibilityRole="button"
        >
          <Text
            style={[styles.filterChipText, { color: filtroActivo === 'todas' ? '#fff' : theme.text }]}
          >
            Todas
          </Text>
        </TouchableOpacity>
        {Object.entries(estadosMateria).map(([key, info]) => (
          <TouchableOpacity
            key={key}
            onPress={() => handleFilterPress(key as EstadoMateriaKey)}
            style={[
              styles.filterChip,
              { backgroundColor: filtroActivo === key ? info.color : theme.backgroundSecondary },
            ]}
            accessibilityLabel={`Filtrar por ${info.label}`}
            accessibilityState={{ selected: filtroActivo === key }}
            accessibilityRole="button"
          >
            <Text
              style={[styles.filterChipText, { color: filtroActivo === key ? '#fff' : theme.text }]}
            >
              {info.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  searchSection: { paddingHorizontal: 20, marginBottom: 15 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, height: '100%' },
  filtersScroll: { marginHorizontal: -20 },
  filtersContent: { paddingHorizontal: 20, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipText: { fontSize: 14, fontWeight: '600' },
});
