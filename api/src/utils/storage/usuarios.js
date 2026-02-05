import {intentarConseguirUsuarioPorId} from "../database/usuarios.js";
import fs from "fs";
import {LOCAL_ICONOS_PATH} from "../../middlewares/storage.js";
import * as path from "node:path";

export async function elimiarIconoUsuarioPorId(id) {
    const usuario = await intentarConseguirUsuarioPorId(id);

    if (!usuario) {
        throw new Error("No se pudo encontrar a un usuario con Id " + id)
    }

    if (usuario.icono) {
        fs.unlink(path.join(LOCAL_ICONOS_PATH, usuario.icono), (err) => {
            if (err) {
                console.error(err);
            }
        });
    }
}
