// routes/likes.js
import express from 'express';
import { pool } from "../db.js";

const likes = express.Router();

// GET /likes
likes.get('/', async (req, res) => {
    try {
        const countOnly = req.query.count_only === 'true';

        const query = countOnly
            ? 'SELECT COUNT(*)::int FROM likes'
            : 'SELECT * FROM likes';

        const result = await pool.query(query);
        if (countOnly) {
            return res.status(200).json({ total: result.rows[0].count });
        }
        
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error del servidor al obtener los likes" });
    }
});

// GET /likes/usuario/usuario_id
likes.get('/usuario/:usuario_id', async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const countOnly = req.query.count_only === 'true';
        const query = countOnly
            ? 'SELECT COUNT(*)::int FROM likes WHERE usuario_id = $1'
            : 'SELECT * FROM likes WHERE usuario_id = $1';

        const result = await pool.query(query, [usuario_id]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error del servidor al obtener los likes del usuario" });
    }
});

// GET /likes/publicacion/publicacion_id
likes.get('/publicacion/:publicacion_id', async (req, res) => {
    try {
        const { publicacion_id } = req.params;
        const countOnly = req.query.count_only === 'true';

        const query = countOnly
            ? 'SELECT COUNT(*)::int FROM likes WHERE publicacion_id = $1'
            : 'SELECT * FROM likes WHERE publicacion_id = $1';

        const result = await pool.query(query, [publicacion_id]);

        if (countOnly) {
            return res.json({ total: result.rows[0].count });
        }

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener likes" });
    }
});



// POST /likes/publicacion/
likes.post('/publicacion', async (req, res) => {
    try {
        const { usuario_id, publicacion_id } = req.body;

        const existe = await pool.query(
            'SELECT id FROM likes WHERE usuario_id = $1 AND publicacion_id = $2',
            [usuario_id, publicacion_id]
        );

        if (existe.rowCount > 0) {
            return res.status(200).json(existe.rows[0]);
        }

        const result = await pool.query(`
            INSERT INTO likes (usuario_id, publicacion_id)
            VALUES ($1, $2)
            RETURNING *
        `, [usuario_id, publicacion_id]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear like" });
    }
});


// DELETE /likes/:id
likes.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM likes WHERE id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Like no encontrado" });
        }

        res.json({ message: "Like eliminado", likeEliminado: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al eliminar" });
    }
});
export default likes