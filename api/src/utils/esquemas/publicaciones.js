import * as zod from 'zod';
import {generarEsquemaId} from "./comun.js";
import {esquemaUsuario} from "./usuarios.js";

export const esquemaPublicacion = zod.object({
    id: generarEsquemaId("publicacion"),

    usuario_id: esquemaUsuario.shape.id,

    titulo: zod.string()
        .nonempty("El título no puede estar vacío")
        .max(100, "El título no puede tener más de 100 caracteres"),

    etiquetas: zod.string()
        .nonempty("Las etiquetas no pueden estar vacías")
        .max(200, "Las etiquetas no pueden tener más de 200 caracteres"),

    url_imagen: zod.url("URL de imagen inválida")
        .nonempty("La URL de la imagen no puede estar vacía")
        .max(500, "La URL es demasiado larga"),

    alto_imagen: zod.int()
        .positive("El alto debe ser un número positivo")
        .optional(),

    ancho_imagen: zod.int()
        .positive("El ancho debe ser un número positivo")
        .optional(),
});

export const esquemaActualizacionPublicacion = esquemaPublicacion
    .clone() // clona el esquema
    .omit({ usuario_id: true }) // omite usuario_id ya que este no es necesario en la actualizacion
    .partial()// vuelve a todos los campos opcionales
    .extend({ id: esquemaPublicacion.shape.id }) // resetea id para que sea obligatorio
    .refine( data => Object.keys(data).length > 1, // valida que se haya pasado almenos un campo ademas de id
        "Al menos un campo debe ser proporcionado para actualizar")
