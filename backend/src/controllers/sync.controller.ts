import { Request, Response } from 'express';
import { AppDataSource } from '../config/DataSource';
import { Recordatorio } from '../models/recordatorios.model';
import { Final } from '../models/finales.model';
import { User } from '../models/user.model';
import { Materia } from '../models/materias.model';

export const syncData = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const { recordatorios, finales } = req.body;

        const userRepo = AppDataSource.getRepository(User);
        const recordatorioRepo = AppDataSource.getRepository(Recordatorio);
        const finalRepo = AppDataSource.getRepository(Final);
        const materiaRepo = AppDataSource.getRepository(Materia);

        // Ensure user exists in our DB
        let user = await userRepo.findOneBy({ id: userId });
        if (!user) {
            user = userRepo.create({
                id: userId,
                email: req.user.email, // Assuming these are available in the token user object
                nombre: req.user.user_metadata?.full_name || req.user.email
            });
            await userRepo.save(user);
        }

        // Process Recordatorios
        if (recordatorios && Array.isArray(recordatorios)) {
            for (const rec of recordatorios) {
                let materia = rec.materiaNombre ? await materiaRepo.findOneBy({ nombre: rec.materiaNombre }) : null;

                const newRec: any = recordatorioRepo.create({
                    ...rec,
                    userId: userId,
                    materiaId: materia ? materia.id : null,
                    materia: materia || null
                });

                // Limpiar ID local
                delete newRec.id;
                await recordatorioRepo.save(newRec);
            }
        }

        // Process Finales
        if (finales && Array.isArray(finales)) {
            for (const fin of finales) {
                let materia = fin.materiaNombre ? await materiaRepo.findOneBy({ nombre: fin.materiaNombre }) : null;

                const newFin: any = finalRepo.create({
                    ...fin,
                    userId: userId,
                    materiaId: materia ? materia.id : null,
                    materia: materia || null
                });

                delete newFin.id;
                await finalRepo.save(newFin);
            }
        }

        res.status(200).json({ message: 'Sync successful' });

    } catch (error) {
        console.error('Sync Error:', error);
        res.status(500).json({ error: 'Internal server error during sync' });
    }
};
