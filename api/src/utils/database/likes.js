import {pool} from "../../db.js";

export async function conteoLikesPublicacion(id) {
    const result = await pool.query(`
        SELECT 
        p.*,
        COUNT(l.id) AS likes
        FROM publicaciones p
        LEFT JOIN likes l ON l.publicacion_id = p.id
        WHERE p.id = $1
        GROUP BY p.id;
    `, [id]);

    return result.rows.length > 0 ? result.rows[0] : 0;
}