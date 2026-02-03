import { Repository } from 'typeorm';
import { AppDataSource } from '../config/DataSource';
import { Universidad } from '../models/universidad.model';
import { Carrera } from '../models/carrera.model';

export class CarrerasService {
    private universidadRepository: Repository<Universidad>;
    private carreraRepository: Repository<Carrera>;

    constructor() {
        this.universidadRepository = AppDataSource.getRepository(Universidad);
        this.carreraRepository = AppDataSource.getRepository(Carrera);
    }

    async getAllUniversidades(): Promise<Universidad[]> {
        return await this.universidadRepository.find({
            relations: ['carreras'],
            order: { nombre: 'ASC' }
        });
    }

    async getCarrerasByUniversidad(universidadId: string): Promise<Carrera[]> {
        return await this.carreraRepository.find({
            where: { universidadId },
            order: { nombre: 'ASC' }
        });
    }
}
