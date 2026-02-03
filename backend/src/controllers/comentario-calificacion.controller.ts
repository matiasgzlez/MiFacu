import { Request, Response } from "express";
import { ComentarioCalificacionService } from "../services/comentario-calificacion.service";
import { asyncHandler } from "../middleware/errorHandler.middleware";

export class ComentarioCalificacionController {
    private service: ComentarioCalificacionService;

    constructor() {
        this.service = new ComentarioCalificacionService();
    }

    getByCalificacion = asyncHandler(async (req: Request, res: Response) => {
        const { calificacionId } = req.params;
        const comentarios = await this.service.getByCalificacion(parseInt(calificacionId));

        // Transformar para ocultar usuario si es anónimo
        const comentariosTransformed = comentarios.map(c => ({
            ...c,
            esVerificado: !c.esAnonimo,
            user: c.esAnonimo ? null : c.user,
        }));

        res.status(200).json({
            status: 'success',
            data: comentariosTransformed,
        });
    });

    create = asyncHandler(async (req: Request, res: Response) => {
        const { calificacionId } = req.params;
        const userId = req.user.id;

        const comentario = await this.service.create({
            calificacionId: parseInt(calificacionId),
            ...req.body,
        }, userId);

        res.status(201).json({
            status: 'success',
            data: {
                ...comentario,
                esVerificado: !comentario.esAnonimo,
                user: comentario.esAnonimo ? null : comentario.user,
            },
        });
    });

    delete = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const userId = req.user.id;

        await this.service.delete(parseInt(id), userId);

        res.status(204).send();
    });

    getCount = asyncHandler(async (req: Request, res: Response) => {
        const { calificacionId } = req.params;
        const count = await this.service.countByCalificacion(parseInt(calificacionId));

        res.status(200).json({
            status: 'success',
            data: { count },
        });
    });
}

export const comentarioCalificacionController = new ComentarioCalificacionController();
