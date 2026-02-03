import { Request, Response } from "express";
import { UsersService } from "../services/users.service";
import { asyncHandler } from "../middleware/errorHandler.middleware";

export class UsersController {
    private usersService: UsersService;

    constructor() {
        this.usersService = new UsersService();
    }

    updateCareer = asyncHandler(async (req: Request, res: Response) => {
        const { userId } = req.params;
        const { carreraId } = req.body;

        if (!carreraId) {
            res.status(400).json({ status: 'error', message: 'carreraId is required' });
            return;
        }

        const user = await this.usersService.updateCareer(userId, carreraId);
        res.status(200).json({
            status: 'success',
            data: user,
        });
    });

    getProfile = asyncHandler(async (req: Request, res: Response) => {
        const { userId } = req.params;
        const user = await this.usersService.getUserProfile(userId);
        res.status(200).json({
            status: 'success',
            data: user,
        });
    });
}

export const usersController = new UsersController();
