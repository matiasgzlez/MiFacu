import { Repository } from 'typeorm';
import { AppDataSource } from '../config/DataSource';
import { Recordatorio } from '../models/recordatorios.model';
import { MateriasService } from './materias.service';
import { AppError } from '../middleware/errorHandler.middleware';
import { TipoRecordatorio } from '../types/recordatorios';

export class RecordatoriosService {
    private recordatorioRepository: Repository<Recordatorio>;
    private materiasService: MateriasService;

    constructor() {
        this.recordatorioRepository = AppDataSource.getRepository(Recordatorio);
        this.materiasService = new MateriasService();
    }

    async getAllRecordatorios(userId: string): Promise<Recordatorio[]> {
        return await this.recordatorioRepository.find({
            where: { userId },
            relations: ['materia'],
        });
    }

    async getRecordatorioById(id: number, userId: string): Promise<Recordatorio> {
        const recordatorio = await this.recordatorioRepository.findOne({
            where: { id, userId },
            relations: ['materia'],
        });

        if (!recordatorio) {
            throw new AppError('Recordatorio no encontrado', 404);
        }

        return recordatorio;
    }

    async createRecordatorio(data: {
        nombre: string;
        materiaId?: number;
        materiaNombre?: string;
        tipo: TipoRecordatorio;
        fecha?: Date | string;
        hora?: string;
        color?: string;
        descripcion?: string;
    }, userId: string): Promise<Recordatorio> {
        const { nombre, materiaId, materiaNombre, tipo, fecha, hora, color, descripcion } = data;

        // Preferir materiaId si está disponible, sino usar materiaNombre (legacy/guest sync)
        let materia = null;
        if (materiaId) {
            materia = await this.materiasService.getMateriaById(materiaId);
        } else if (materiaNombre) {
            materia = await this.materiasService.findOrCreateMateria(materiaNombre);
        }

        // Convertir fecha string a Date si es necesario
        const fechaDate = fecha ? (typeof fecha === 'string' ? new Date(fecha) : fecha) : null;

        const recordatorio = this.recordatorioRepository.create({
            nombre,
            materiaId: materia ? materia.id : null,
            tipo,
            fecha: fechaDate,
            hora: hora || null,
            color: color || '#FFD700', // Default color for quick tasks
            notificado: false,
            materia: materia,
            descripcion: descripcion || '',
            userId // Asignar el ID del usuario
        });

        return await this.recordatorioRepository.save(recordatorio);
    }

    async deleteRecordatorio(id: number, userId: string): Promise<void> {
        const recordatorio = await this.getRecordatorioById(id, userId);
        await this.recordatorioRepository.remove(recordatorio);
    }

    async updateRecordatorio(
        id: number,
        data: Partial<{
            nombre: string;
            tipo: TipoRecordatorio;
            fecha: Date;
            hora: string;
            color: string;
            notificado: boolean;
        }>,
        userId: string
    ): Promise<Recordatorio> {
        const recordatorio = await this.getRecordatorioById(id, userId);

        Object.assign(recordatorio, data);

        return await this.recordatorioRepository.save(recordatorio);
    }
}
