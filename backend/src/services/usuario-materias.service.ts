import { Repository } from 'typeorm';
import { AppDataSource } from '../config/DataSource';
import { UsuarioMateria } from '../models/usuario-materias.model';
import { Materia } from '../models/materias.model';
import { User } from '../models/user.model';
import { EstadoMateriaUsuario } from '../types/materias';
import { AppError } from '../middleware/errorHandler.middleware';

export class UsuarioMateriasService {
    private usuarioMateriaRepository: Repository<UsuarioMateria>;
    private materiaRepository: Repository<Materia>;
    private userRepository: Repository<User>;

    constructor() {
        this.usuarioMateriaRepository = AppDataSource.getRepository(UsuarioMateria);
        this.materiaRepository = AppDataSource.getRepository(Materia);
        this.userRepository = AppDataSource.getRepository(User);
    }

    // Obtener todas las materias de un usuario (filtradas por su carrera actual)
    async getMateriasByUsuario(usuarioId: string): Promise<UsuarioMateria[]> {
        // 1. Obtener la carrera del usuario
        const user = await this.userRepository.findOne({
            where: { id: usuarioId },
            select: ['id', 'carreraId']
        });

        if (!user || !user.carreraId) {
            return [];
        }

        // 2. Obtener materias del usuario que pertenecen a esa carrera
        return await this.usuarioMateriaRepository.createQueryBuilder('um')
            .leftJoinAndSelect('um.materia', 'materia')
            .where('um.usuarioId = :usuarioId', { usuarioId })
            .andWhere('materia.carrera_id = :carreraId', { carreraId: user.carreraId })
            .orderBy('materia.numero', 'ASC')
            .getMany();
    }

    // Agregar una materia a un usuario
    async addMateriaToUsuario(
        usuarioId: string,
        materiaId: number,
        estado: EstadoMateriaUsuario = EstadoMateriaUsuario.NoCursado,
        scheduleData?: { dia?: string; hora?: number; duracion?: number; aula?: string }
    ): Promise<UsuarioMateria> {
        // Verificar que la materia existe
        const materia = await this.materiaRepository.findOne({
            where: { id: materiaId }
        });

        if (!materia) {
            throw new AppError('Materia no encontrada', 404);
        }

        // Verificar que el usuario no tenga ya esta materia
        const existingUsuarioMateria = await this.usuarioMateriaRepository.findOne({
            where: { usuarioId, materiaId }
        });

        if (existingUsuarioMateria) {
            throw new AppError('El usuario ya tiene esta materia agregada', 400);
        }

        // Crear la relación
        const usuarioMateria = this.usuarioMateriaRepository.create({
            usuarioId,
            materiaId,
            estado
        });

        if (scheduleData) {
            Object.assign(usuarioMateria, {
                dia: scheduleData.dia,
                hora: scheduleData.hora !== undefined ? Number(scheduleData.hora) : null,
                duracion: scheduleData.duracion !== undefined ? Number(scheduleData.duracion) : 2,
                aula: scheduleData.aula
            });
        }

        return await this.usuarioMateriaRepository.save(usuarioMateria);
    }

    // Actualizar estado de una materia del usuario
    async updateEstadoMateria(
        usuarioId: string,
        materiaId: number,
        estado: EstadoMateriaUsuario,
        scheduleData?: { dia?: string; hora?: number; duracion?: number; aula?: string }
    ): Promise<UsuarioMateria> {
        const usuarioMateria = await this.usuarioMateriaRepository.findOne({
            where: { usuarioId, materiaId }
        });

        if (!usuarioMateria) {
            throw new AppError('Materia no encontrada para este usuario', 404);
        }

        usuarioMateria.estado = estado;

        if (scheduleData) {
            usuarioMateria.dia = scheduleData.dia !== undefined ? scheduleData.dia : usuarioMateria.dia;
            usuarioMateria.hora = scheduleData.hora !== undefined && scheduleData.hora !== null ? Number(scheduleData.hora) : usuarioMateria.hora;
            usuarioMateria.duracion = scheduleData.duracion !== undefined && scheduleData.duracion !== null ? Number(scheduleData.duracion) : usuarioMateria.duracion;
            usuarioMateria.aula = scheduleData.aula !== undefined ? scheduleData.aula : usuarioMateria.aula;
        }

        return await this.usuarioMateriaRepository.save(usuarioMateria);
    }

    // Eliminar una materia del usuario
    async removeMateriaFromUsuario(usuarioId: string, materiaId: number): Promise<void> {
        const usuarioMateria = await this.usuarioMateriaRepository.findOne({
            where: { usuarioId, materiaId }
        });

        if (!usuarioMateria) {
            throw new AppError('Materia no encontrada para este usuario', 404);
        }

        await this.usuarioMateriaRepository.remove(usuarioMateria);
    }

    // Obtener materias disponibles para un usuario (todas menos las que ya tiene, filtradas por carrera)
    async getMateriasDisponibles(usuarioId: string): Promise<Materia[]> {
        // 1. Obtener la carrera del usuario
        const user = await this.userRepository.findOne({
            where: { id: usuarioId },
            select: ['id', 'carreraId']
        });

        if (!user || !user.carreraId) {
            // Si el usuario no tiene carrera asignada (caso fallback), no devolvemos nada o devolvemos un error
            return [];
        }

        // 2. Obtener materias que ya tiene el usuario
        const usuarioMaterias = await this.usuarioMateriaRepository.find({
            where: { usuarioId },
            select: ['materiaId']
        });

        const materiaIdsUsuario = usuarioMaterias.map(um => um.materiaId);

        // 3. Consultar materias de SU carrera que NO tenga ya
        const query = this.materiaRepository.createQueryBuilder('materia');

        query.where('materia.carrera_id = :carreraId', { carreraId: user.carreraId });

        if (materiaIdsUsuario.length > 0) {
            query.andWhere('materia.id NOT IN (:...ids)', { ids: materiaIdsUsuario });
        }

        return await query.orderBy('materia.numero', 'ASC').getMany();
    }

    // Verificar si un usuario tiene una materia específica
    async usuarioTieneMateria(usuarioId: string, materiaId: number): Promise<boolean> {
        const count = await this.usuarioMateriaRepository.count({
            where: { usuarioId, materiaId }
        });
        return count > 0;
    }
}
