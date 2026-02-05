import fs from "fs";
import {deleteFile, LOCAL_IMAGENES_PATH, USE_S3} from "../../middlewares/storage.js";
import { intentarConseguirPublicacionPorId } from "../database/publicaciones.js";
import path from "node:path";

export async function eliminarImagenPublicacionPorId(id) {
    try {
        const publicacion = await intentarConseguirPublicacionPorId(id);

        if (!publicacion || !publicacion.imagen) {
            return false;
        }

        if (USE_S3) {
            // Para S3, la "imagen" ya es la key en el bucket
            await deleteFile(publicacion.imagen);
        } else {
            // Local
            const ruta = path.join(LOCAL_IMAGENES_PATH, publicacion.imagen);
            await fs.promises.unlink(ruta);
        }

        return true;

    } catch (err) {
        console.error("Error eliminando imagen:", err.message);
        return false;
    }
}