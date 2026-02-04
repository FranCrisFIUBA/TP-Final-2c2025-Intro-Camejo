import {pool} from "../../db.js";

export async function intentarConseguirListaPorId(id) {
    const result = await pool.query("SELECT * FROM listas WHERE id = $1", [id])

    if (result.rowCount === 0)
        return Promise.reject(`No existe la lista con id ${id}`)

    return result.rows[0]
}
