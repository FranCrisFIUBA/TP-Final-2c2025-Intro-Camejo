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

});

// GET /:id
// Obtiene una lista por id
listas.get("/:id", async (req, res) => {

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
