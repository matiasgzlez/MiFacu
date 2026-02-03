import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.middleware';
import { PomodoroService } from '../services/pomodoro.service';

export class PomodoroController {
    private pomodoroService: PomodoroService;

    constructor() {
        this.pomodoroService = new PomodoroService();
    }

    createSession = asyncHandler(async (req: Request, res: Response) => {
        const { userId, tipo, duracionMinutos, duracionRealSegundos, completada, materiaId, xpGanado } = req.body;

        const session = await this.pomodoroService.createSession({
            userId,
            tipo,
            duracionMinutos,
            duracionRealSegundos,
            completada,
            materiaId,
            xpGanado,
        });

        res.status(201).json({
            status: 'success',
            data: session,
        });
    });

    getStats = asyncHandler(async (req: Request, res: Response) => {
        const { userId } = req.params;
        const stats = await this.pomodoroService.getStats(userId);

        res.status(200).json({
            status: 'success',
            data: stats,
        });
    });

    getHistory = asyncHandler(async (req: Request, res: Response) => {
        const { userId } = req.params;
        const history = await this.pomodoroService.getHistory(userId);

        res.status(200).json({
            status: 'success',
            data: history,
        });
    });
}

export const pomodoroController = new PomodoroController();
