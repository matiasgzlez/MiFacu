import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { Materia } from "../models/materias.model";
import { Recordatorio } from "../models/recordatorios.model";
import { Final } from "../models/finales.model";
import { UsuarioMateria } from "../models/usuario-materias.model";
import { User } from "../models/user.model";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: true, // Activado temporalmente para crear tablas nuevas
    // Usa migraciones o el script de seed para actualizar el esquema
    logging: process.env.NODE_ENV === 'development',
    entities: [Materia, Recordatorio, Final, UsuarioMateria, User],
    extra: {
        ssl: {
            rejectUnauthorized: false // Requerido para la conexión con Supabase
        }
    },
    subscribers: [],
    migrations: [],
});
