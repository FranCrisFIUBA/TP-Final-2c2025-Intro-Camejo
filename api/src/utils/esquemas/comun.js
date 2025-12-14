
import * as zod from "zod";

export const generarEsquemaId = (nombre) => zod.int(`Id de ${nombre} invalido`)
