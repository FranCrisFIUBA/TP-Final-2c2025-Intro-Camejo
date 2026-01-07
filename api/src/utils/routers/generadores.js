
import {pool} from "../../db.js";

/**
 * @desc Genera una funcion delete asincrona para ser usada mediante el metodo delete en express. Requiere que exista el parametro 'id'.
 * @returns {(function(Express.Request, Express.Response): Promise<void>)|*}
 * @example app.delete('usuarios/:id', generarDelete("usuarios"))
 */
export function generarDelete(tabla) {
    return async (req, res) => {
        console.log(`Generando metodo DELETE para la tabla ${tabla}`);

        try {
            const id = req.params.id;

            console.log(`Eliminando de la tabla '${tabla}' la entidad '${id}'`)

            const queryResult = await pool.query(`DELETE FROM $1 WHERE id = $2 RETURNING id`, [tabla, id])

            if (queryResult.rows.length === 0) {
                console.error("No se encontro la entidad.")
                req.status(404).json({error: `Entidad no encontrada.`});
            } else {
                console.log("Se elimino la entidad.")
                req.status(200).json({message: `Entidad eliminada.`});
            }
        } catch (e) {
            console.error(e);
            res.status(500).send({ error: "Error del servidor." });
        }
    }
}
