import { useState, useEffect, useCallback } from 'react';
import { gamificationApi } from '../services/api';

export interface GamificationProfile {
  xpTotal: number;
  nivel: number;
  rachaActual: number;
  rachaMaxima: number;
  sesionesTotales: number;
  minutosTotales: number;
  xpCurrentLevel: number;
  xpNeededForNext: number;
  xpProgressPercent: number;
}

export function useGamification(userId?: string) {
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await gamificationApi.getProfile(userId);
      setProfile({
        xpTotal: data.xp_total ?? data.xpTotal ?? 0,
        nivel: data.nivel ?? 1,
        rachaActual: data.racha_actual ?? data.rachaActual ?? 0,
        rachaMaxima: data.racha_maxima ?? data.rachaMaxima ?? 0,
        sesionesTotales: data.sesiones_totales ?? data.sesionesTotales ?? 0,
        minutosTotales: data.minutos_totales ?? data.minutosTotales ?? 0,
        xpCurrentLevel: data.xpCurrentLevel ?? 0,
        xpNeededForNext: data.xpNeededForNext ?? 100,
        xpProgressPercent: data.xpProgressPercent ?? 0,
      });
    } catch (e) {
      console.error('Error fetching gamification profile:', e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    refresh: fetchProfile,
  };
}
