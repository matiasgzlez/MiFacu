import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.middleware';
import { GamificationService } from '../services/gamification.service';

export class GamificationController {
    private gamificationService: GamificationService;

    constructor() {
        this.gamificationService = new GamificationService();
    }

    getProfile = asyncHandler(async (req: Request, res: Response) => {
        const { userId } = req.params;
        const profile = await this.gamificationService.getProfile(userId);

        res.status(200).json({
            status: 'success',
            data: profile,
        });
    });

    completeSession = asyncHandler(async (req: Request, res: Response) => {
        const { userId, duracionMinutos, tipo } = req.body;
        const result = await this.gamificationService.completeSession({
            userId,
            duracionMinutos,
            tipo,
        });

        res.status(200).json({
            status: 'success',
            data: result,
        });
    });
}

export const gamificationController = new GamificationController();
