// routes/likes.js
import express from 'express';
import { pool } from "../db.js";

const router = express.Router();

// GET - Verificar si un usuario dio like a una publicación
router.get('/publicacion/:publicacionId/usuario/:usuarioId', async (req, res) => {
    try {
        const { publicacionId, usuarioId } = req.params;
        
        console.log('Verificando like:', { publicacionId, usuarioId });
        
        const result = await pool.query(`
            SELECT id FROM likes 
            WHERE publicacion_id = $1 AND usuario_id = $2
        `, [publicacionId, usuarioId]);
        
        const response = {
            liked: result.rows.length > 0,
            likeId: result.rows.length > 0 ? result.rows[0].id : null
        };
        
        console.log('Resultado verificación like:', response);
        
        res.status(200).json(response);
    } catch (error) {
        console.error('Error verificando like:', error);
        res.status(500).json({ error: "Error al verificar like" });
    }
});

// GET - Obtener cantidad de likes de una publicación
router.get('/publicacion/:publicacionId/count', async (req, res) => {
    try {
        const { publicacionId } = req.params;
        
        console.log('Obteniendo conteo de likes para publicación:', publicacionId);
        
        const result = await pool.query(`
            SELECT COUNT(*) as like_count 
            FROM likes 
            WHERE publicacion_id = $1
        `, [publicacionId]);
        
        const likeCount = parseInt(result.rows[0].like_count);
        
        console.log('Conteo de likes:', likeCount);
        
        res.status(200).json({
            likes: likeCount
        });
    } catch (error) {
        console.error('Error obteniendo likes:', error);
        res.status(500).json({ error: "Error al obtener likes" });
    }
});

// POST - Dar like a una publicación 
router.post('/', async (req, res) => {
    try {
        const { usuario_id, publicacion_id } = req.body;
        
        console.log('Datos recibidos para like:', { usuario_id, publicacion_id });
        
        if (!usuario_id || !publicacion_id) {
            return res.status(400).json({ error: "Faltan campos requeridos: usuario_id y publicacion_id" });
        }
        
        // Verificar si ya existe el like  (usando las variables correctas)
        const existingLike = await pool.query(`
            SELECT id FROM likes 
            WHERE publicacion_id = $1 AND usuario_id = $2
        `, [publicacion_id, usuario_id]); // <-: usar publicacion_id y usuario_id del body
        
        if (existingLike.rows.length > 0) {
            console.log('Like ya existe para usuario:', usuario_id, 'en publicación:', publicacion_id);
            return res.status(400).json({ error: "Ya diste like a esta publicación" });
        }
        
        console.log('Insertando nuevo like...');
        const result = await pool.query(`
            INSERT INTO likes (usuario_id, publicacion_id)
            VALUES ($1, $2)
            RETURNING *
        `, [usuario_id, publicacion_id]);
        
        // Obtener el nuevo conteo de likes
        const countResult = await pool.query(`
            SELECT COUNT(*) as like_count 
            FROM likes 
            WHERE publicacion_id = $1
        `, [publicacion_id]);
        
        const totalLikes = parseInt(countResult.rows[0].like_count);
        
        console.log('Like agregado exitosamente:', {
            likeId: result.rows[0].id,
            totalLikes: totalLikes
        });
        
        res.status(201).json({
            message: "Like agregado",
            likeId: result.rows[0].id,
            totalLikes: totalLikes
        });
    } catch (error) {
        console.error('Error dando like:', error);
        res.status(500).json({ error: "Error al dar like: " + error.message });
    }
});

// DELETE - Quitar like 
router.delete('/publicacion/:publicacionId/usuario/:usuarioId', async (req, res) => {
    try {
        const { publicacionId, usuarioId } = req.params;
        
        console.log('Eliminando like:', { publicacionId, usuarioId });
        
        const result = await pool.query(`
            DELETE FROM likes 
            WHERE publicacion_id = $1 AND usuario_id = $2
            RETURNING *
        `, [publicacionId, usuarioId]);
        
        if (result.rows.length === 0) {
            console.log('Like no encontrado para eliminar');
            return res.status(404).json({ error: "Like no encontrado" });
        }
        
        // Obtener el nuevo conteo de likes
        const countResult = await pool.query(`
            SELECT COUNT(*) as like_count 
            FROM likes 
            WHERE publicacion_id = $1
        `, [publicacionId]);
        
        const totalLikes = parseInt(countResult.rows[0].like_count);
        
        console.log('Like eliminado exitosamente. Nuevo total:', totalLikes);
        
        res.status(200).json({
            message: "Like eliminado",
            totalLikes: totalLikes
        });
    } catch (error) {
        console.error('Error eliminando like:', error);
        res.status(500).json({ error: "Error al eliminar like" });
    }
});

// GET - Obtener publicaciones likes por usuario
router.get('/usuario/:usuarioId', async (req, res) => {
    try {
        const { usuarioId } = req.params;
        
        console.log('Obteniendo likes del usuario:', usuarioId);
        
        const result = await pool.query(`
            SELECT 
                p.id,
                p.titulo as title,
                p.url_imagen as image,
                p.fecha_publicacion as "publishDate",
                u.nombre as "authorName",
                u.icono as "authorAvatar",
                p.usuario_id as "id_author",
                p.etiquetas
            FROM likes l
            JOIN publicaciones p ON l.publicacion_id = p.id
            JOIN usuarios u ON p.usuario_id = u.id
            WHERE l.usuario_id = $1
            ORDER BY l.fecha_like DESC
        `, [usuarioId]);
        
        const publicacionesConLikes = result.rows.map(publicacion => ({
            ...publicacion,
            likes: 0, // Se calculará después
            hashtags: publicacion.etiquetas ? 
                publicacion.etiquetas.split(',').map(tag => `#${tag.trim()}`) : []
        }));
        
        console.log('Likes del usuario encontrados:', publicacionesConLikes.length);
        
        res.status(200).json(publicacionesConLikes);
    } catch (error) {
        console.error('Error obteniendo likes del usuario:', error);
        res.status(500).json({ error: "Error al obtener likes del usuario" });
    }
});

export default router;