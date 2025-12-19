import {pool} from "../../db.js";

export async function healthDiagnostic(req, res) {
    try {
        const client = await pool.connect();
        const dbResult = await client.query('SELECT 1 as test');
        client.release();
        res.status(200).json({
            status: 'OK',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(200).json({
            status: 'OK',
            database: 'disconnected',
            timestamp: new Date().toISOString()
        });
    }
}
