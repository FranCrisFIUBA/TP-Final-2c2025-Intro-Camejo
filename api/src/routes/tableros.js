import express from 'express';
import { pool } from "../db.js";

const router = express.Router();


// GET tableros/
router.get('/', (req, res) => {
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
