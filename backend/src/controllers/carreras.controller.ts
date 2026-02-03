import { Request, Response } from "express";
import { CarrerasService } from "../services/carreras.service";
import { asyncHandler } from "../middleware/errorHandler.middleware";

export class CarrerasController {
    private carrerasService: CarrerasService;

    constructor() {
        this.carrerasService = new CarrerasService();
    }

    getUniversidades = asyncHandler(async (req: Request, res: Response) => {
        const universidades = await this.carrerasService.getAllUniversidades();
        res.status(200).json({
            status: 'success',
            data: universidades,
        });
    });

    getCarreras = asyncHandler(async (req: Request, res: Response) => {
        const { universidadId } = req.params;
        const carreras = await this.carrerasService.getCarrerasByUniversidad(universidadId);
        res.status(200).json({
            status: 'success',
            data: carreras,
        });
    });
}

export const carrerasController = new CarrerasController();
