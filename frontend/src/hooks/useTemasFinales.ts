import { useState, useCallback, useEffect } from 'react';
import { temasFinalesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    TemaFinal,
    CreateTemaFinalDTO,
    TipoVoto,
    EstadisticaTema,
} from '../types/temas-finales';

interface UseTemasFinalesReturn {
    temas: TemaFinal[];
    loading: boolean;
    error: string | null;
    refreshing: boolean;
    isLoggedIn: boolean;
    crearTema: (data: CreateTemaFinalDTO) => Promise<TemaFinal>;
    votar: (id: number, tipo: TipoVoto) => Promise<void>;
    reportar: (id: number, motivo: string) => Promise<void>;
    eliminarTema: (id: number) => Promise<void>;
    getEstadisticas: (materiaId: number) => Promise<EstadisticaTema[]>;
    refetch: () => Promise<void>;
}

export function useTemasFinales(materiaIdFilter?: number): UseTemasFinalesReturn {
    const { user, isGuest } = useAuth();
    const [temas, setTemas] = useState<TemaFinal[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isLoggedIn = !!user && !isGuest;

    const fetchTemas = useCallback(async (materiaId?: number) => {
        try {
            setError(null);
            const data = await temasFinalesApi.getAll(materiaId ?? materiaIdFilter);
            setTemas(data);
        } catch (e: any) {
            console.error('Error cargando temas de finales:', e);
            setError('Error al cargar los temas de finales');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [materiaIdFilter]);

    const crearTema = useCallback(async (data: CreateTemaFinalDTO): Promise<TemaFinal> => {
        const nuevo = await temasFinalesApi.create(data);
        await fetchTemas();
        return nuevo;
    }, [fetchTemas]);

    const votar = useCallback(async (id: number, tipo: TipoVoto) => {
        // Optimistic update
        setTemas(prev => prev.map(t => {
            if (t.id !== id) return t;

            const votoAnterior = t.miVoto;
            let nuevosUtiles = t.votosUtiles;
            let nuevosNoUtiles = t.votosNoUtiles;
            let nuevoVoto: TipoVoto | null = tipo;

            if (votoAnterior === tipo) {
                nuevoVoto = null;
                if (tipo === TipoVoto.Util) nuevosUtiles--;
                else nuevosNoUtiles--;
            } else {
                if (votoAnterior === TipoVoto.Util) {
                    nuevosUtiles--;
                    nuevosNoUtiles++;
                } else if (votoAnterior === TipoVoto.NoUtil) {
                    nuevosNoUtiles--;
                    nuevosUtiles++;
                } else {
                    if (tipo === TipoVoto.Util) nuevosUtiles++;
                    else nuevosNoUtiles++;
                }
            }

            return {
                ...t,
                miVoto: nuevoVoto,
                votosUtiles: Math.max(0, nuevosUtiles),
                votosNoUtiles: Math.max(0, nuevosNoUtiles),
            };
        }));

        try {
            await temasFinalesApi.votar(id, tipo);
        } catch (e) {
            await fetchTemas();
            throw e;
        }
    }, [fetchTemas]);

    const reportar = useCallback(async (id: number, motivo: string) => {
        await temasFinalesApi.reportar(id, motivo);
        setTemas(prev => prev.map(t =>
            t.id === id ? { ...t, reportes: t.reportes + 1 } : t
        ));
    }, []);

    const eliminarTema = useCallback(async (id: number) => {
        await temasFinalesApi.delete(id);
        setTemas(prev => prev.filter(t => t.id !== id));
    }, []);

    const getEstadisticas = useCallback(async (materiaId: number): Promise<EstadisticaTema[]> => {
        return await temasFinalesApi.getEstadisticasMateria(materiaId);
    }, []);

    const refetch = useCallback(async () => {
        setRefreshing(true);
        await fetchTemas();
    }, [fetchTemas]);

    useEffect(() => {
        if (isLoggedIn) {
            fetchTemas();
        } else {
            setLoading(false);
        }
    }, [isLoggedIn, fetchTemas]);

    return {
        temas,
        loading,
        error,
        refreshing,
        isLoggedIn,
        crearTema,
        votar,
        reportar,
        eliminarTema,
        getEstadisticas,
        refetch,
    };
}
