import { useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useRecordatorios, useMisMaterias, useMateriasDisponibles } from './useQueries';
import { useRefetchOnFocus } from './useRefetchOnFocus';
import type { Recordatorio, ProximaClase, Stats } from '../types';

export interface MateriaUsuario {
  id: number;
  estado: string;
  dia?: string;
  hora?: number | null;
  duracion?: number;
  aula?: string;
  schedules?: Array<{ dia: string; hora: number; duracion: number; aula?: string | null }>;
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

function getScheduleEntries(m: MateriaUsuario): Array<{ dia: string; hora: number; duracion: number; aula?: string | null }> {
  if (m.schedules && m.schedules.length > 0) return m.schedules;
  if (m.dia && m.hora != null) return [{ dia: m.dia, hora: m.hora, duracion: m.duracion || 2, aula: m.aula }];
  return [];
}

function calculateClasesHoy(cursandoMaterias: MateriaUsuario[]): ClaseHoy[] {
  if (cursandoMaterias.length === 0) return [];

  const diasSemana = ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'];
  const hoy = new Date();
  const diaActual = diasSemana[hoy.getDay()];
  const horaActual = hoy.getHours();

  const clases: ClaseHoy[] = [];

  cursandoMaterias.forEach((m) => {
    const entries = getScheduleEntries(m);
    entries.forEach((s) => {
      if (s.dia === diaActual && s.hora !== null && s.hora !== undefined) {
        const horaMateria = typeof s.hora === 'number' ? s.hora : parseInt(String(s.hora));
        const duracion = s.duracion || 2;
        const horaMateriaFin = horaMateria + duracion;
        const esActual = horaActual >= horaMateria && horaActual < horaMateriaFin;

        clases.push({
          materia: m.materia?.nombre || m.nombre || 'Materia',
          hora: `${horaMateria}:00`,
          horaFin: `${horaMateriaFin}:00`,
          aula: s.aula || '-',
          esActual,
        });
      }
    });
  });

  clases.sort((a, b) => parseInt(a.hora) - parseInt(b.hora));
  return clases;
}

function calculateProximaClase(cursandoMaterias: MateriaUsuario[]): ProximaClase | null {
  if (cursandoMaterias.length === 0) return null;

  const diasSemana = ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'];
  const hoy = new Date();
  const diaActual = diasSemana[hoy.getDay()];
  const horaActual = hoy.getHours();

  let proxima: ProximaClase | null = null;
  let actual: ProximaClase | null = null;
  let minDiff = Infinity;

  cursandoMaterias.forEach((m) => {
    const entries = getScheduleEntries(m);
    entries.forEach((s) => {
      if (s.dia === diaActual && s.hora !== null && s.hora !== undefined) {
        const horaMateria = typeof s.hora === 'number' ? s.hora : parseInt(String(s.hora));
        const duracion = s.duracion || 2;
        const horaMateriaFin = horaMateria + duracion;
        const diff = horaMateria - horaActual;

        if (horaActual >= horaMateria && horaActual < horaMateriaFin) {
          actual = {
            materia: m.materia?.nombre || m.nombre || 'Materia',
            hora: `${horaMateria}:00 a ${horaMateriaFin}:00 hs`,
            aula: s.aula || 'Aula',
            tipo: 'Clase Actual',
          };
        } else if (diff > 0 && diff < minDiff) {
          minDiff = diff;
          proxima = {
            materia: m.materia?.nombre || m.nombre || 'Materia',
            hora: `${horaMateria}:00 hs`,
            aula: s.aula || 'Aula',
            tipo: 'Próxima Clase',
          };
        }
      }
    });
  });

  if (actual) return actual;
  if (proxima) return proxima;

  return {
    materia: 'No hay más clases hoy',
    hora: 'Ver Horarios',
    aula: '-',
    tipo: 'Horarios',
  };
}

/**
 * Hook that manages all home screen data loading and state.
 * Now backed by React Query for global cache + instant navigation.
 */
export function useHomeData(): UseHomeDataReturn {
  const { user, loading: authLoading } = useAuth();

  const recordatoriosQuery = useRecordatorios();
  const misMateriasQuery = useMisMaterias();
  const materiasDisponiblesQuery = useMateriasDisponibles();

  // Refetch on focus only if stale
  useRefetchOnFocus(recordatoriosQuery);
  useRefetchOnFocus(misMateriasQuery);
  useRefetchOnFocus(materiasDisponiblesQuery);

  // Local override state for optimistic inline editing of quick tasks
  const [tasksOverride, setTasksOverride] = useState<Recordatorio[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);

  // Load privacy mode from AsyncStorage on mount
  useState(() => {
    AsyncStorage.getItem('privacy_mode').then((mode) => {
      if (mode === 'true') setPrivacyMode(true);
    }).catch(() => {});
  });

  // Derive tasks from query data
  const queryTasks = useMemo(() => {
    const recordatorios = recordatoriosQuery.data;
    if (!Array.isArray(recordatorios)) return [];
    return recordatorios.filter((r: any) => r.tipo === 'quick_task');
  }, [recordatoriosQuery.data]);

  // Use override if set, otherwise query data
  const tasks = tasksOverride ?? queryTasks;

  // Reset override when query data changes (after invalidation)
  const setTasks: React.Dispatch<React.SetStateAction<Recordatorio[]>> = useCallback((action) => {
    setTasksOverride((prev) => {
      const current = prev ?? queryTasks;
      return typeof action === 'function' ? action(current) : action;
    });
  }, [queryTasks]);

  // Clear override when recordatorios query refetches successfully
  useMemo(() => {
    if (recordatoriosQuery.dataUpdatedAt && tasksOverride !== null) {
      setTasksOverride(null);
    }
  }, [recordatoriosQuery.dataUpdatedAt]);

  // Compute stats from query data
  const { stats, carreraProgreso, cursandoMaterias, proximaClase, clasesHoy, subtituloContextual } = useMemo(() => {
    const userMaterias = misMateriasQuery.data as MateriaUsuario[] | undefined;
    const availableMaterias = materiasDisponiblesQuery.data as any[] | undefined;

    if (!userMaterias) {
      return {
        stats: INITIAL_STATS,
        carreraProgreso: 0,
        cursandoMaterias: [] as MateriaUsuario[],
        proximaClase: null as ProximaClase | null,
        clasesHoy: [] as ClaseHoy[],
        subtituloContextual: '',
      };
    }

    const totalPlan = (userMaterias?.length || 0) + (availableMaterias?.length || 0);
    const aprobadas = userMaterias?.filter((m: any) => m.estado === 'aprobado').length || 0;
    const cursando = userMaterias?.filter((m: any) => m.estado === 'cursado').length || 0;
    const regulares = userMaterias?.filter((m: any) => m.estado === 'regular').length || 0;
    const noCursadas = availableMaterias?.length || 0;

    const computedStats: Stats = { aprobadas, cursando, regulares, totalPlan, noCursadas };
    const progreso = totalPlan > 0 ? Math.round((aprobadas / totalPlan) * 100) : 0;

    const materiasCursando = userMaterias.filter(
      (m: any) => String(m.estado).toLowerCase().includes('cursad') && (
        (m.schedules && m.schedules.length > 0) ||
        (m.dia && m.hora !== null)
      )
    );

    const todayClasses = calculateClasesHoy(materiasCursando);
    const prox = calculateProximaClase(materiasCursando);

    let subtitulo = '';
    if (todayClasses.length > 0) {
      const actual = todayClasses.find((c) => c.esActual);
      if (actual) {
        subtitulo = `En clase: ${actual.materia}`;
      } else {
        subtitulo = `${todayClasses.length} clase${todayClasses.length > 1 ? 's' : ''} hoy`;
      }
    } else {
      subtitulo = 'Día libre';
    }

    return {
      stats: computedStats,
      carreraProgreso: progreso,
      cursandoMaterias: materiasCursando,
      proximaClase: prox,
      clasesHoy: todayClasses,
      subtituloContextual: subtitulo,
    };
  }, [misMateriasQuery.data, materiasDisponiblesQuery.data]);

  // Loading = true only on first load (no cached data yet)
  const loading = authLoading || (
    !recordatoriosQuery.data && recordatoriosQuery.isLoading
  ) || (
    !!user?.id && !misMateriasQuery.data && misMateriasQuery.isLoading
  );

  const loadData = useCallback(async () => {
    await Promise.all([
      recordatoriosQuery.refetch(),
      misMateriasQuery.refetch(),
      materiasDisponiblesQuery.refetch(),
    ]);
  }, [recordatoriosQuery.refetch, misMateriasQuery.refetch, materiasDisponiblesQuery.refetch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const togglePrivacyMode = useCallback(async () => {
    const newVal = !privacyMode;
    setPrivacyMode(newVal);
    await AsyncStorage.setItem('privacy_mode', String(newVal));
  }, [privacyMode]);

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
