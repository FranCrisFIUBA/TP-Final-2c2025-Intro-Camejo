import express from 'express';
import { pool } from "../db.js";
import {intentarObtenerTableroPorId} from "../utils/database/tableros.js";
import {existeUsuarioConId} from "../utils/database/usuarios.js";

const router = express.Router();

// GET tableros/
router.get('/', async (req, res) => {
    try {
        pool.query(`SELECT * FROM tableros`)
            .then(result => {
                res.json(result);
            })
            .catch(err => {
                console.error(err);
                res.status(500).json( { error: "Error en la base de datos al obtener tableros." } );
            });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Error del servidor al obtener tableros" });
    }
})

// GET tableros/:id
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const tablero = await intentarObtenerTableroPorId(id);

        if (!tablero) {
            res.status(404).json({error: "No se pudo encontrar el tablero de Id " + id});
        }

        res.status(200).json(tablero);
    } catch (e) {
        console.error(e);
        res.status(500).json({error: "Error del servidor al obtener el tablero de Id " + req.params.id});
    }
})

// DELETE tableros/:id
router.delete('/:id', async (req, res) => {
    try {
        const { rowCount } = await pool.query(
            "DELETE FROM tableros WHERE id = $1 RETURNING id",
            [req.params.id]
        );

        if (rowCount === 0) {
            return res.status(404).json({ error: "Tablero no encontrado" });
        }

        res.status(200).json({ message: "Tablero eliminado" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al eliminar el tablero" });
    }
})
