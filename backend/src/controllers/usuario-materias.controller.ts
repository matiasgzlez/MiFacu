import { Request, Response } from "express";
import { UsuarioMateriasService } from "../services/usuario-materias.service";
import { EstadoMateriaUsuario } from '../types/materias';
import { asyncHandler } from "../middleware/errorHandler.middleware";
import { AppError } from "../middleware/errorHandler.middleware";

export class UsuarioMateriasController {
    private usuarioMateriasService: UsuarioMateriasService;

    constructor() {
        this.usuarioMateriasService = new UsuarioMateriasService();
    }

    // Obtener todas las materias de un usuario
    getMateriasByUsuario = asyncHandler(async (req: Request, res: Response) => {
        // Priorizar el ID del token (si está autenticado)
        const userId = req.user?.id || req.params.usuarioId;

        if (!userId) {
            throw new AppError('usuarioId es requerido', 400);
        }

        const usuarioMaterias = await this.usuarioMateriasService.getMateriasByUsuario(userId);

        res.status(200).json({
            status: 'success',
            data: usuarioMaterias,
        });
    });

    // Agregar una materia a un usuario
    addMateriaToUsuario = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id || req.params.usuarioId;
        const { materiaId, estado, schedules, dia, hora, duracion, aula } = req.body;

        if (!userId) {
            throw new AppError('usuarioId es requerido', 400);
        }

        if (!materiaId || typeof materiaId !== 'number') {
            throw new AppError('materiaId es requerido y debe ser un número', 400);
        }

        // Validar estado si se proporciona
        if (estado && !Object.values(EstadoMateriaUsuario).includes(estado)) {
            throw new AppError('Estado inválido', 400);
        }

        const usuarioMateria = await this.usuarioMateriasService.addMateriaToUsuario(
            userId,
            materiaId,
            estado || EstadoMateriaUsuario.NoCursado,
            { schedules, dia, hora, duracion, aula }
        );

        res.status(201).json({
            status: 'success',
            data: usuarioMateria,
            message: 'Materia agregada exitosamente'
        });
    });

    // Actualizar estado de una materia
    updateEstadoMateria = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id || req.params.usuarioId;
        const { materiaId } = req.params;
        const { estado, schedules, dia, hora, duracion, aula } = req.body;

        if (!userId) {
            throw new AppError('usuarioId es requerido', 400);
        }

        if (!materiaId || isNaN(parseInt(materiaId))) {
            throw new AppError('materiaId es requerido y debe ser un número', 400);
        }

        if (!estado || !Object.values(EstadoMateriaUsuario).includes(estado)) {
            throw new AppError('Estado válido es requerido', 400);
        }

        const usuarioMateria = await this.usuarioMateriasService.updateEstadoMateria(
            userId,
            parseInt(materiaId),
            estado,
            { schedules, dia, hora, duracion, aula }
        );

        res.status(200).json({
            status: 'success',
            data: usuarioMateria,
            message: 'Estado de materia actualizado exitosamente'
        });
    });

    // Eliminar una materia del usuario
    removeMateriaFromUsuario = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id || req.params.usuarioId;
        const { materiaId } = req.params;

        if (!userId) {
            throw new AppError('usuarioId es requerido', 400);
        }

        if (!materiaId || isNaN(parseInt(materiaId))) {
            throw new AppError('materiaId es requerido y debe ser un número', 400);
        }

        await this.usuarioMateriasService.removeMateriaFromUsuario(
            userId,
            parseInt(materiaId)
        );

        res.status(200).json({
            status: 'success',
            message: 'Materia eliminada exitosamente'
        });
    });

    // Obtener materias disponibles para un usuario
    getMateriasDisponibles = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id || req.params.usuarioId;

        if (!userId) {
            throw new AppError('usuarioId es requerido', 400);
        }

        const materiasDisponibles = await this.usuarioMateriasService.getMateriasDisponibles(userId);

        res.status(200).json({
            status: 'success',
            data: materiasDisponibles,
        });
    });
}

// Exportar instancia para usar en rutas
export const usuarioMateriasController = new UsuarioMateriasController();
