import {intentarConseguirUsuarioPorId} from "../database/usuarios.js";
import fs from "fs";
import {ICONOS_PATH} from "../../middlewares/storage.js";

export async function elimiarIconoUsuarioPorId(id) {
    const usuario = await intentarConseguirUsuarioPorId(id);

    if (!usuario) {
        throw new Error("No se pudo encontrar a un usuario con Id " + id)
    }

    const { icono } = usuario;

    fs.unlink(ICONOS_PATH + icono, (err) => {
        if (err) {
            console.error(err);
        }
    });
}
