import { Pool } from 'pg';

const DB_HOST = process.env.DB_HOST || process.env.DATABASE_HOST;
const DB_PORT = process.env.DB_PORT || process.env.DATABASE_PORT;
const DB_NAME = process.env.DB_NAME || process.env.DATABASE_NAME || process.env.DATABASE_DATABASE;
const DB_USER = process.env.DB_USER || process.env.DATABASE_USER || process.env.DB_USERNAME || process.env.DATABASE_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD;

const poolConfig = {
    host: DB_HOST,
    port: parseInt(DB_PORT),
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
    ssl: {
        require: true,
        rejectUnauthorized: false
    },
};

console.log('Pool config:', { ...poolConfig, password: '********' });

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
    console.error('Error en la DB:', err);
});

export async function testConnectionWithRetry(maxRetries = 20, delay = 2000) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Intento ${attempt}/${maxRetries} de conexión a BD...`);
            const client = await pool.connect();
            const result = await client.query('SELECT NOW() as current_time');
            console.log('Conexión a BD exitosa. Hora actual:', result.rows[0].current_time);
            client.release();
            return true;
        } catch (error) {
            lastError = error;
            console.log(`Intento ${attempt} fallado: ${error.message}`);

            if (attempt < maxRetries) {
                console.log(`Esperando ${delay/1000} segundos antes del próximo intento...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    console.error('Todos los intentos de conexión fallaron:', lastError.message);
    return false;
}

// Mantener la función original para compatibilidad
export async function testConnection() {
    return testConnectionWithRetry(1, 0); // Solo un intento
}
