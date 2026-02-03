import { Repository } from 'typeorm';
import { AppDataSource } from '../config/DataSource';
import { UserGamification } from '../models/user-gamification.model';
import { AppError } from '../middleware/errorHandler.middleware';

function calculateLevel(xpTotal: number): number {
    return Math.floor(Math.sqrt(xpTotal / 50)) + 1;
}

function getXpForLevel(level: number): number {
    return (level - 1) * (level - 1) * 50;
}

function getXpForNextLevel(level: number): number {
    return level * level * 50;
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
