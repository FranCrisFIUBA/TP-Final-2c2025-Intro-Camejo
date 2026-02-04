// routes/listas.js
import express from 'express';
import { pool } from "../db.js";
import {getPublicacionesConBusqueda, validarParametrosDeBusqueda} from "../utils/database/publicaciones.js";
import {intentarConseguirUsuarioPorId} from "../utils/database/usuarios.js";
import {intentarConseguirListaPorId} from "../utils/database/listas.js";

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

});

// GET /:id/publicaciones
// Obtiene todas las publicaciones de una lista
listas.get("/:id/publicaciones", async (req, res) => {

});

// POST /
// Crea una nueva lista
listas.post("/", async (req, res) => {

})

// DELETE /:id
// Elimina una lista por id
listas.delete("/:id", async (req, res) => {

})

// PATCH /:id
// Actualiza una lista por id
listas.patch("/:id", async (req, res) => {

})

export default listas;
