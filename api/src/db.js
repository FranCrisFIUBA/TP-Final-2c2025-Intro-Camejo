import { Pool } from 'pg';

console.log('=== DEBUG VARIABLES DE ENTORNO DE LA BASE DE DATOS ===');
console.log('DATABASE_USERNAME:', process.env.DATABASE_USERNAME);
console.log('DATABASE_PASSWORD:', process.env.DATABASE_PASSWORD ? '***' : 'undefined');
console.log('DATABASE_DATABASE:', process.env.DATABASE_DATABASE);
console.log('DATABASE_HOST:', process.env.DATABASE_HOST);
console.log('DATABASE_PORT:', process.env.DATABASE_PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('================================');

const poolConfig = {
    user: process.env.DATABASE_USERNAME || 'admin',
    password: process.env.DATABASE_PASSWORD || '1234',
    database: process.env.DATABASE_DATABASE || 'imagoDB',
    host: process.env.DATABASE_HOST || 'db',
    port: parseInt(process.env.DATABASE_PORT) || 5432
};

console.log('Pool config:', { ...poolConfig, password: '***' });

export const pool = new Pool(poolConfig);

// Manejo de errores
pool.on('error', (err) => {
    console.error('Error en la DB:', err);
});

export async function testConnectionWithRetry(maxRetries = 10, delay = 2000) {
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
