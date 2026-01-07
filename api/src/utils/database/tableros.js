import {pool} from "../../db.js";

export async function intentarObtenerTableroPorId(id) {
    const response = await pool.query(`
        SELECT * FROM tableros
        WHERE id=$1
        `, [id]
        );

    return response.rows[0];
}
