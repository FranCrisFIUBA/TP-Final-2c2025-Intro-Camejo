import {pool} from "../../db.js";
import {esquemaPublicacion} from "../esquemas/publicaciones.js";

export async function intentarConseguirPublicacionPorId(id) {
    const result = await pool.query("SELECT * FROM publicaciones WHERE id = $1", [id]);

    if (result.rowCount !== 0)
        return Promise.reject(`No existe la publicacion con id ${id}`)

    return esquemaPublicacion.safeParseAsync(result.rows[0])
}
