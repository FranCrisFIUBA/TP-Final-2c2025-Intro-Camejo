
import {Pool} from 'pg'

console.log(process.env.DATABASE_URL);

export const pool = new Pool({
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DATABASE,
    host: process.env.DATABASE_HOST || 'db',
    port: 5432
});
