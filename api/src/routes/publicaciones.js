import express from 'express';
import { pool } from "../db.js";
import {
    esquemaActualizacionPublicacion,
    esquemaPostPublicacion
} from "../utils/esquemas/publicaciones.js";
import {
    getPublicacionesConBusqueda,
    intentarConseguirPublicacionPorId, validarParametrosDeBusqueda
} from "../utils/database/publicaciones.js"
import {existeUsuarioConId} from "../utils/database/usuarios.js";
import {imagenPublicacionUpload} from "../middlewares/storage.js";
import multer from "multer";
import {eliminarImagenPublicacionPorId} from "../utils/storage/publicaciones.js";

const publicaciones = express.Router();

// GET /publicaciones - Obtener todas las publicaciones
publicaciones.get('/', async (req, res) => {
    // TODO: Permitir solicitar el orden de las publicaciones, ascendente o descendente; por fecha de publicacion o likes.
    console.log("REQ.QUERY COMPLETO:", req.query);
    try {
        const params = {
            etiquetas: req.query.tag,
            autor: req.query.autor,
            /*autor_id: req.query.autor,*/
            likes_minimos: req.query.likesMin,
            likes_maximos: req.query.likesMax,
            fecha_minima: req.query.fechaMin,
            fecha_maxima: req.query.fechaMax,
        };    
        
        console.log("PARAMS RECIBIDOS EN BACKEND:", params);

        const error = validarParametrosDeBusqueda(params);
        if (error)
            return res.status(400).json({error: error});

        const result = await getPublicacionesConBusqueda(params);

        res.status(200).json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener publicaciones" });
    }
});

// GET /publicaciones/:id - Obtener publicacion por id
publicaciones.get('/:id', async (req, res) => {
    // TODO: Permitir solicitar el orden de las publicaciones, ascendente o descendente; por fecha de publicacion o likes.
    console.log("QUERY:", req.query);


    try {
        intentarConseguirPublicacionPorId(req.params.id)
            .then( (publicacion) => {
                res.status(200).json(publicacion)
            })
            .catch( (err) => {
                console.error(err)
                res.status(404).json({ error: "Publicación no encontrada" })
            })
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

// POST /publicaciones - Crear nueva publicación con imagen
publicaciones.post(
    '/',
    (req, res, next) => {
        imagenPublicacionUpload.single('imagen')(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ error: err.message });
            } else if (err) {
                return res.status(500).json({ error: "Error en la subida de archivo" });
            }
            next();
        });
    },
    async (req, res) => {
        try {
            console.log("req.file:", req.file);
            console.log("req.body:", req.body);

            // Imagen obligatoria
            if (!req.file) {
                return res.status(400).json({ error: "Imagen requerida" });
            }

            // Parseo y normalización (multipart => strings)
            const parsedPublicacion = esquemaPostPublicacion.safeParse({
                usuario_id: Number(req.body.usuario_id),
                titulo: req.body.titulo,
                etiquetas: req.body.etiquetas,
                imagen: req.file.filename,
                alto_imagen: req.body.alto_imagen
                    ? Number(req.body.alto_imagen)
                    : undefined,
                ancho_imagen: req.body.ancho_imagen
                    ? Number(req.body.ancho_imagen)
                    : undefined
            });

            if (!parsedPublicacion.success) {
                return res.status(400).json({
                    errors: parsedPublicacion.error.issues
                });
            }

            // Verificar usuario
            const usuarioExiste = await existeUsuarioConId(
                parsedPublicacion.data.usuario_id
            );

            if (!usuarioExiste) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            const ahora = new Date();

            // Insertar publicación
            const result = await pool.query(
                `INSERT INTO publicaciones
                    (usuario_id, titulo, etiquetas, imagen,
                     alto_imagen, ancho_imagen,
                     fecha_publicacion, fecha_edicion)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 RETURNING *`,
                [
                    parsedPublicacion.data.usuario_id,
                    parsedPublicacion.data.titulo,
                    parsedPublicacion.data.etiquetas,
                    parsedPublicacion.data.imagen,
                    parsedPublicacion.data.alto_imagen ?? null,
                    parsedPublicacion.data.ancho_imagen ?? null,
                    ahora,
                    ahora
                ]
            );

            res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Error al crear publicación" });
        }
    }
);

// PATCH /publicaciones/:id - Actualizar publicación
publicaciones.patch(
    '/:id',
    (req, res, next) => {
        imagenPublicacionUpload.single('imagen')(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ error: err.message });
            } else if (err) {
                return res.status(500).json({ error: "Error en la subida de archivo" });
            }
            next();
        });
    },

    async (req, res) => {
        try {
            const { id } = req.params;

            const publicacion = await intentarConseguirPublicacionPorId(id);
            if (!publicacion) {
                return res.status(404).json({ error: "Publicación no encontrada" });
            }

            const datosActualizados = {
                id: Number(id), 
                ...req.body,
                imagen: req.file ? req.file.filename : undefined,
                alto_imagen: req.body.alto_imagen ? Number(req.body.alto_imagen) : undefined,
                ancho_imagen: req.body.ancho_imagen ? Number(req.body.ancho_imagen) : undefined
            };

            const parsedActualizacion = await esquemaActualizacionPublicacion.safeParseAsync(datosActualizados);

            if (!parsedActualizacion.success) {
                return res.status(400).json({
                    errors: parsedActualizacion.error.issues
                });
            }

            const dataParaDB = { ...parsedActualizacion.data };
            if (req.file) {
                dataParaDB.imagen = req.file.filename;
            }

            const campos = [];
            const valores = [];
            let i = 1;

            Object.entries(dataParaDB).forEach(([key, value]) => {
                if (key !== 'id' && value !== undefined) {
                    campos.push(`${key} = $${i}`);
                    valores.push(value);
                    i++;
                }
            });

            campos.push(`fecha_edicion = CURRENT_TIMESTAMP`);

            valores.push(id);

            const query = `
                UPDATE publicaciones
                SET ${campos.join(', ')}
                WHERE id = $${i}
                RETURNING *
            `;

            const result = await pool.query(query, valores);

            res.status(200).json(result.rows[0]);
        } catch (err) { 
            console.error("Error detallado:", err);
            
            if (err && err.issues) {
                return res.status(400).json({ 
                    error: "Datos inválidos", 
                    detalles: err.issues.map(i => i.message) 
                });
            }
            return res.status(500).json({ error: "Error al actualizar publicación" });
        }
    }
);

// DELETE /publicaciones/:id - Eliminar publicación
publicaciones.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const imagenEliminada = await eliminarImagenPublicacionPorId(id);

        const { rowCount } = await pool.query("DELETE FROM publicaciones WHERE id = $1", [id]);

        if (rowCount === 0) {
            return res.status(404).json({ error: "Publicación no encontrada" });
        }

        res.json({ message: "Publicación eliminada", imagenEliminada });
    } catch (err) {
        res.status(500).json({ error: "Error al eliminar" });
    }
});

export default publicaciones;
