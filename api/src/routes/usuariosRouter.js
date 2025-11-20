
import express from 'express'
import { pool } from "../db.js";

const usuariosRouter = express.Router()

usuariosRouter.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM usuarios');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
})

export default usuariosRouter
