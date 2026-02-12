import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { materiasApi } from '../src/services/api';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { Colors } from '../src/constants/theme';

// Interfaces
interface Materia {
  id: number;
  nombre: string;
  nivel: number;
  estado: string;
  dia?: string;
  hora?: number;
  duracion?: number;
  aula?: string;
}

export default function PlanEstudiosScreen() {
  const router = useRouter();
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const { isGuest, user } = useAuth();
  const { colorScheme, isDark } = useTheme();
  const theme = Colors[colorScheme];

  const loadMaterias = async () => {
    try {
      setLoading(true);
      const data = await materiasApi.getMateriasByUsuario(user?.id);

      // Mapear el formato del backend al que espera el componente
      const mapped = data.map((um: any) => ({
        id: um.materiaId,
        nombre: um.materia.nombre,
        nivel: parseInt(um.materia.nivel) || 1,
        estado: um.estado,
        dia: um.dia,
        hora: um.hora,
        aula: um.aula
      }));

      setMaterias(mapped);
    } catch (e) {
      console.error("Error cargando materias:", e);
    } finally {
      setLoading(false);
    }
  };

  // Recargar datos al volver a la pantalla
  useFocusEffect(
    React.useCallback(() => {
      loadMaterias();
    }, [isGuest])
  );

  const toggleMateria = (materia: Materia) => {
    // Aquí puedes agregar lógica para cambiar el estado (pendiente -> cursando -> aprobada)
    // Por ahora solo navega al detalle
    router.push({ pathname: '/detalle-materia', params: { id: materia.id } });
  };

  const getColor = (estado: string) => {
    switch (estado) {
      case 'aprobada': return theme.green;
      case 'cursando': return theme.blue;
      case 'regularizada': return theme.orange;
      default: return theme.icon;
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.tint} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.tint }]}>
        <SafeAreaView>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>Mis Materias</Text>
            <View style={{ width: 28 }} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView style={styles.content}>
        {materias.map((materia) => (
          <TouchableOpacity
            key={materia.id}
            style={[styles.card, { backgroundColor: theme.backgroundSecondary, borderColor: getColor(materia.estado), borderWidth: 2 }]}
            onPress={() => toggleMateria(materia)}
          >
            <View style={[styles.statusIndicator, { backgroundColor: getColor(materia.estado) }]} />
            <View style={styles.cardContent}>
              <Text style={[styles.materiaName, { color: theme.text }]}>{materia.nombre}</Text>
              <View style={styles.infoRow}>
                <Text style={[styles.materiaInfo, { color: getColor(materia.estado) }]}>
                  {materia.estado.toUpperCase()}
                </Text>
                {materia.dia && materia.hora && (
                  <Text style={[styles.horario, { color: theme.icon }]}>
                    {materia.dia} {materia.hora}:00 - {materia.aula}
                  </Text>
                )}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.icon} />
          </TouchableOpacity>
        ))}
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingBottom: 20 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50
  },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  content: { flex: 1, padding: 15, marginTop: -20 },
  card: {
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  statusIndicator: { width: 8, height: '80%', borderRadius: 4, marginRight: 12 },
  cardContent: { flex: 1 },
  materiaName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  materiaInfo: { fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  horario: { fontSize: 11 }
});
