// routes/listas.js
import express from 'express';
import { pool } from "../db.js";
import {getPublicacionesConBusqueda, validarParametrosDeBusqueda} from "../utils/database/publicaciones.js";
import {intentarConseguirUsuarioPorId} from "../utils/database/usuarios.js";
import {
    intentarConseguirListaPorId,
    intentarConseguirListaPorIdUsuario,
    intentarConseguirListasPorIdUsuario, obtenerPublicacionesPorLista
} from "../utils/database/listas.js";

const listas = express.Router();

// GET /
// Obtiene todas las listas
listas.get("/", async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM listas`);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Error al obtener publicaciones"});
    }
});

// GET /:id
// Obtiene una lista por id
listas.get("/:id", async (req, res) => {
    try {
        intentarConseguirListaPorId(req.params.id)
            .then( (lista) => {
                res.status(200).send(lista)})
            .catch( (err) => {
                console.error(err)
                res.status(404).json({ error: "Lista no encontrada" });})

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error del servidor al obtener una lista" });
    }
});


// GET /usuario/:usuario_id
// Obtiene todas las listas de un usuario
listas.get("/usuario/:usuario_id", async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const listas = await intentarConseguirListasPorIdUsuario(usuario_id);
        res.status(200).send(listas);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error del servidor al obtener una lista" });
    }
});

// GET /:id/publicaciones
// Obtiene todas las publicaciones de una lista
listas.get("/:id/publicaciones", async (req, res) => {
    try {
        const { id } = req.params;

        obtenerPublicacionesPorLista(id)
            .then(listas =>
                res.status(200).send(listas))
            .catch( (err) => {
                console.error(err);
                res.status(500).json({ error: "Error al obtener las publicaciones de una lista" });
            })
    } catch (err) {
        console.error(err);
    }
});

// POST /
// Crea una nueva lista
listas.post("/", async (req, res) => {
    try {
        const {
            usuario_id,
            titulo,
            etiquetas,
            likes_minimos,
            likes_maximos,
            fecha_minima,
            fecha_maxima,
            alto_minimo,
            alto_maximo,
            ancho_minimo,
            ancho_maximo
        } = req.body;

        if (!usuario_id || !titulo)
            return res.status(400).json({ error: "usuario_id y titulo son obligatorios" });

        if (likes_minimos !== null && likes_maximos !== null && likes_minimos > likes_maximos)
            return res.status(400).json({ error: "likes_minimos > likes_maximos" });

        if (alto_minimo !== null && alto_maximo !== null && alto_minimo > alto_maximo)
            return res.status(400).json({ error: "alto_minimo > alto_maximo" });

        if (ancho_minimo !== null && ancho_maximo !== null && ancho_minimo > ancho_maximo)
            return res.status(400).json({ error: "ancho_minimo > ancho_maximo" });

        if (fecha_minima && fecha_maxima && new Date(fecha_minima) > new Date(fecha_maxima))
            return res.status(400).json({ error: "fecha_minima > fecha_maxima" });

        const result = await pool.query(`
            INSERT INTO listas (usuario_id,
                                titulo,
                                etiquetas,
                                likes_minimos,
                                likes_maximos,
                                fecha_minima,
                                fecha_maxima,
                                alto_minimo,
                                alto_maximo,
                                ancho_minimo,
                                ancho_maximo)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *;
        `, [usuario_id,
            titulo,
            etiquetas,
            likes_minimos,
            likes_maximos,
            fecha_minima,
            fecha_maxima,
            alto_minimo,
            alto_maximo,
            ancho_minimo,
            ancho_maximo]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear la lista" });
    }
})

// DELETE /:id
// Elimina una lista por id
listas.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            DELETE FROM listas
            WHERE id=$1
            RETURNING *;
        `, [id]);

        if (result.rows.length === 0) {
            res.status(404).json({ error: "No se ha encontrado la lista" });
        }

        res.status(200).send(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar la lista" });
    }
})

// PATCH /:id
// Actualiza una lista por id
listas.patch("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            titulo,
            etiquetas,
            likes_minimos,
            likes_maximos,
            fecha_minima,
            fecha_maxima,
            alto_minimo,
            alto_maximo,
            ancho_minimo,
            ancho_maximo
        } = req.body;

        // Validaciones lógicas
        if (likes_minimos !== null && likes_maximos !== null && likes_minimos > likes_maximos)
            return res.status(400).json({ error: "likes_minimos > likes_maximos" });

        if (alto_minimo !== null && alto_maximo !== null && alto_minimo > alto_maximo)
            return res.status(400).json({ error: "alto_minimo > alto_maximo" });

        if (ancho_minimo !== null && ancho_maximo !== null && ancho_minimo > ancho_maximo)
            return res.status(400).json({ error: "ancho_minimo > ancho_maximo" });

        if (fecha_minima && fecha_maxima && new Date(fecha_minima) > new Date(fecha_maxima))
            return res.status(400).json({ error: "fecha_minima > fecha_maxima" });

        // Construcción dinámica del UPDATE
        const fields = [];
        const values = [];
        let i = 1;

        const add = (name, value) => {
            if (value !== undefined) {
                fields.push(`${name} = $${i++}`);
                values.push(value);
            }
        };

        add("titulo", titulo);
        add("etiquetas", etiquetas);
        add("likes_minimos", likes_minimos);
        add("likes_maximos", likes_maximos);
        add("fecha_minima", fecha_minima);
        add("fecha_maxima", fecha_maxima);
        add("alto_minimo", alto_minimo);
        add("alto_maximo", alto_maximo);
        add("ancho_minimo", ancho_minimo);
        add("ancho_maximo", ancho_maximo);

        if (fields.length === 0)
            return res.status(400).json({ error: "No hay campos para actualizar" });

        const query = `
            UPDATE listas
            SET ${fields.join(", ")}
            WHERE id = $${i}
            RETURNING *;
        `;

        values.push(id);

        const result = await pool.query(query, values);

        if (result.rows.length === 0)
            return res.status(404).json({ error: "Lista no encontrada" });

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar la lista" });
    }
});

export default listas;
