// routes/comentarios.js
import express from 'express';
import { pool } from "../db.js";
import {getFileUrl} from "../middlewares/storage.js";

const router = express.Router();

// GET - Obtener comentarios de una publicación
router.get('/publicacion/:publicacionId', async (req, res) => {
    try {
        const { publicacionId } = req.params;

        const result = await pool.query(`
            SELECT
                c.id,
                c.contenido as text,
                c.fecha_publicacion as date,
                c.fecha_edicion,
                u.id as usuario_id,
                u.nombre as author,
                u.icono as avatar
            FROM comentarios c
                     JOIN usuarios u ON c.usuario_id = u.id
            WHERE c.publicacion_id = $1
            ORDER BY c.fecha_publicacion ASC
        `, [publicacionId]);

        const comentarios = await Promise.all(result.rows.map(async comentario => ({
            id: comentario.id,
            author: comentario.author,
            avatar: comentario.avatar ? await getFileUrl(comentario.avatar, 'iconos') : null,
            text: comentario.text,
            date: comentario.date,
            usuario_id: comentario.usuario_id
        })));

        res.status(200).json(comentarios);
    } catch (error) {
        console.error('Error obteniendo comentarios:', error);
        res.status(500).json({ error: "Error al obtener comentarios" });
    }
});

// POST - Crear nuevo comentario
router.post('/', async (req, res) => {
    try {
        const { usuario_id, publicacion_id, contenido } = req.body;

        if (!usuario_id || !publicacion_id || !contenido) {
            return res.status(400).json({ error: "Faltan campos requeridos" });
        }

        const result = await pool.query(`
            INSERT INTO comentarios (usuario_id, publicacion_id, contenido)
            VALUES ($1, $2, $3)
            RETURNING *
        `, [usuario_id, publicacion_id, contenido]);

        // Obtener el comentario con información del usuario
        const comentarioCompleto = await pool.query(`
            SELECT
                c.id,
                c.contenido as text,
                c.fecha_publicacion as date,
                u.nombre as author,
                u.icono as avatar
            FROM comentarios c
                     JOIN usuarios u ON c.usuario_id = u.id
            WHERE c.id = $1
        `, [result.rows[0].id]);

        const comentario = comentarioCompleto.rows[0];
        if (comentario.avatar) {
            comentario.avatar = await getFileUrl(comentario.avatar, 'iconos');
        }

        res.status(201).json(comentario);
    } catch (error) {
        console.error('Error creando comentario:', error);
        res.status(500).json({ error: "Error al crear comentario" });
    }
});

// PATCH - Actualizar comentario
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { contenido } = req.body;
        
        if (!contenido) {
            return res.status(400).json({ error: "El contenido es requerido" });
        }

        pool.query(`
            UPDATE comentarios 
            SET contenido = $1, fecha_edicion = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `, [contenido, id])
            .then((result) => {
                res.status(200).json(result.rows[0])
            })
            .catch((err) => {
                console.log("Error: " + err);
                res.status(500).json({ error: "Error al eliminar el comentario de id " + id });
            });
    } catch (error) {
        console.error('Error actualizando comentario:', error);
        res.status(500).json({ error: "Error al actualizar comentario" });
    }
});

// DELETE - Eliminar comentario
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { rowCount } = await pool.query(
            "DELETE FROM comentarios WHERE id = $1 RETURNING id",
            [id]
        );

        if (rowCount === 0) {
            return res.status(404).json({ error: "Comentario no encontrado" });
        }

        res.status(200).json({ message: "Comentario eliminado" });
    } catch (error) {
        console.error('Error eliminando comentario:', error);
        res.status(500).json({ error: "Error al eliminar comentario" });
    }
});

export default router;