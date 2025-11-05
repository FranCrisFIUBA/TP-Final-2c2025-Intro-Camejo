
import {Pool} from 'pg'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // ejemplo: postgres://user:pass@host:5432/dbname
});

export default { pool }
