import { AppDataSource } from "../src/config/DataSource";

async function ping() {
    console.log("Testing connection...");
    try {
        await AppDataSource.initialize();
        console.log("Connection successful!");
        const res = await AppDataSource.query("SELECT NOW()");
        console.log("DB Time:", res);
    } catch (e) {
        console.error("Connection failed:", e);
    } finally {
        if (AppDataSource.isInitialized) await AppDataSource.destroy();
    }
}
ping();
