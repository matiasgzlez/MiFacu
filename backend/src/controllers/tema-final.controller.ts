import { Request, Response } from "express";
import { TemaFinalService } from "../services/tema-final.service";
import { asyncHandler } from "../middleware/errorHandler.middleware";

export class TemaFinalController {
    private service: TemaFinalService;

    constructor() {
        this.service = new TemaFinalService();
    }

    getAll = asyncHandler(async (req: Request, res: Response) => {
        const materiaId = req.query.materiaId ? parseInt(req.query.materiaId as string) : undefined;
        const temas = await this.service.getAll(materiaId);

        const userId = req.user.id;
        const temaIds = temas.map(t => t.id);
        const votosUsuario = temaIds.length > 0
            ? await this.service.getVotosUsuario(temaIds, userId)
            : {};

        const temasConVoto = temas.map(t => ({
            ...t,
            miVoto: votosUsuario[t.id] ?? null,
            esVerificado: !t.esAnonimo,
            user: t.esAnonimo ? null : t.user,
        }));

        res.status(200).json({
            status: 'success',
            data: temasConVoto,
        });
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const tema = await this.service.getById(parseInt(id));

        const userId = req.user.id;
        const miVoto = await this.service.getVotoUsuario(parseInt(id), userId);

        res.status(200).json({
            status: 'success',
            data: {
                ...tema,
                miVoto,
                esVerificado: !tema.esAnonimo,
                user: tema.esAnonimo ? null : tema.user,
            },
        });
    });

    create = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user.id;
        const tema = await this.service.create(req.body, userId);

        res.status(201).json({
            status: 'success',
            data: tema,
        });
    });

    update = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const userId = req.user.id;
        const tema = await this.service.update(parseInt(id), req.body, userId);

        res.status(200).json({
            status: 'success',
            data: tema,
        });
    });

    delete = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const userId = req.user.id;
        await this.service.delete(parseInt(id), userId);

        res.status(204).send();
    });

    votar = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { tipo } = req.body;
        const userId = req.user.id;

        const tema = await this.service.votar(parseInt(id), tipo, userId);

        const miVoto = await this.service.getVotoUsuario(parseInt(id), userId);

        res.status(200).json({
            status: 'success',
            data: {
                ...tema,
                miVoto,
            },
        });
    });

    reportar = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { motivo } = req.body;
        const userId = req.user.id;

        const tema = await this.service.reportar(parseInt(id), motivo, userId);

        res.status(200).json({
            status: 'success',
            data: tema,
            message: 'Reporte enviado correctamente',
        });
    });

    getEstadisticasMateria = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const estadisticas = await this.service.getEstadisticasMateria(parseInt(id));

        res.status(200).json({
            status: 'success',
            data: estadisticas,
        });
    });
}

export const temaFinalController = new TemaFinalController();
