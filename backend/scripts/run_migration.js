const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
    console.log("🔄 Aplicando migración SQL (Plain JS)...");
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const sqlPath = path.join(__dirname, '../migrations/20260131_multi_career_scaling.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log("⏳ Ejecutando comandos SQL...");
        await client.query(sql);
        console.log("✨ ¡Migración aplicada con éxito!");
    } catch (e) {
        console.error("❌ Falló la migración:", e);
    } finally {
        await client.end();
        process.exit(0);
    }
}

runMigration();
