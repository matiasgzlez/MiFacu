import { Repository } from 'typeorm';
import { AppDataSource } from '../config/DataSource';
import { UserGamification } from '../models/user-gamification.model';
import { AppError } from '../middleware/errorHandler.middleware';

// Tabla de niveles sincronizada con frontend/src/constants/levels.ts
const LEVEL_XP_THRESHOLDS: { level: number; xpRequired: number }[] = [
    { level: 1, xpRequired: 0 },
    { level: 2, xpRequired: 1 },
    { level: 3, xpRequired: 30 },
    { level: 4, xpRequired: 80 },
    { level: 5, xpRequired: 150 },
    { level: 6, xpRequired: 250 },
    { level: 7, xpRequired: 400 },
    { level: 8, xpRequired: 600 },
    { level: 9, xpRequired: 850 },
    { level: 10, xpRequired: 1150 },
    { level: 11, xpRequired: 1500 },
    { level: 12, xpRequired: 1900 },
    { level: 13, xpRequired: 2400 },
    { level: 14, xpRequired: 3000 },
    { level: 15, xpRequired: 3700 },
    { level: 16, xpRequired: 4500 },
    { level: 17, xpRequired: 5400 },
    { level: 18, xpRequired: 6400 },
    { level: 19, xpRequired: 7500 },
    { level: 20, xpRequired: 8800 },
    { level: 21, xpRequired: 10300 },
    { level: 22, xpRequired: 12000 },
    { level: 23, xpRequired: 13900 },
    { level: 24, xpRequired: 16000 },
    { level: 25, xpRequired: 18300 },
    { level: 26, xpRequired: 20800 },
    { level: 27, xpRequired: 23500 },
    { level: 28, xpRequired: 26400 },
    { level: 29, xpRequired: 29500 },
    { level: 30, xpRequired: 32800 },
    { level: 31, xpRequired: 36300 },
    { level: 32, xpRequired: 40000 },
    { level: 33, xpRequired: 44000 },
    { level: 34, xpRequired: 48200 },
    { level: 35, xpRequired: 52600 },
    { level: 36, xpRequired: 57200 },
    { level: 37, xpRequired: 62000 },
    { level: 38, xpRequired: 67000 },
    { level: 39, xpRequired: 72200 },
    { level: 40, xpRequired: 77600 },
    { level: 41, xpRequired: 83200 },
    { level: 42, xpRequired: 89000 },
    { level: 43, xpRequired: 95000 },
    { level: 44, xpRequired: 101000 },
    { level: 45, xpRequired: 107500 },
    { level: 46, xpRequired: 114500 },
    { level: 47, xpRequired: 122000 },
    { level: 48, xpRequired: 130000 },
    { level: 49, xpRequired: 138500 },
    { level: 50, xpRequired: 147000 },
    { level: 51, xpRequired: 157000 },
];

function calculateLevel(xpTotal: number): number {
    for (let i = LEVEL_XP_THRESHOLDS.length - 1; i >= 0; i--) {
        if (xpTotal >= LEVEL_XP_THRESHOLDS[i].xpRequired) {
            return LEVEL_XP_THRESHOLDS[i].level;
        }
    }
    return 1;
}

function getXpForLevel(level: number): number {
    const entry = LEVEL_XP_THRESHOLDS.find((l) => l.level === level);
    return entry ? entry.xpRequired : 0;
}

function getXpForNextLevel(level: number): number {
    const entry = LEVEL_XP_THRESHOLDS.find((l) => l.level === level + 1);
    return entry ? entry.xpRequired : getXpForLevel(level);
}

export class GamificationService {
    private gamificationRepository: Repository<UserGamification>;

    constructor() {
        this.gamificationRepository = AppDataSource.getRepository(UserGamification);
    }

    async getOrCreateProfile(userId: string): Promise<UserGamification> {
        let profile = await this.gamificationRepository.findOne({
            where: { userId },
        });

        if (!profile) {
            profile = this.gamificationRepository.create({ userId });
            profile = await this.gamificationRepository.save(profile);
        }

        return profile;
    }

    async getProfile(userId: string) {
        const profile = await this.getOrCreateProfile(userId);
        const currentLevelXp = getXpForLevel(profile.nivel);
        const nextLevelXp = getXpForNextLevel(profile.nivel);

        return {
            ...profile,
            xpCurrentLevel: profile.xpTotal - currentLevelXp,
            xpNeededForNext: nextLevelXp - currentLevelXp,
            xpProgressPercent: Math.min(
                100,
                Math.round(((profile.xpTotal - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100)
            ),
        };
    }

    async completeSession(data: {
        userId: string;
        duracionMinutos: number;
        tipo: string;
    }): Promise<{ profile: UserGamification; xpGanado: number; subiDeNivel: boolean; rachaActualizada: boolean }> {
        const profile = await this.getOrCreateProfile(data.userId);

        // Calculate XP
        let xpGanado = 0;
        if (data.tipo === 'focus') {
            xpGanado = data.duracionMinutos; // 25 XP for 25 min, 15 XP for 15 min, etc.
        }

        // Update streak
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        let rachaActualizada = false;

        if (profile.ultimoDiaActivo !== today) {
            if (profile.ultimoDiaActivo === yesterday) {
                profile.rachaActual += 1;
            } else if (!profile.ultimoDiaActivo) {
                profile.rachaActual = 1;
            } else {
                profile.rachaActual = 1; // Reset streak
            }
            profile.ultimoDiaActivo = today;
            rachaActualizada = true;

            if (profile.rachaActual > profile.rachaMaxima) {
                profile.rachaMaxima = profile.rachaActual;
            }
        }

        // Streak bonuses
        if (rachaActualizada && profile.rachaActual === 3) {
            xpGanado += 10;
        }
        if (rachaActualizada && profile.rachaActual === 7) {
            xpGanado += 25;
        }

        // Update profile
        profile.xpTotal += xpGanado;
        profile.sesionesTotales += 1;
        profile.minutosTotales += data.duracionMinutos;

        const nivelAnterior = profile.nivel;
        profile.nivel = calculateLevel(profile.xpTotal);
        const subiDeNivel = profile.nivel > nivelAnterior;

        await this.gamificationRepository.save(profile);

        return {
            profile,
            xpGanado,
            subiDeNivel,
            rachaActualizada,
        };
    }
}
