import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  useColorScheme,
  TextInput,
  Pressable,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../src/constants/theme';
import { useThemeColor } from '../src/hooks/use-theme-color';
import { useAuth } from '../src/context/AuthContext';
import { materiasApi } from '../src/services/api';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user, isGuest } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [carreraProgreso, setCarreraProgreso] = useState(0);

  // Colores dinámicos
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'backgroundSecondary');
  const separatorColor = useThemeColor({}, 'separator');

  // Cargar datos reales
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user, isGuest])
  );

  const loadData = async () => {
    try {
      setLoading(true);

      // Intentar obtener ID legacy de AsyncStorage (igual que mis-materias.tsx)
      let userId = await AsyncStorage.getItem('usuario_nombre');

      // Si no hay legacy, usar AuthContext
      if (!userId && user) {
        userId = user.id;
      }

      if (userId) {
        // 1. Obtener materias del usuario para el numerador (Aprobadas)
        const userMaterias = await materiasApi.getMateriasByUsuario(userId);
        const aprobadas = userMaterias ? userMaterias.filter((m: any) => m.estado === 'aprobado').length : 0;

        // 2. Obtener TODAS las materias del plan para el denominador (Total Carrera)
        const allMaterias = await materiasApi.getMaterias();
        const totalPlan = allMaterias ? allMaterias.length : 0;

        if (totalPlan > 0) {
          const porcentaje = Math.round((aprobadas / totalPlan) * 100);
          setCarreraProgreso(porcentaje);
        }
      } else if (isGuest) {
        // Lógica para invitados si se desea persistir progreso local
        setCarreraProgreso(0);
      }
    } catch (error) {
      console.error("Error cargando progreso:", error);
    } finally {
      setLoading(false);
    }
  };

  const proximaClase = {
    materia: "Cargando clase...",
    hora: "Ver agenda",
    aula: "Pabellón Central",
    tipo: "Pendiente"
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* HEADER iOS */}
      <View style={[styles.header, { borderBottomColor: separatorColor }]}>
        <SafeAreaView>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.headerLabel, { color: theme.icon }]}>MI PANEL</Text>
              <Text style={[styles.headerTitle, { color: textColor }]}>Hola, Matías 👋</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.avatarContainer, { borderColor: theme.tint + '40' }]}
            >
              <Image
                source={{ uri: 'https://i.pravatar.cc/100?img=33' }}
                style={styles.avatar}
              />
            </TouchableOpacity>
          </View>

          {/* BARRA DE PROGRESO DE CARRERA */}
          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <Text style={[styles.progressText, { color: theme.icon }]}>Progreso de Carrera</Text>
              <Text style={[styles.progressPercentage, { color: theme.tint }]}>{carreraProgreso}%</Text>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: theme.separator + '40' }]}>
              <View style={[styles.progressBarFill, { width: `${carreraProgreso}%`, backgroundColor: theme.tint }]} />
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
      >
        {/* BARRA DE BÚSQUEDA (Sticky en iOS) */}
        <View style={[styles.searchContainer, { backgroundColor }]}>
          <View style={[styles.searchBar, { backgroundColor: theme.backgroundSecondary }]}>
            <Ionicons name="search" size={18} color={theme.icon} style={{ marginLeft: 10 }} />
            <TextInput
              placeholder="Buscar materias, finales..."
              placeholderTextColor={theme.icon}
              style={[styles.searchInput, { color: theme.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={theme.icon} style={{ marginRight: 10 }} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* WIDGET: PRÓXIMO PASO */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.icon }]}>PRÓXIMO PASO</Text>
          <Pressable
            style={({ pressed }) => [
              styles.nextStepWidget,
              { backgroundColor: theme.tint, opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }
            ]}
          >
            <View style={styles.widgetHeader}>
              <View style={styles.widgetBadge}>
                <Text style={styles.widgetBadgeText}>{proximaClase.tipo}</Text>
              </View>
              <Ionicons name="notifications-outline" size={20} color="white" />
            </View>
            <Text style={styles.widgetMateria}>{proximaClase.materia}</Text>
            <View style={styles.widgetFooter}>
              <View style={styles.widgetInfoItem}>
                <Ionicons name="time-outline" size={14} color="white" />
                <Text style={styles.widgetInfoText}>{proximaClase.hora}</Text>
              </View>
              <View style={styles.widgetInfoItem}>
                <Ionicons name="location-outline" size={14} color="white" />
                <Text style={styles.widgetInfoText}>{proximaClase.aula}</Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* SECCIÓN: ACCIONES RÁPIDAS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.icon }]}>ACCESO RÁPIDO</Text>
          <View style={styles.priorityGrid}>
            <PriorityCard
              icon="star"
              label="Finales"
              subtitle="En curso"
              color={theme.blue}
              onPress={() => router.push('/finales')}
              theme={theme}
              cardColor={cardColor}
            />
            <PriorityCard
              icon="calendar"
              label="Parciales"
              subtitle="Próximos"
              color={theme.orange}
              onPress={() => router.push('/parciales')}
              theme={theme}
              cardColor={cardColor}
            />
          </View>
        </View>

        {/* SECCIÓN: HERRAMIENTAS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.icon }]}>HERRAMIENTAS</Text>
          <View style={[styles.tableContainer, { backgroundColor: cardColor, borderColor: separatorColor }]}>
            <TableRow
              icon="book"
              label="Mis Materias"
              color={theme.blue}
              onPress={() => router.push('/mis-materias')}
              isLast={false}
              theme={theme}
            />
            <TableRow
              icon="time"
              label="Horarios"
              color={theme.green}
              onPress={() => router.push('/horarios')}
              isLast={false}
              theme={theme}
            />
            <TableRow
              icon="calculator"
              label="Simulador de Notas"
              color={theme.red}
              onPress={() => router.push('/simulador')}
              isLast={false}
              theme={theme}
            />
            <TableRow
              icon="folder-open"
              label="Repositorio"
              color={theme.slate}
              onPress={() => router.push('/repositorio' as any)}
              isLast={true}
              theme={theme}
            />
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="checkmark-circle-outline" size={14} color={theme.green} />
          <Text style={[styles.infoText, { color: theme.icon }]}>
            Datos sincronizados correctamente
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// COMPONENTE: TARJETA DE PRIORIDAD CON PRESSABLE
const PriorityCard = ({ icon, label, subtitle, color, onPress, theme, cardColor }: any) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.priorityCard,
      { backgroundColor: cardColor, transform: [{ scale: pressed ? 0.96 : 1 }] }
    ]}
  >
    <View style={[styles.priorityIcon, { backgroundColor: color }]}>
      <Ionicons name={icon} size={22} color="white" />
    </View>
    <Text style={[styles.priorityLabel, { color: theme.text }]}>{label}</Text>
    <Text style={[styles.prioritySubtitle, { color: theme.icon }]}>{subtitle}</Text>
  </Pressable>
);

// COMPONENTE: FILA DE TABLA
const TableRow = ({ icon, label, color, onPress, isLast, theme }: any) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.rowWrapper,
      { backgroundColor: pressed ? theme.separator + '20' : 'transparent' }
    ]}
  >
    <View style={[styles.rowContainer, !isLast && { borderBottomColor: theme.separator, borderBottomWidth: StyleSheet.hairlineWidth }]}>
      <View style={[styles.rowIconBox, { backgroundColor: color }]}>
        <Ionicons name={icon} size={18} color="white" />
      </View>
      <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={theme.separator} />
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  avatarContainer: {
    borderWidth: 2,
    padding: 3,
    borderRadius: 50,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  progressSection: {
    marginTop: 5,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    borderRadius: 10,
    paddingHorizontal: 5,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 8,
    fontSize: 16,
  },
  section: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nextStepWidget: {
    padding: 20,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  widgetBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  widgetBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  widgetMateria: {
    color: 'white',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 15,
    letterSpacing: -0.5,
  },
  widgetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  widgetInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  widgetInfoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    opacity: 0.9,
  },
  priorityGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityCard: {
    flex: 1,
    marginHorizontal: 5,
    padding: 16,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  priorityIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  priorityLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  prioritySubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  tableContainer: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  rowWrapper: {
    width: '100%',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginLeft: 55,
  },
  rowIconBox: {
    position: 'absolute',
    left: -40,
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 17,
    fontWeight: '400',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingBottom: 20,
  },
  infoText: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 6,
  },
});
