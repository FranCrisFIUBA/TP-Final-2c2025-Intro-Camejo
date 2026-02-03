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

// GET /likes/usuario/usuario_id
likes.get('/likes/usuario/:usuario_id', async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const { count_only } = req.query;

        const result = count_only === true
            ? await pool.query('SELECT * FROM likes WHERE usuario_id = ?', [usuario_id])
            : await pool.query('SELECT COUNT(*) FROM likes  WHERE usuario_id = ?', [usuario_id]);

        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error del servidor al obtener los likes del usuario" });
    }
})


// GET /likes/publicacion/publicacion_id
likes.get('/likes/publicacion/:publicacion_id', async (req, res) => {
    try {
        const { publicacion_id } = req.params;
        const { count_only } = req.query;

        const result = count_only === true
            ? await pool.query('SELECT * FROM likes WHERE publicacion_id = ?', [publicacion_id])
            : await pool.query('SELECT COUNT(*) FROM likes  WHERE publicacion_id = ?', [publicacion_id]);

        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error del servidor al obtener los likes de la publicacion" });
    }
})


// POST /likes/publicacion/
likes.post('/likes/publicacion/', async (req, res) => {
    try {
        const { usuario_id, publicacion_id } = req.body;

        if (!usuario_id || !publicacion_id) {
            return res.status(400).json({ error: "Faltan campos requeridos" });
        }

        const result = await pool.query(`
            INSERT INTO likes (usuario_id, publicacion_id)
            VALUES ($1, $2)
            RETURNING *
        `, [usuario_id, publicacion_id,]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creando el like:', error);
        res.status(500).json({ error: "Error al crear el like" });
    }
})

// DELETE /likes/:id
likes.delete('/likes/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query('DELETE FROM likes WHERE id = ?', [id]);


        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Like no encontrado" });
        }

        const likeEliminado = result.rows[0];

        res.json({ message: "Like eliminado", likeEliminado });
    } catch (err) {
        res.status(500).json({ error: "Error al eliminar" });
    }
})

export default likes
