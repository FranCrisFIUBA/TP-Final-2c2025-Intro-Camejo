import express from 'express';
import { pool } from "../db.js";
import {esquemaActualizacionPublicacion, esquemaPublicacion} from "../utils/esquemas/publicaciones.js";

// Funciones auxiliares
async function intentarConseguirPublicacionPorId(id) {
    const result = await pool.query("SELECT * FROM publicaciones WHERE id = $1", [id]);
    return result.rowCount === 0 ? null : result.rows[0];
}

const publicaciones = express.Router();

// GET /publicaciones - Obtener todas las publicaciones
publicaciones.get('/', async (req, res) => {
    // TODO: Permitir solicitar el orden de las publicaciones, ascendente o descendente; por fecha de publicacion o likes.

    try {
        const result = await pool.query(`
            SELECT * FROM publicaciones
            ORDER BY fecha_publicacion DESC
        `);

        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener publicaciones" });
    }
});

// GET /publicaciones/:id - Obtener publicaciones por usuario
publicaciones.get('/:id', async (req, res) => {
    // TODO: Permitir solicitar el orden de las publicaciones, ascendente o descendente; por fecha de publicacion o likes.

    try {
        const publicacion = await intentarConseguirPublicacionPorId(req.params.id);
        if (!publicacion) {
            return res.status(404).json({ error: "Publicación no encontrada" });
        }

        const result = await pool.query(`
            SELECT * FROM publicaciones
                     WHERE p.id = $1
            ORDER BY fecha_publicacion DESC
        `, [req.params.id]);
        
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener publicación" });
    }
});

// GET /publicaciones/usuario/:usuarioId - Obtener publicaciones por usuario
publicaciones.get('/usuario/:usuarioId', async (req, res) => {
    try {
        const usuarioExiste = await existeUsuarioConId(req.params.usuarioId);
        if (!usuarioExiste) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const result = await pool.query(`
            SELECT p.*, u.nombre as usuario_nombre, u.icono as usuario_icono 
            FROM publicaciones p 
            JOIN usuarios u ON p.usuario_id = u.id 
            WHERE p.usuario_id = $1 
            ORDER BY p.fecha_publicacion DESC
        `, [req.params.usuarioId]);
        
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener publicaciones del usuario" });
    }
});

// POST /publicaciones - Crear nueva publicación
publicaciones.post('/', async (req, res) => {
    try {
        const parsedPublicacion = esquemaPublicacion.safeParse(req.body);
        
        if (!parsedPublicacion.success) {
            return res.status(400).json({ errors: parsedPublicacion.error.issues });
        }

        // Verificar que el usuario existe
        const usuarioExiste = await existeUsuarioConId(parsedPublicacion.data.usuario_id);
        if (!usuarioExiste) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const result = await pool.query(
            `INSERT INTO publicaciones 
            (usuario_id, titulo, etiquetas, url_imagen, alto_imagen, ancho_imagen) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [
                parsedPublicacion.data.usuario_id,
                parsedPublicacion.data.titulo,
                parsedPublicacion.data.etiquetas,
                parsedPublicacion.data.url_imagen,
                parsedPublicacion.data.alto_imagen || null,
                parsedPublicacion.data.ancho_imagen || null
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al crear publicación" });
    }
});

// PATCH /publicaciones/:id - Actualizar publicación
publicaciones.patch('/:id', async (req, res) => {
    try {
        const publicacion = await intentarConseguirPublicacionPorId(req.params.id);
        if (!publicacion) {
            return res.status(404).json({ error: "Publicación no encontrada" });
        }

        const parsedActualizacion = esquemaActualizacionPublicacion.safeParse(req.body);
        if (!parsedActualizacion.success) {
            return res.status(400).json({ errors: parsedActualizacion.error.issues });
        }

        // Construir query dinámica
        const campos = [];
        const valores = [];
        let contador = 1;

        Object.entries(parsedActualizacion.data).forEach(([key, value]) => {
            if (value !== undefined) {
                campos.push(`${key} = $${contador}`);
                valores.push(value);
                contador++;
            }
        });

        // Agregar fecha_edicion automáticamente
        campos.push('fecha_edicion = CURRENT_TIMESTAMP');
        
        valores.push(req.params.id);
        const query = `UPDATE publicaciones SET ${campos.join(', ')} WHERE id = $${contador} RETURNING *`;
        
        const result = await pool.query(query, valores);
        res.status(200).json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al actualizar publicación" });
    }
});

// DELETE /publicaciones/:id - Eliminar publicación
publicaciones.delete('/:id', async (req, res) => {
    try {
        const { rowCount } = await pool.query(
            "DELETE FROM publicaciones WHERE id = $1 RETURNING id",
            [req.params.id]
        );

        if (rowCount === 0) {
            return res.status(404).json({ error: "Publicación no encontrada" });
        }

        res.status(200).json({ message: "Publicación eliminada" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al eliminar publicación" });
    }
});

export default publicaciones;
