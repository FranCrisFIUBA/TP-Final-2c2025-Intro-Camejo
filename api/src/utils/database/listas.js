import {pool} from "../../db.js";
import {getPublicacionesConBusqueda, validarParametrosDeBusqueda} from "./publicaciones.js";

export async function intentarConseguirListaPorId(id) {
    const result = await pool.query("SELECT * FROM listas WHERE id = $1", [id])

    if (result.rowCount === 0)
        return Promise.reject(`No existe la lista con id ${id}`)

    return result.rows[0]
}

export async function intentarConseguirListasPorIdUsuario(id) {
    const result = await pool.query("SELECT * FROM listas WHERE usuario_id = $1", [id])
    return result.rows
}

export async function obtenerPublicacionesPorLista(id) {
    const lista = await intentarConseguirListaPorId(id);
    if (!lista) {
        return Promise.reject(`No existe la lista con id ${id}`)
    }

    // no se validan los parametros de la busqueda. todas las listas almacenadas se validan previamente
    return getPublicacionesConBusqueda(lista)
}