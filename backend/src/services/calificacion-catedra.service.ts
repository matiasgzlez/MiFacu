import { Repository } from 'typeorm';
import { AppDataSource } from '../config/DataSource';
import { CalificacionCatedra } from '../models/calificacion-catedra.model';
import { VotoCalificacion } from '../models/voto-calificacion.model';
import { ReporteCalificacion } from '../models/reporte-calificacion.model';
import { AppError } from '../middleware/errorHandler.middleware';
import { CreateCalificacionDTO, UpdateCalificacionDTO, TipoVoto } from '../types/calificaciones';
import { contieneProhibidas } from '../utils/filtro-palabras';
import { moderarResena } from '../utils/moderacion-ia';

export class CalificacionCatedraService {
    private calificacionRepository: Repository<CalificacionCatedra>;
    private votoRepository: Repository<VotoCalificacion>;
    private reporteRepository: Repository<ReporteCalificacion>;

    constructor() {
        this.calificacionRepository = AppDataSource.getRepository(CalificacionCatedra);
        this.votoRepository = AppDataSource.getRepository(VotoCalificacion);
        this.reporteRepository = AppDataSource.getRepository(ReporteCalificacion);
    }

    async getAll(materiaId?: number): Promise<CalificacionCatedra[]> {
        const whereClause = materiaId ? { materiaId } : {};

        return await this.calificacionRepository.find({
            where: whereClause,
            relations: ['materia', 'user'],
            order: {
                esAnonimo: 'ASC',  // Verificados (false) primero, luego anónimos (true)
                createdAt: 'DESC'
            },
        });
    }

    async getById(id: number): Promise<CalificacionCatedra> {
        const calificacion = await this.calificacionRepository.findOne({
            where: { id },
            relations: ['materia', 'user'],
        });

        if (!calificacion) {
            throw new AppError('Calificación no encontrada', 404);
        }

        return calificacion;
    }

    async create(data: CreateCalificacionDTO, userId: string): Promise<CalificacionCatedra> {
        // Validar contenido prohibido
        if (contieneProhibidas(data.comentario)) {
            throw new AppError('El comentario contiene palabras inapropiadas', 400);
        }

        if (contieneProhibidas(data.profesorNombre)) {
            throw new AppError('El nombre del profesor contiene palabras inapropiadas', 400);
        }

        // Validar rating
        if (data.rating < 1 || data.rating > 5) {
            throw new AppError('El rating debe estar entre 1 y 5', 400);
        }

        // Moderacion con IA
        const moderacion = await moderarResena(data.comentario, data.profesorNombre);
        if (!moderacion.aprobado) {
            throw new AppError(moderacion.motivo || 'La reseña fue rechazada por contenido inapropiado', 400);
        }

        const calificacion = this.calificacionRepository.create({
            materiaId: data.materiaId,
            profesorNombre: data.profesorNombre.trim(),
            rating: data.rating,
            dificultad: data.dificultad,
            comentario: data.comentario.trim(),
            esAnonimo: data.esAnonimo ?? false,
            userId,
            votosUtiles: 0,
            votosNoUtiles: 0,
            reportes: 0,
        });

        return await this.calificacionRepository.save(calificacion);
    }

    async update(id: number, data: UpdateCalificacionDTO, userId: string): Promise<CalificacionCatedra> {
        const calificacion = await this.getById(id);

        // Verificar que el usuario sea el propietario
        if (calificacion.userId !== userId) {
            throw new AppError('No tienes permiso para editar esta calificación', 403);
        }

        // Validar contenido si se actualiza
        if (data.comentario && contieneProhibidas(data.comentario)) {
            throw new AppError('El comentario contiene palabras inapropiadas', 400);
        }

        if (data.profesorNombre && contieneProhibidas(data.profesorNombre)) {
            throw new AppError('El nombre del profesor contiene palabras inapropiadas', 400);
        }

        // Validar rating si se actualiza
        if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
            throw new AppError('El rating debe estar entre 1 y 5', 400);
        }

        // Moderacion con IA si se actualiza el comentario
        if (data.comentario) {
            const moderacion = await moderarResena(data.comentario, data.profesorNombre || calificacion.profesorNombre);
            if (!moderacion.aprobado) {
                throw new AppError(moderacion.motivo || 'La reseña fue rechazada por contenido inapropiado', 400);
            }
        }

        Object.assign(calificacion, {
            ...data,
            profesorNombre: data.profesorNombre?.trim() ?? calificacion.profesorNombre,
            comentario: data.comentario?.trim() ?? calificacion.comentario,
        });

