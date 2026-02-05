import * as zod from "zod";
import {generarEsquemaId} from "./comun.js";
import {regexNombre, regexContrasenia} from "../regex.js";

export const esquemaUsuario = zod.object({
    id: generarEsquemaId("usuario"),

    nombre: zod.string()
        .regex(regexNombre, "Nombre invalido"),

    contrasenia: zod.string()
        .regex(regexContrasenia, "Contrasenia invalida"),

    email: zod.string().email("Email de usuario inválido"),

    icono: zod.string("URL de icono inválida")
        .nullable()
        .optional(),

    //fecha_nacimiento: zod.date("Fecha de nacimiento invalida"),

    //fecha_registro: zod.date("Fecha de registro invalida")
    fecha_nacimiento: zod.coerce.date({ 
        errorMap: () => ({ message: "Fecha de nacimiento inválida" }) 
    }),

    fecha_registro: zod.coerce.date()
})

export const esquemaPostUsuario = esquemaUsuario
    .clone()
    .omit({ id: true });

export const esquemaActualizacionUsuario = esquemaUsuario
    .clone()
    .omit({ fecha_registro: true })
    .partial()
    .extend({ id: esquemaUsuario.shape.id })
    .refine(data => Object.keys(data).length > 1,
        "No se pasaron campos para actualizar")