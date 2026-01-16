import { Request, Response } from "express";
import { FinalesService } from "../services/finales.service";
import { asyncHandler } from "../middleware/errorHandler.middleware";

export class FinalesController {
    private finalesService: FinalesService;

    constructor() {
        this.finalesService = new FinalesService();
    }

    getFinales = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user.id;
        const finales = await this.finalesService.getAllFinales(userId);
        res.status(200).json({
            status: 'success',
            data: finales,
        });
    });

    getFinal = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const userId = req.user.id;
        const final = await this.finalesService.getFinalById(parseInt(id), userId);
        res.status(200).json({
            status: 'success',
            data: final,
        });
    });

    createFinal = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user.id;
        const final = await this.finalesService.createFinal(req.body, userId);
        res.status(201).json({
            status: 'success',
            data: final,
        });
    });

    updateFinal = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const userId = req.user.id;
        const final = await this.finalesService.updateFinal(parseInt(id), req.body, userId);
        res.status(200).json({
            status: 'success',
            data: final,
        });
    });

    deleteFinal = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const userId = req.user.id;
        await this.finalesService.deleteFinal(parseInt(id), userId);
        res.status(204).send();
    });
}

// Exportar instancia para usar en rutas
export const finalesController = new FinalesController();