        return await this.calificacionRepository.save(calificacion);
    }

    async delete(id: number, userId: string): Promise<void> {
        const calificacion = await this.getById(id);

        // Verificar que el usuario sea el propietario
        if (calificacion.userId !== userId) {
            throw new AppError('No tienes permiso para eliminar esta calificación', 403);
        }

        await this.calificacionRepository.remove(calificacion);
    }

    async votar(id: number, tipo: TipoVoto, userId: string): Promise<CalificacionCatedra> {
        const calificacion = await this.getById(id);

        // No puede votar su propia calificación
        if (calificacion.userId === userId) {
            throw new AppError('No puedes votar tu propia calificación', 400);
        }

        // Buscar voto existente
        const votoExistente = await this.votoRepository.findOne({
            where: { calificacionId: id, userId },
        });

        if (votoExistente) {
            // Si es el mismo tipo, eliminar el voto (toggle off)
            if (votoExistente.tipo === tipo) {
                await this.votoRepository.remove(votoExistente);

                // Decrementar contador
                if (tipo === TipoVoto.Util) {
                    calificacion.votosUtiles = Math.max(0, calificacion.votosUtiles - 1);
                } else {
                    calificacion.votosNoUtiles = Math.max(0, calificacion.votosNoUtiles - 1);
                }
            } else {
                // Si es diferente tipo, cambiar el voto
                const tipoAnterior = votoExistente.tipo;
                votoExistente.tipo = tipo;
                await this.votoRepository.save(votoExistente);

                // Ajustar contadores
                if (tipoAnterior === TipoVoto.Util) {
                    calificacion.votosUtiles = Math.max(0, calificacion.votosUtiles - 1);
                    calificacion.votosNoUtiles += 1;
                } else {
                    calificacion.votosNoUtiles = Math.max(0, calificacion.votosNoUtiles - 1);
                    calificacion.votosUtiles += 1;
                }
            }
        } else {
            // Crear nuevo voto
            const nuevoVoto = this.votoRepository.create({
                calificacionId: id,
                userId,
                tipo,
            });
            await this.votoRepository.save(nuevoVoto);

            // Incrementar contador
            if (tipo === TipoVoto.Util) {
                calificacion.votosUtiles += 1;
            } else {
                calificacion.votosNoUtiles += 1;
            }
        }

        return await this.calificacionRepository.save(calificacion);
    }

    async reportar(id: number, motivo: string, userId: string): Promise<CalificacionCatedra> {
        const calificacion = await this.getById(id);

        // Verificar si ya reportó
        const reporteExistente = await this.reporteRepository.findOne({
            where: { calificacionId: id, userId },
        });

        if (reporteExistente) {
            throw new AppError('Ya has reportado esta calificación', 400);
        }

        // Crear reporte
        const nuevoReporte = this.reporteRepository.create({
            calificacionId: id,
            userId,
            motivo: motivo.trim(),
        });
        await this.reporteRepository.save(nuevoReporte);

        // Incrementar contador de reportes
        calificacion.reportes += 1;

        return await this.calificacionRepository.save(calificacion);
    }

    async getPromedioMateria(materiaId: number): Promise<{ promedio: number; total: number }> {
        const result = await this.calificacionRepository
            .createQueryBuilder('c')
            .select('AVG(c.rating)', 'promedio')
            .addSelect('COUNT(c.id)', 'total')
            .where('c.materia_id = :materiaId', { materiaId })
            .getRawOne();

        return {
            promedio: result?.promedio ? parseFloat(result.promedio) : 0,
            total: parseInt(result?.total || '0'),
        };
    }

    async getProfesoresSugeridos(materiaId: number): Promise<string[]> {
        const result = await this.calificacionRepository
            .createQueryBuilder('c')
            .select('DISTINCT c.profesor_nombre', 'profesorNombre')
            .where('c.materia_id = :materiaId', { materiaId })
            .orderBy('c.profesor_nombre', 'ASC')
            .getRawMany();

        return result.map(r => r.profesorNombre);
    }

    async getVotoUsuario(calificacionId: number, userId: string): Promise<TipoVoto | null> {
        const voto = await this.votoRepository.findOne({
            where: { calificacionId, userId },
        });

        return voto?.tipo ?? null;
    }

    async getVotosUsuario(calificacionIds: number[], userId: string): Promise<Record<number, TipoVoto>> {
        const votos = await this.votoRepository.find({
            where: calificacionIds.map(id => ({ calificacionId: id, userId })),
        });

        return votos.reduce((acc, voto) => {
            acc[voto.calificacionId] = voto.tipo;
            return acc;
        }, {} as Record<number, TipoVoto>);
    }
}
