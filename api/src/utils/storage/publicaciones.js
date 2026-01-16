import fs from "fs";
import {IMAGENES_PATH} from "../../middlewares/storage.js";
import {intentarConseguirPublicacionPorId} from "../database/publicaciones.js";
import * as path from "node:path";

export async function eliminarImagenPublicacionPorId(id) {
    const publicacion = await intentarConseguirPublicacionPorId(id);
    if (!publicacion?.imagen) return false;

    try {
        await fs.promises.unlink(path.join(IMAGENES_PATH, publicacion.imagen));
        return true;
    } catch {
        return false;
    }
}