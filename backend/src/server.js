// backend/src/server.js
import app from './app.js';
import { getPool } from './db.js';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 4000;

async function start() {
    try {
        // test connection
        const pool = getPool();
        // ensure pool is available by getting a connection (createPool already did), we try a ping
        const conn = await pool.getConnection();
        await conn.ping();
        conn.release();

        app.listen(PORT, () => {
            console.log(`✅ Server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server', err);
        process.exit(1);
    }
}

start();
