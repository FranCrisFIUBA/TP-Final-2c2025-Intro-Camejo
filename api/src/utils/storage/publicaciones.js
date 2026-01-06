import fs from "fs";
import {IMAGENES_PATH} from "../../middlewares/storage.js";
import {intentarConseguirPublicacionPorId} from "../database/publicaciones.js";

export async function eliminarImagenPublicacionPorId(id) {
    const publicacion = await intentarConseguirPublicacionPorId(id);

    if (!publicacion) {
        throw new Error("No se pudo encontrar una publicacion con Id " + id)
    }

    const { imagen } = publicacion;

    fs.unlink(IMAGENES_PATH + imagen, (err) => {
        if (err) {
            console.error(err);
        }
    });
}
