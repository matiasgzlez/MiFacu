import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { materiasApi } from '../services/api';
import { DataRepository } from '../services/dataRepository';
import type { Recordatorio, ProximaClase, Stats } from '../types';

export interface MateriaUsuario {
  id: number;
  estado: string;
  dia?: string;
  hora?: number | null;
  duracion?: number;
  aula?: string;
  materia?: {
    id: number;
    nombre: string;
  };
  nombre?: string;
}

export interface ClaseHoy {
  materia: string;
  hora: string;
  horaFin: string;
  aula: string;
  esActual: boolean;
}

interface UseHomeDataReturn {
  // States
  loading: boolean;
  refreshing: boolean;
  tasks: Recordatorio[];
  stats: Stats;
  carreraProgreso: number;
  proximaClase: ProximaClase | null;
  clasesHoy: ClaseHoy[];
  cursandoMaterias: MateriaUsuario[];
  subtituloContextual: string;
  privacyMode: boolean;
  // Actions
  loadData: () => Promise<void>;
  onRefresh: () => Promise<void>;
  togglePrivacyMode: () => Promise<void>;
  setTasks: React.Dispatch<React.SetStateAction<Recordatorio[]>>;
}

const INITIAL_STATS: Stats = {
  aprobadas: 0,
  cursando: 0,
  regulares: 0,
  totalPlan: 0,
  noCursadas: 0,
};

/**
 * Hook that manages all home screen data loading and state
 */
