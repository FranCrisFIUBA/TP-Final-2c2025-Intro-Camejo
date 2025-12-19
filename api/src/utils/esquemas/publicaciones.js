import * as zod from "zod";
import { generarEsquemaId } from "./comun.js";
import { esquemaUsuario } from "./usuarios.js";

export const esquemaPublicacion = zod.object({
    id: generarEsquemaId("publicacion"),

    usuario_id: esquemaUsuario.shape.id,

    titulo: zod.string()
        .min(1)
        .max(100),

    etiquetas: zod.string()
        .min(1)
        .max(200),

    // solo nombre de archivo
    imagen: zod.string()
        .min(1)
        .max(255),

    alto_imagen: zod.number()
        .int()
        .positive()
        .optional(),

    ancho_imagen: zod.number()
        .int()
        .positive()
        .optional(),
});

export const esquemaPostPublicacion = zod.object({
    usuario_id: zod.coerce.number().int().positive(),
    titulo: zod.string().min(1).max(100),
    etiquetas: zod.string().min(1).max(200),
    imagen: zod.string(),
    alto_imagen: zod.coerce.number().int().positive().optional(),
    ancho_imagen: zod.coerce.number().int().positive().optional()
});

export const esquemaActualizacionPublicacion = esquemaPublicacion
    .omit({ usuario_id: true })
    .partial()
    .extend({ id: esquemaPublicacion.shape.id })
    .refine(
        data => Object.keys(data).length > 1,
        "Debe enviarse al menos un campo además del id"
    );