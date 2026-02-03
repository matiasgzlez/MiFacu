import { AppDataSource } from "../src/config/DataSource";
import fs from "fs";
import path from "path";

async function runMigration() {
    console.log("🔄 Aplicando migración de escalado multi-carrera...");
    try {
        await AppDataSource.initialize();
        console.log("✅ Conexión establecida.");

        const sqlPath = path.join(__dirname, "../migrations/20260131_multi_career_scaling.sql");
        const sql = fs.readFileSync(sqlPath, "utf8");

        // Supabase/Postgres permite ejecutar múltiples sentencias si están separadas por ;
        // pero TypeORM aveces prefiere separarlas. Vamos a intentar correr todo el bloque.
        console.log("⏳ Ejecutando SQL de migración...");
        await AppDataSource.query(sql);

        console.log("✨ ¡Migración aplicada exitosamente!");
    } catch (error) {
        console.error("❌ Error aplicando migración:", error);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
        process.exit(0);
    }
}

runMigration();
