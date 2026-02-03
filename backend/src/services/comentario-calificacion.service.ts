import { Repository } from 'typeorm';
import { AppDataSource } from '../config/DataSource';
import { ComentarioCalificacion } from '../models/comentario-calificacion.model';
import { CalificacionCatedra } from '../models/calificacion-catedra.model';
import { AppError } from '../middleware/errorHandler.middleware';
import { contieneProhibidas } from '../utils/filtro-palabras';

export class ComentarioCalificacionService {
    private comentarioRepository: Repository<ComentarioCalificacion>;
    private calificacionRepository: Repository<CalificacionCatedra>;

    constructor() {
        this.comentarioRepository = AppDataSource.getRepository(ComentarioCalificacion);
        this.calificacionRepository = AppDataSource.getRepository(CalificacionCatedra);
    }

    async getByCalificacion(calificacionId: number): Promise<ComentarioCalificacion[]> {
        // Verificar que la calificación existe
        const calificacion = await this.calificacionRepository.findOne({
            where: { id: calificacionId }
        });

        if (!calificacion) {
            throw new AppError('Calificación no encontrada', 404);
        }

        const comentarios = await this.comentarioRepository.find({
            where: { calificacionId },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });

        // Ordenar: verificados primero, luego anónimos
        return comentarios.sort((a, b) => {
            if (a.esAnonimo === b.esAnonimo) {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            return a.esAnonimo ? 1 : -1;
        });
    }

    async create(data: {
        calificacionId: number;
        contenido: string;
        esAnonimo?: boolean;
    }, userId: string): Promise<ComentarioCalificacion> {
        // Verificar que la calificación existe
        const calificacion = await this.calificacionRepository.findOne({
            where: { id: data.calificacionId }
        });

        if (!calificacion) {
            throw new AppError('Calificación no encontrada', 404);
        }

        // Validar contenido
        if (!data.contenido || data.contenido.trim().length === 0) {
            throw new AppError('El contenido del comentario es requerido', 400);
        }

        if (data.contenido.trim().length > 500) {
            throw new AppError('El comentario no puede superar los 500 caracteres', 400);
        }

        // Validar palabras prohibidas
        if (contieneProhibidas(data.contenido)) {
            throw new AppError('El comentario contiene palabras inapropiadas', 400);
        }

        const comentario = this.comentarioRepository.create({
            calificacionId: data.calificacionId,
            userId,
            contenido: data.contenido.trim(),
            esAnonimo: data.esAnonimo ?? false,
        });

        const saved = await this.comentarioRepository.save(comentario);

        // Retornar con relaciones
        return await this.comentarioRepository.findOne({
            where: { id: saved.id },
            relations: ['user'],
        }) as ComentarioCalificacion;
    }

    async delete(id: number, userId: string): Promise<void> {
        const comentario = await this.comentarioRepository.findOne({
            where: { id }
        });

        if (!comentario) {
            throw new AppError('Comentario no encontrado', 404);
        }

        // Solo el propietario puede eliminar
        if (comentario.userId !== userId) {
            throw new AppError('No tienes permiso para eliminar este comentario', 403);
        }

        await this.comentarioRepository.remove(comentario);
    }

    async countByCalificacion(calificacionId: number): Promise<number> {
        return await this.comentarioRepository.count({
            where: { calificacionId }
        });
    }
}
