import { useState, useCallback, useEffect, useMemo } from 'react';
import { materiasApi, temasFinalesApi, usersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export interface MateriaConTemas {
    id: number;
    numero: number;
    nombre: string;
    nivel: string;
    nivelNumero: number;
    totalTemas: number;
}

export type OrdenTipoTemas = 'temas_desc' | 'temas_asc' | 'alfabetico' | 'numero';
export type NivelFiltro = 'todos' | 1 | 2 | 3 | 4 | 5;

interface UseMateriasTemasFinalesReturn {
    materias: MateriaConTemas[];
    materiasFiltradas: MateriaConTemas[];
    loading: boolean;
    error: string | null;
    refreshing: boolean;
    isLoggedIn: boolean;
    nivelFiltro: NivelFiltro;
    setNivelFiltro: (nivel: NivelFiltro) => void;
    ordenTipo: OrdenTipoTemas;
    setOrdenTipo: (orden: OrdenTipoTemas) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    refetch: () => Promise<void>;
}

const nivelToNumber = (nivel: string): number => {
    const map: Record<string, number> = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5 };
    return map[nivel] || 0;
};

export function useMateriasTemasFinales(): UseMateriasTemasFinalesReturn {
    const { user, isGuest } = useAuth();
    const [materias, setMaterias] = useState<MateriaConTemas[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [nivelFiltro, setNivelFiltro] = useState<NivelFiltro>('todos');
    const [ordenTipo, setOrdenTipo] = useState<OrdenTipoTemas>('temas_desc');
    const [searchQuery, setSearchQuery] = useState('');

    const isLoggedIn = !!user && !isGuest;

    const loadData = useCallback(async () => {
        try {
            setError(null);

            // Obtener carreraId del usuario
            let carreraId: string | null = null;
            if (user?.id) {
                try {
                    const profile = await usersApi.getProfile(user.id);
                    carreraId = profile.carreraId || null;
                } catch (e) {
                    console.warn('No se pudo obtener el perfil del usuario:', e);
                }
            }

            const todasMaterias = await materiasApi.getMaterias(carreraId);

            const nivelesValidos = ['I', 'II', 'III', 'IV', 'V'];
            const materiasDelPlan = todasMaterias.filter((m: any) =>
                m.nivel &&
                nivelesValidos.includes(m.nivel) &&
                m.numero &&
                m.numero >= 1 &&
                m.numero <= 36
            );

            // Cargar todos los temas de una sola vez y contar por materia
            let temasPorMateria = new Map<number, number>();
            try {
                const allTemas = await temasFinalesApi.getAll();
                if (Array.isArray(allTemas)) {
                    for (const tema of allTemas) {
                        const mid = tema.materiaId;
                        if (mid) {
                            temasPorMateria.set(mid, (temasPorMateria.get(mid) || 0) + 1);
                        }
                    }
                }
            } catch (e) {
                // Si el endpoint no está disponible, dejamos el conteo en 0
            }

            const materiasConStats: MateriaConTemas[] = materiasDelPlan.map((m: any) => ({
                id: m.id,
                numero: m.numero,
                nombre: m.nombre,
                nivel: m.nivel,
                nivelNumero: nivelToNumber(m.nivel),
                totalTemas: temasPorMateria.get(m.id) || 0,
            }));

            materiasConStats.sort((a, b) => a.numero - b.numero);

            setMaterias(materiasConStats);

        } catch (e: any) {
            console.error('Error cargando materias:', e);
            setError('Error al cargar las materias');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.id]);

    const materiasFiltradas = useMemo(() => {
        let resultado = [...materias];

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            resultado = resultado.filter(m =>
                m.nombre.toLowerCase().includes(query) ||
                m.numero.toString().includes(query)
            );
        }

        if (nivelFiltro !== 'todos') {
            const nivelNum = typeof nivelFiltro === 'string' ? parseInt(nivelFiltro, 10) : nivelFiltro;
            resultado = resultado.filter(m => m.nivelNumero === nivelNum);
        }

        switch (ordenTipo) {
            case 'temas_desc':
                resultado.sort((a, b) => b.totalTemas - a.totalTemas);
                break;
            case 'temas_asc':
                resultado.sort((a, b) => a.totalTemas - b.totalTemas);
                break;
            case 'alfabetico':
                resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
                break;
            case 'numero':
            default:
                resultado.sort((a, b) => a.numero - b.numero);
                break;
        }

        return resultado;
    }, [materias, searchQuery, nivelFiltro, ordenTipo]);

    const refetch = useCallback(async () => {
        setRefreshing(true);
        await loadData();
    }, [loadData]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return {
        materias,
        materiasFiltradas,
        loading,
        error,
        refreshing,
        isLoggedIn,
        nivelFiltro,
        setNivelFiltro,
        ordenTipo,
        setOrdenTipo,
        searchQuery,
        setSearchQuery,
        refetch,
    };
}
