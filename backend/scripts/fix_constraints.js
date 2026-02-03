const { Client } = require('pg');
require('dotenv').config();

async function fix() {
    console.log("🛠️ Corrigiendo restricciones de la tabla 'materias'...");
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // 1. Buscar restricciones únicas actuales
        const res = await client.query(`
            SELECT conname 
            FROM pg_constraint 
            WHERE conrelid = 'materias'::regclass 
            AND contype = 'u'
        `);

        console.log("Restricciones encontradas:", res.rows.map(r => r.conname));

        // 2. Eliminar restricciones antiguas (si existen)
        // Las restricciones creadas por TypeORM suelen llamarse UQ_... o similar
        // Pero para estar seguros, iteramos sobre las encontradas
        for (const row of res.rows) {
            console.log(`🗑️ Eliminando restricción: ${row.conname}`);
            await client.query(`ALTER TABLE materias DROP CONSTRAINT "${row.conname}"`);
        }

        // 3. Crear nuevas restricciones compuestas (Carrera + Numero y Carrera + Nombre)
        console.log("✨ Creando nuevas restricciones compuestas...");
        await client.query(`
            ALTER TABLE materias 
            ADD CONSTRAINT uq_materias_carrera_numero UNIQUE (carrera_id, numero)
        `);

        await client.query(`
            ALTER TABLE materias 
            ADD CONSTRAINT uq_materias_carrera_nombre UNIQUE (carrera_id, nombre)
        `);

        console.log("✅ Restricciones actualizadas con éxito.");
    } catch (e) {
        console.error("❌ Error corrigiendo restricciones:", e);
    } finally {
        await client.end();
        process.exit(0);
    }
}

fix();
