import {pool} from "../../db.js";
import {esquemaUsuario} from "../esquemas/usuarios.js";

export const intentarConseguirUsuarioPorId = async (id) => {
    // Usamos $1 en lugar de ?
    const query = 'SELECT * FROM usuarios WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    // Retornamos el primer usuario encontrado o null
    return result.rows.length > 0 ? result.rows[0] : null;
};

export async function intentarConseguirUsuarioPorNombre(nombre) {
    const result = await pool.query("SELECT * FROM usuarios WHERE nombre = ?", [nombre])

    if (result.rowCount !== 0)
        return Promise.reject(`No existe usuario con el nombre ${nombre}`)

    return esquemaUsuario.safeParseAsync(result.rows[0])
}

export async function intentarConseguirUsuarioPorEmail(email) {
    const result = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email])

    if (result.rowCount !== 0)
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
    return (await intentarConseguirUsuarioPorId(id)).success;
}

export async function existeUsuarioConNombre(nombre) {
    return (await intentarConseguirUsuarioPorNombre(nombre)).success;
}

export async function existeUsuarioConEmail(email) {
    return (await intentarConseguirUsuarioPorEmail(email)).success;
}
