import { Repository } from 'typeorm';
import { AppDataSource } from '../config/DataSource';
import { PomodoroSession, TipoSesion } from '../models/pomodoro-session.model';
import { AppError } from '../middleware/errorHandler.middleware';

export class PomodoroService {
    private sessionRepository: Repository<PomodoroSession>;

    constructor() {
        this.sessionRepository = AppDataSource.getRepository(PomodoroSession);
    }

    async createSession(data: {
        userId: string;
        tipo: TipoSesion;
        duracionMinutos: number;
        duracionRealSegundos: number;
        completada: boolean;
        materiaId?: number | null;
        xpGanado?: number;
    }): Promise<PomodoroSession> {
        const session = this.sessionRepository.create({
            userId: data.userId,
            tipo: data.tipo,
            duracionMinutos: data.duracionMinutos,
            duracionRealSegundos: data.duracionRealSegundos,
            completada: data.completada,
            materiaId: data.materiaId || null,
            xpGanado: data.xpGanado || 0,
        });

        return await this.sessionRepository.save(session);
    }

    async getStats(userId: string) {
        const totalSessions = await this.sessionRepository.count({
            where: { userId, completada: true, tipo: TipoSesion.FOCUS },
        });

        const result = await this.sessionRepository
            .createQueryBuilder('session')
            .select('COALESCE(SUM(session.duracion_real_segundos), 0)', 'totalSegundos')
            .where('session.user_id = :userId', { userId })
            .andWhere('session.completada = true')
            .andWhere('session.tipo = :tipo', { tipo: TipoSesion.FOCUS })
            .getRawOne();

        const totalMinutos = Math.floor((result?.totalSegundos || 0) / 60);

        // Sesiones de hoy
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sesionesHoy = await this.sessionRepository.count({
            where: { userId, completada: true, tipo: TipoSesion.FOCUS },
            // TypeORM doesn't support MoreThanOrEqual with dates easily in count,
            // so we use query builder
        });

        const sesionesHoyResult = await this.sessionRepository
            .createQueryBuilder('session')
            .where('session.user_id = :userId', { userId })
            .andWhere('session.completada = true')
            .andWhere('session.tipo = :tipo', { tipo: TipoSesion.FOCUS })
            .andWhere('session.created_at >= :today', { today: today.toISOString() })
            .getCount();

        return {
            totalSesiones: totalSessions,
            totalMinutos,
            sesionesHoy: sesionesHoyResult,
        };
    }

    async getHistory(userId: string, limit: number = 20): Promise<PomodoroSession[]> {
        return await this.sessionRepository.find({
            where: { userId },
            relations: ['materia'],
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
}
