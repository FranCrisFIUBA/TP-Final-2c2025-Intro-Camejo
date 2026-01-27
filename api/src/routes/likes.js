// routes/likes.js
import express from 'express';
import { pool } from "../db.js";

const likes = express.Router();

// GET /likes
likes.get('/likes', async (req, res) => {
    try {
        const { count_only } = req.query;

        const result = count_only === true
            ? await pool.query('SELECT * FROM likes')
            : await pool.query('SELECT COUNT(*) FROM likes');

        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error del servidor al obtener los likes" });
    }
})

export default likes