import * as zod from "zod";
import {generarEsquemaId} from "./comun.js";
import {regexNombre, regexContrasenia} from "../regex.js";

export const esquemaUsuario = zod.object({
    id: generarEsquemaId("usuario"),

    nombre: zod.string()
        .regex(regexNombre, "Nombre invalido"),

    contrasenia: zod.string()
        .regex(regexContrasenia, "Contrasenia invalida"),

    email: zod.email("Email de usuario inválido"),

    icono: zod.url("URL de icono inválida")
        .optional(),

    fecha_nacimiento: zod.date("Fecha de nacimiento invalida"),

    fecha_registro: zod.date("Fecha de registro invalida")
})

export const esquemaActualizacionUsuario = esquemaUsuario
    .clone()
    .omit({ fecha_registro: true })
    .partial()
    .extend({ id: esquemaUsuario.shape.id })
    .refine(data => Object.keys(data).length > 1,
        "No se pasaron campos para actualizar")
