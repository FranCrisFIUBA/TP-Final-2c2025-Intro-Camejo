import fs from "fs";
import {IMAGENES_PATH} from "../../middlewares/storage.js";
import {intentarConseguirPublicacionPorId} from "../database/publicaciones.js";
import * as path from "node:path";

export async function eliminarImagenPublicacionPorId(id) {
    const publicacion = await intentarConseguirPublicacionPorId(id);

    if (!publicacion) {
        throw new Error("No se pudo encontrar una publicacion con Id " + id)
    }

    if (publicacion.imagen) {
        fs.unlink(path.join(IMAGENES_PATH, publicacion.imagen), (err) => {
            if (err) {
                console.error(err);
            }
        });
    }
}
