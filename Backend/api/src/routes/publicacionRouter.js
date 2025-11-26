import express from 'express';
import { pool } from "../db/connection.js";
import * as zod from "zod";

// Esquemas de validación
const esquemaPublicacion = zod.object({
    usuario_id: zod.number().int().positive("ID de usuario inválido"),
    titulo: zod.string().min(1, "El título no puede estar vacío").max(100, "El título no puede tener más de 100 caracteres"),
    etiquetas: zod.string().min(1, "Las etiquetas no pueden estar vacías").max(200, "Las etiquetas no pueden tener más de 200 caracteres"),
    url_imagen: zod.string().url("URL de imagen inválida").max(500, "La URL es demasiado larga"),
    alto_imagen: zod.number().int().positive("El alto debe ser un número positivo").optional(),
    ancho_imagen: zod.number().int().positive("El ancho debe ser un número positivo").optional(),
});

const esquemaActualizacionPublicacion = zod.object({
    titulo: zod.string().min(1).max(100).optional(),
    etiquetas: zod.string().min(1).max(200).optional(),
    url_imagen: zod.string().url().max(500).optional(),
    alto_imagen: zod.number().int().positive().optional(),
    ancho_imagen: zod.number().int().positive().optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "Al menos un campo debe ser proporcionado para actualizar"
});

// Funciones auxiliares
async function intentarConseguirPublicacionPorId(id) {
    const result = await pool.query("SELECT * FROM publicaciones WHERE id = $1", [id]);
    return result.rowCount === 0 ? null : result.rows[0];
}

async function verificarUsuarioExiste(usuarioId) {
    const result = await pool.query("SELECT id FROM usuarios WHERE id = $1", [usuarioId]);
    return result.rowCount > 0;
}

const publicacionRouter = express.Router();

// GET /publicaciones - Obtener todas las publicaciones
publicacionRouter.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, u.nombre as usuario_nombre, u.icono as usuario_icono 
            FROM publicaciones p 
            JOIN usuarios u ON p.usuario_id = u.id 
            ORDER BY p.fecha_publicacion DESC
        `);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener publicaciones" });
    }
});

// GET /publicaciones/:id - Obtener publicación específica
publicacionRouter.get('/:id', async (req, res) => {
    try {
        const publicacion = await intentarConseguirPublicacionPorId(req.params.id);
        if (!publicacion) {
            return res.status(404).json({ error: "Publicación no encontrada" });
        }
        
        // Incluir información del usuario
        const result = await pool.query(`
            SELECT p.*, u.nombre as usuario_nombre, u.icono as usuario_icono 
            FROM publicaciones p 
            JOIN usuarios u ON p.usuario_id = u.id 
            WHERE p.id = $1
        `, [req.params.id]);
        
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener publicación" });
    }
});

// GET /publicaciones/usuario/:usuarioId - Obtener publicaciones por usuario
publicacionRouter.get('/usuario/:usuarioId', async (req, res) => {
    try {
        const usuarioExiste = await verificarUsuarioExiste(req.params.usuarioId);
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
publicacionRouter.post('/', async (req, res) => {
    try {
        const parsedPublicacion = esquemaPublicacion.safeParse(req.body);
        
        if (!parsedPublicacion.success) {
            return res.status(400).json({ errors: parsedPublicacion.error.issues });
        }

        // Verificar que el usuario existe
        const usuarioExiste = await verificarUsuarioExiste(parsedPublicacion.data.usuario_id);
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
publicacionRouter.patch('/:id', async (req, res) => {
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
publicacionRouter.delete('/:id', async (req, res) => {
    try {
        const publicacion = await intentarConseguirPublicacionPorId(req.params.id);
        if (!publicacion) {
            return res.status(404).json({ error: "Publicación no encontrada" });
        }

        await pool.query("DELETE FROM publicaciones WHERE id = $1", [req.params.id]);
        res.status(200).json({ message: "Publicación eliminada" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al eliminar publicación" });
    }
});

export default publicacionRouter;