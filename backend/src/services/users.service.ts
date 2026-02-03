import { Repository } from 'typeorm';
import { AppDataSource } from '../config/DataSource';
import { User } from '../models/user.model';
import { AppError } from '../middleware/errorHandler.middleware';

export class UsersService {
    private userRepository: Repository<User>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
    }

    async updateCareer(userId: string, carreraId: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            // Si el usuario no existe en nuestra tabla local, lo creamos (Upsert)
            // Esto puede pasar si el webhook de Supabase falla o no está configurado
            const newUser = this.userRepository.create({
                id: userId,
                carreraId: carreraId
            });
            return await this.userRepository.save(newUser);
        }

        user.carreraId = carreraId;
        return await this.userRepository.save(user);
    }

    async getUserProfile(userId: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['carrera', 'carrera.universidad']
        });

        if (!user) {
            throw new AppError('Usuario no encontrado', 404);
        }

        return user;
    }
}
