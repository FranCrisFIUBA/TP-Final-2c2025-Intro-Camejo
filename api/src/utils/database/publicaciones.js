import {pool} from "../../db.js";
import {esquemaPublicacion} from "../esquemas/publicaciones.js";

export async function intentarConseguirPublicacionPorId(id) {
    const { rows } = await pool.query("SELECT * FROM publicaciones WHERE id = $1", [id]);
    return rows[0] || null;
}
