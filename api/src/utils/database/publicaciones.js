import {pool} from "../../db.js";
import {esquemaPublicacion} from "../esquemas/publicaciones.js";

export async function intentarConseguirPublicacionPorId(id) {
    const result = await pool.query("SELECT * FROM publicaciones WHERE id = $1", [id]);

    if (result.rowCount !== 0)
        return Promise.reject(`No existe la publicacion con id ${id}`)

    return esquemaPublicacion.safeParseAsync(result.rows[0])
}

export async function getPublicacionesConBusqueda(params) {
    validarParametrosDeBusqueda(params);

    const {
        autor_id,
        etiquetas,
        likes_minimos, likes_maximos,
        fecha_minima, fecha_maxima,
        alto_minimo, alto_maximo,
        ancho_minimo, ancho_maximo,
    } = params;

    const condiciones = [];
    const queryParams = [];

    const addCond = (sql, value) => {
        queryParams.push(value);
        condiciones.push(sql.replace("?", `$${queryParams.length}`));
    };

    if (autor_id !== undefined)         addCond("usuario_id = ?", autor_id);
    if (likes_minimos !== undefined)    addCond("likes >= ?", likes_minimos);
    if (likes_maximos !== undefined)    addCond("likes <= ?", likes_maximos);
    if (fecha_minima !== undefined)     addCond("fecha_publicacion >= ?", fecha_minima);
    if (fecha_maxima !== undefined)     addCond("fecha_publicacion <= ?", fecha_maxima);
    if (alto_minimo !== undefined)      addCond("alto >= ?", alto_minimo);
    if (alto_maximo !== undefined)      addCond("alto <= ?", alto_maximo);
    if (ancho_minimo !== undefined)     addCond("ancho >= ?", ancho_minimo);
    if (ancho_maximo !== undefined)     addCond("ancho <= ?", ancho_maximo);

    // TODO: implementar busqueda por etiquetas

    const query =
        condiciones.length === 0
            ?`SELECT * FROM publicaciones`
            :`SELECT * FROM publicaciones WHERE ${condiciones.join(" AND ")}`
    ;

    return pool.query(query, queryParams);
}

function validarParametrosDeBusqueda(params) {
    return true;
}
