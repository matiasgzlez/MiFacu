
import { AppDataSource } from "../src/config/DataSource";

async function runMigration() {
    console.log("🔄 Conectando a Supabase para agregar columnas de horario...");
    try {
        await AppDataSource.initialize();
        console.log("✅ Conexión exitosa. Ejecutando cambios de esquema...");

        const queries = [
            `ALTER TABLE usuario_materias ADD COLUMN IF NOT EXISTS dia VARCHAR(10);`,
            `ALTER TABLE usuario_materias ADD COLUMN IF NOT EXISTS hora INTEGER;`,
            `ALTER TABLE usuario_materias ADD COLUMN IF NOT EXISTS duracion INTEGER DEFAULT 2;`,
            `ALTER TABLE usuario_materias ADD COLUMN IF NOT EXISTS aula VARCHAR(50);`
        ];

        for (const query of queries) {
            console.log(`⏳ Ejecutando: ${query}`);
            await AppDataSource.query(query);
        }

        console.log("✨ ¡Columnas agregadas correctamente a usuario_materias!");
    } catch (error) {
        console.error("❌ Error durante la migración:", error);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
        process.exit(0);
    }
}

runMigration();
