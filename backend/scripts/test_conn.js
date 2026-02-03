const { Client } = require('pg');
require('dotenv').config();

async function test() {
    console.log("Testing plain JS connection...");
    const client = new Client({
        connectionString: "postgresql://postgres.lyyljkrkyiqjxuwsnzhx:O9oKGjpnjDtZTISB@aws-1-sa-east-1.pooler.supabase.com:6543/postgres",
        ssl: { rejectUnauthorized: false }
    });
    try {
        await client.connect();
        console.log("SUCCESS!");
        const res = await client.query('SELECT NOW()');
        console.log(res.rows[0]);
    } catch (e) {
        console.error("FAILED:", e);
    } finally {
        await client.end();
    }
}
test();
