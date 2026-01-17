import fs from "fs";
import { IMAGENES_PATH } from "../../middlewares/storage.js";
import { intentarConseguirPublicacionPorId } from "../database/publicaciones.js";
import path from "node:path";

export async function eliminarImagenPublicacionPorId(id) {
    try {
        const publicacion = await intentarConseguirPublicacionPorId(id);

        if (!publicacion || !publicacion.imagen) {
            return false;
        }

        const ruta = path.join(IMAGENES_PATH, publicacion.imagen);

        await fs.promises.unlink(ruta);

        return true;

    } catch (err) {
        console.error("Error eliminando imagen:", err.message);
        return false;
    }
}