export function useHomeData(): UseHomeDataReturn {
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState<Recordatorio[]>([]);
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  const [carreraProgreso, setCarreraProgreso] = useState(0);
  const [proximaClase, setProximaClase] = useState<ProximaClase | null>(null);
  const [clasesHoy, setClasesHoy] = useState<ClaseHoy[]>([]);
  const [cursandoMaterias, setCursandoMaterias] = useState<MateriaUsuario[]>([]);
  const [subtituloContextual, setSubtituloContextual] = useState('');
  const [privacyMode, setPrivacyMode] = useState(false);

  // Track if initial load has been done to avoid showing skeleton on subsequent focus
  const hasLoadedOnce = useRef(false);

  const checkPrivacyMode = useCallback(async () => {
    try {
      const mode = await AsyncStorage.getItem('privacy_mode');
      setPrivacyMode(mode === 'true');
    } catch (e) {
      // Silently fail
    }
  }, []);

  const togglePrivacyMode = useCallback(async () => {
    const newVal = !privacyMode;
    setPrivacyMode(newVal);
    await AsyncStorage.setItem('privacy_mode', String(newVal));
  }, [privacyMode]);

  const calculateClasesHoy = useCallback((cursandoMaterias: MateriaUsuario[]): ClaseHoy[] => {
    if (cursandoMaterias.length === 0) return [];

    const diasSemana = ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'];
    const hoy = new Date();
    const diaActual = diasSemana[hoy.getDay()];
    const horaActual = hoy.getHours();

    const clases: ClaseHoy[] = [];

    cursandoMaterias.forEach((m) => {
      if (m.dia === diaActual && m.hora !== null && m.hora !== undefined) {
        const horaMateria = typeof m.hora === 'number' ? m.hora : parseInt(String(m.hora));
        const duracion = m.duracion || 2;
        const horaMateriaFin = horaMateria + duracion;
        const esActual = horaActual >= horaMateria && horaActual < horaMateriaFin;

        clases.push({
          materia: m.materia?.nombre || m.nombre || 'Materia',
          hora: `${horaMateria}:00`,
          horaFin: `${horaMateriaFin}:00`,
          aula: m.aula || '-',
          esActual,
        });
      }
    });

    clases.sort((a, b) => {
      const horaA = parseInt(a.hora);
      const horaB = parseInt(b.hora);
      return horaA - horaB;
    });

    return clases;
  }, []);

  const calculateProximaClase = useCallback((cursandoMaterias: MateriaUsuario[]): ProximaClase | null => {
    if (cursandoMaterias.length === 0) return null;

    const diasSemana = ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'];
    const hoy = new Date();
    const diaActual = diasSemana[hoy.getDay()];
    const horaActual = hoy.getHours();

    let proxima: ProximaClase | null = null;
    let actual: ProximaClase | null = null;
    let minDiff = Infinity;

    cursandoMaterias.forEach((m) => {
      if (m.dia === diaActual && m.hora !== null && m.hora !== undefined) {
        const horaMateria = typeof m.hora === 'number' ? m.hora : parseInt(String(m.hora));
        const duracion = m.duracion || 2;
        const horaMateriaFin = horaMateria + duracion;
        const diff = horaMateria - horaActual;

        if (horaActual >= horaMateria && horaActual < horaMateriaFin) {
          actual = {
            materia: m.materia?.nombre || m.nombre || 'Materia',
            hora: `${horaMateria}:00 a ${horaMateriaFin}:00 hs`,
            aula: m.aula || 'Aula',
            tipo: 'Clase Actual',
          };
        } else if (diff > 0 && diff < minDiff) {
          minDiff = diff;
          proxima = {
            materia: m.materia?.nombre || m.nombre || 'Materia',
            hora: `${horaMateria}:00 hs`,
            aula: m.aula || 'Aula',
            tipo: 'Próxima Clase',
          };
        }
      }
    });

    if (actual) return actual;
    if (proxima) return proxima;

    return {
      materia: 'No hay más clases hoy',
      hora: 'Ver Horarios',
      aula: '-',
      tipo: 'Horarios',
    };
  }, []);

  const loadData = useCallback(async () => {
    if (authLoading) return;

    try {
      // Only show loading skeleton on initial load, not on subsequent focus
      if (!hasLoadedOnce.current) {
        setLoading(true);
      }

      if (!user) {
        setLoading(false);
        return;
      }

      const userId = user.id;

      // Load tasks - solo mostrar tareas rápidas (tipo 'quick_task'), no parciales/entregas/finales
      const recordatorios = await DataRepository.getRecordatorios();
      const tareasRapidas = Array.isArray(recordatorios)
        ? recordatorios.filter((r: any) => r.tipo === 'quick_task')
        : [];
      setTasks(tareasRapidas);

      if (userId) {
        // Fetch data concurrently for efficiency
        const [userMaterias, availableMaterias] = await Promise.all([
          materiasApi.getMateriasByUsuario(userId),
          materiasApi.getMateriasDisponibles(userId)
        ]);

        const totalPlan = (userMaterias?.length || 0) + (availableMaterias?.length || 0);

        const aprobadas = userMaterias?.filter((m: any) => m.estado === 'aprobado').length || 0;
        const cursando = userMaterias?.filter((m: any) => m.estado === 'cursado').length || 0;
        const regulares = userMaterias?.filter((m: any) => m.estado === 'regular').length || 0;
        const noCursadas = availableMaterias?.length || 0;

        setStats({ aprobadas, cursando, regulares, totalPlan, noCursadas });

        if (totalPlan > 0) {
          setCarreraProgreso(Math.round((aprobadas / totalPlan) * 100));
        }

        // Calculate next class and today's classes
        const materiasCursando = userMaterias.filter(
          (m: any) => String(m.estado).toLowerCase().includes('cursad') && m.dia && m.hora !== null
        );
        setCursandoMaterias(materiasCursando);
        setProximaClase(calculateProximaClase(materiasCursando));

        const todayClasses = calculateClasesHoy(materiasCursando);
        setClasesHoy(todayClasses);

        // Subtítulo contextual
        if (todayClasses.length > 0) {
          const actual = todayClasses.find((c) => c.esActual);
          if (actual) {
            setSubtituloContextual(`En clase: ${actual.materia}`);
          } else {
            setSubtituloContextual(`${todayClasses.length} clase${todayClasses.length > 1 ? 's' : ''} hoy`);
          }
        } else {
          setSubtituloContextual('Día libre');
        }
      }
    } catch (error) {
      console.error('Error cargando progreso:', error);
    } finally {
      setLoading(false);
      hasLoadedOnce.current = true;
    }
  }, [authLoading, user, calculateProximaClase, calculateClasesHoy]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Auto-load on focus
  useFocusEffect(
    useCallback(() => {
      if (!authLoading) {
        loadData();
        checkPrivacyMode();
      }
    }, [authLoading, loadData, checkPrivacyMode])
  );

  return {
    loading,
    refreshing,
    tasks,
    stats,
    carreraProgreso,
    proximaClase,
    clasesHoy,
    cursandoMaterias,
    subtituloContextual,
    privacyMode,
    loadData,
    onRefresh,
    togglePrivacyMode,
    setTasks,
  };
}
