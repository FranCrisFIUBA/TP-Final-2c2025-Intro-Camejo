import {pool} from "../../db.js";
import {esquemaUsuario} from "../esquemas/usuarios.js";

export async function intentarConseguirUsuarioPorId(id) {
    const result = await pool.query("SELECT * FROM usuarios WHERE id = $1", [id])

    if (result.rowCount === 0)
        return Promise.reject(`No existe usuario con la id ${id}`)

    return esquemaUsuario.safeParseAsync(result.rows[0])
}

export async function intentarConseguirUsuarioPorNombre(nombre) {
    const result = await pool.query("SELECT * FROM usuarios WHERE nombre = $1", [nombre])

    if (result.rowCount === 0)
        return Promise.reject(`No existe usuario con el nombre ${nombre}`)

    return esquemaUsuario.safeParseAsync(result.rows[0])
}

export async function intentarConseguirUsuarioPorEmail(email) {
    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email])

    if (result.rowCount === 0)
        return Promise.reject(`No existe usuario con la email ${email}`)

    return esquemaUsuario.safeParseAsync(result.rows[0])
}

export async function actualizarUsuarioPorId(id, nombre, contrasenia, email, icono) {
    const sets = []
    const params = []

    if (nombre !== undefined) {
        sets.push("[nombre] = ?")
        params.push(nombre)
    }
    if (contrasenia !== undefined) {
        sets.push("[contrasenia] = ?")
        params.push(contrasenia)
    }
    if (email !== undefined) {
        sets.push("[email] = ?")
        params.push(email)
    }
    if (icono !== undefined) {
        sets.push("[icono] = ?")
        params.push(icono)
    }

    if (sets.length === 0) {
        return Promise.reject("No se ha pasado la cantidad de parametros adecuada")
    }

    params.push(id)

    const query = `UPDATE usuarios SET ${sets.join(", ")} WHERE id = ?`
    return pool.query(query, params)
}

export async function existeUsuarioConId(id) {
    const result = await pool.query(
        "SELECT 1 FROM usuarios WHERE id = $1",
        [id]
    );
    return result.rowCount > 0;
}

export async function existeUsuarioConNombre(nombre) {
    const result = await pool.query(
        "SELECT 1 FROM usuarios WHERE nombre = $1",
        [nombre]
    );
    return result.rowCount > 0;
}

export async function existeUsuarioConEmail(email) {
    const result = await pool.query(
        "SELECT 1 FROM usuarios WHERE email = $1",
        [email]
    );
    return result.rowCount > 0;
}
