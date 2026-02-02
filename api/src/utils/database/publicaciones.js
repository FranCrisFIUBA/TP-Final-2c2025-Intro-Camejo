import { pool } from "../../db.js";

export async function intentarConseguirPublicacionPorId(id) {
    const { rows } = await pool.query("SELECT * FROM publicaciones WHERE id = $1", [id]);
    return rows[0] || null;
}

/**
 * @param params Parametros de busqueda.
 * @returns {Promise<*>}
 */
export async function getPublicacionesConBusqueda(params) {
    const {
        autor_id,
        autor,
        etiquetas,
        likes_minimos, likes_maximos,
        fecha_minima, fecha_maxima,
        alto_minimo, alto_maximo,
        ancho_minimo, ancho_maximo,
    } = params;

    const condicionesWhere = [];
    const condicionesHaving = [];
    const queryParams = [];

    const addWhere = (sql, value) => {
        queryParams.push(value);
        condicionesWhere.push(sql.replace("?", `$${queryParams.length}`));
    };

    const addHaving = (sql, value) => {
        queryParams.push(value);
        condicionesHaving.push(sql.replace("?", `$${queryParams.length}`));
    };
    
    if (autor) {
        queryParams.push(`%${autor}%`);
        condicionesWhere.push(`u.nombre ILIKE $${queryParams.length}`);
    }
    if (autor_id !== undefined && !isNaN(autor_id)) {
        addWhere("p.usuario_id = ?", Number(autor_id));
    }
    
    if (likes_minimos !== undefined)    addHaving("COUNT(l.id) >= ?", likes_minimos);
    if (likes_maximos !== undefined)    addHaving("COUNT(l.id) <= ?", likes_maximos);
    if (fecha_minima !== undefined)     addWhere("p.fecha_publicacion >= ?", fecha_minima);
    if (fecha_maxima !== undefined)     addWhere("p.fecha_publicacion <= ?", fecha_maxima);
    if (alto_minimo !== undefined)      addWhere("p.alto >= ?", alto_minimo);
    if (alto_maximo !== undefined)      addWhere("p.alto <= ?", alto_maximo);
    if (ancho_minimo !== undefined)     addWhere("p.ancho >= ?", ancho_minimo);
    if (ancho_maximo !== undefined)     addWhere("p.ancho <= ?", ancho_maximo);

    // TODO: implementar busqueda por etiquetas
    if (etiquetas !== undefined) {
        addWhere("etiquetas ILIKE ?", `%${etiquetas}%`);
    }
    
    let query = `
        SELECT 
            p.*,
            COUNT(l.id)::int AS likes_count
        FROM publicaciones p
        JOIN usuarios u ON p.usuario_id = u.id
        LEFT JOIN likes l ON l.publicacion_id = p.id
    `;

    if (condicionesWhere.length > 0) {
        query += ` WHERE ${condicionesWhere.join(" AND ")}`;
    }

    query += ` GROUP BY p.id`;

    if (condicionesHaving.length > 0) {
        query += ` HAVING ${condicionesHaving.join(" AND ")}`;
    }

    console.log("QUERY FINAL:", query);
    console.log("PARAMS:", queryParams);

    
    return pool.query(query, queryParams);
}

/**
 * @param params Parametros de busqueda
 * @returns {string|undefined} Error o undefined si es válido
 */
export function validarParametrosDeBusqueda(params) {
    const {
        autor_id,
        likes_minimos, likes_maximos,
        fecha_minima, fecha_maxima,
        alto_minimo, alto_maximo,
        ancho_minimo, ancho_maximo,
    } = params;

    const returnIfTrue = (condition, value) => condition ? value : undefined;

    const assetMinMax = (min, max, minErr, maxErr, rangeErr) => {
        if (min !== undefined && min < 0) return minErr;
        if (max !== undefined && max < 0) return maxErr;
        if (min !== undefined && max !== undefined && min > max) return rangeErr;
        return undefined;
    };

    return returnIfTrue(autor_id !== undefined && autor_id < 0, "Id del autor invalido")
        || assetMinMax(likes_minimos, likes_maximos, "Likes minimos < 0", "Likes maximos < 0", "Likes minimos > Likes maximos")
        || assetMinMax(fecha_minima, fecha_maxima, "Fecha minima < 0", "Fecha maxima < 0", "Fecha minima > Fecha maxima")
        || assetMinMax(alto_minimo, alto_maximo, "Alto minimo < 0", "Alto maximo < 0", "Alto minimo > Alto maximo")
        || assetMinMax(ancho_minimo, ancho_maximo, "Ancho minimo < 0", "Ancho maximo < 0", "Ancho minimo > Ancho maximo");
}