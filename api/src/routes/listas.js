import express from "express";
import {pool} from "../db.js";

const listas = express.Router();

listas.get("/", async (req, res) => {
    try {
        const usuarioId = req.query.usuario_id;

        const result = await pool.query(
            `
            SELECT *
            FROM listas
            WHERE usuario_id = $1
            ORDER BY id DESC
            `,
            [usuarioId]
        );

        res.status(200).json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener búsquedas personalizadas" });
    }
});

listas.post("/", async (req, res) => {
    try {
        console.log("BODY RECIBIDO:", req.body);

        const usuarioId = req.body.usuario_id;


        const {
            titulo,
            etiquetas,
            fecha_publicacion_min,
            fecha_publicacion_max
        } = req.body;

        const result = await pool.query(
            
            `
            INSERT INTO listas (
                usuario_id,
                titulo,
                etiquetas,
                fecha_publicacion_min,
                fecha_publicacion_max
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            `,
            [
                usuarioId,
                titulo,
                etiquetas,
                fecha_publicacion_min ?? null,
                fecha_publicacion_max ?? null
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al guardar búsqueda personalizada" });
    }
});

export default listas;
