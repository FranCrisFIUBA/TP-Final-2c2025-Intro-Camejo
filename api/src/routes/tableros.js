import express from "express";
import { pool } from "../db.js";
import { existeUsuarioConId } from "../utils/database/usuarios.js";
import {getFileUrl} from "../middlewares/storage.js";

const tableros = express.Router();


// GET /tableros - Obtener todos los tableros
tableros.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id,
        t.usuario_id,
        t.titulo,
        t.etiquetas,
        t.fecha_publicacion,
        t.fecha_edicion,
        COUNT(tp.publicacion_id) AS cantidad_pins
      FROM tableros t
      LEFT JOIN tableros_publicaciones tp 
        ON t.id = tp.tablero_id
      GROUP BY t.id
      ORDER BY t.fecha_publicacion DESC
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener tableros" });
  }
});

// GET /tableros/usuario/:idUsuario - Obtener todos los tableros de un usuario
tableros.get("/usuario/:idUsuario", async (req, res) => {
  try {
    const { idUsuario } = req.params;

    const usuarioExiste = await existeUsuarioConId(idUsuario);
    if (!usuarioExiste) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const result = await pool.query(`
      SELECT 
        t.id,
        t.usuario_id,
        t.titulo,
        t.etiquetas,
        t.fecha_publicacion,
        t.fecha_edicion,
        COUNT(tp.publicacion_id) AS cantidad_pins
      FROM tableros t
      LEFT JOIN tableros_publicaciones tp 
        ON t.id = tp.tablero_id
      WHERE t.usuario_id = $1
      GROUP BY t.id
      ORDER BY t.fecha_publicacion DESC
    `, [idUsuario]);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener tableros del usuario" });
  }
});


// GET /tablero/:idTablero/publicaciones Obtiene todas las publicaciones de un tablero
tableros.get("/tablero/:idTablero/publicaciones", async (req, res) => {
    try {
        const { idTablero } = req.params;

        const existe = await pool.query(
            "SELECT id FROM tableros WHERE id = $1",
            [idTablero]
        );

        if (!existe.rowCount) {
            return res.status(404).json({ error: "Tablero no encontrado" });
        }

        const result = await pool.query(`
            SELECT
                p.*,
                u.nombre AS usuario_nombre,
                u.icono AS usuario_icono
            FROM publicaciones p
                     JOIN tableros_publicaciones tp
                          ON p.id = tp.publicacion_id
                     JOIN usuarios u
                          ON p.usuario_id = u.id
            WHERE tp.tablero_id = $1
            ORDER BY p.fecha_publicacion DESC
        `, [idTablero]);

        // Convertir imágenes e iconos a URLs públicas o temporales
        const publicacionesConUrls = result.rows.map(pub => ({
            ...pub,
            imagen: pub.imagen ? getFileUrl(pub.imagen, 'imagenes') : null,
            usuario_icono: pub.usuario_icono ? getFileUrl(pub.usuario_icono, 'iconos') : null
        }));

        res.status(200).json(publicacionesConUrls);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener publicaciones del tablero" });
    }
});


// GET /usuario/:idUsuario/publicacion/:idPublicacion/estados   Obtener qué tableros del usuario contienen una publicación específica
tableros.get("/usuario/:idUsuario/publicacion/:idPublicacion/estados", async (req, res) => {
  try {
    const { idUsuario, idPublicacion } = req.params;

    const result = await pool.query(`
      SELECT tablero_id 
      FROM tableros_publicaciones tp
      JOIN tableros t ON tp.tablero_id = t.id
      WHERE t.usuario_id = $1 AND tp.publicacion_id = $2
    `, [idUsuario, idPublicacion]);

    res.json(result.rows.map(row => row.tablero_id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al verificar estados de guardado" });
  }
});

// POST /tableros Crear un nuevo tablero 
tableros.post("/", async (req, res) => {
  try {
    const { usuario_id, titulo, etiquetas } = req.body;

    if (!usuario_id || !titulo) {
      return res.status(400).json({ error: "usuario_id y titulo son obligatorios" });
    }

    const existe = await existeUsuarioConId(usuario_id);
    if (!existe) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const result = await pool.query(`
      INSERT INTO tableros (usuario_id, titulo, etiquetas)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [usuario_id, titulo, etiquetas || null]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear tablero" });
  }
});


// POST /tableros/:idTablero/publicaciones Crear una nueva relación entre una publicacion y un tablero
tableros.post("/:idTablero/publicaciones", async (req, res) => {
  try {
    const { idTablero } = req.params;
    const { publicacion_id } = req.body;

    if (!publicacion_id) {
      return res.status(400).json({ error: "publicacion_id requerido" });
    }

    // Verificar tablero
    const tablero = await pool.query(
      "SELECT id FROM tableros WHERE id = $1",
      [idTablero]
    );

    if (!tablero.rowCount) {
      return res.status(404).json({ error: "Tablero no encontrado" });
    }

    // Verificar publicación
    const publicacion = await pool.query(
      "SELECT id FROM publicaciones WHERE id = $1",
      [publicacion_id]
    );

    if (!publicacion.rowCount) {
      return res.status(404).json({ error: "Publicación no encontrada" });
    }

    // Insert relación
    const result = await pool.query(`
      INSERT INTO tableros_publicaciones (tablero_id, publicacion_id)
      VALUES ($1, $2)
      ON CONFLICT (tablero_id, publicacion_id) DO NOTHING
      RETURNING *
    `, [idTablero, publicacion_id]);

    if (!result.rowCount) {
      return res.status(409).json({ error: "La publicación ya está en el tablero" });
    }

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al guardar publicación en tablero" });
  }
});


// PATCH /tableros/:idTablero - Actualizar título y etiquetas de un tablero
tableros.patch("/:idTablero", async (req, res) => {
  try {
    const { idTablero } = req.params;
    const { titulo, etiquetas } = req.body;
    const tableroPrevio = await pool.query(
      "SELECT id FROM tableros WHERE id = $1",
      [idTablero]
    );

    if (tableroPrevio.rowCount === 0) {
      return res.status(404).json({ error: "Tablero no encontrado" });
    }
    const campos = [];
    const valores = [];
    let i = 1;

    if (titulo !== undefined) {
      campos.push(`titulo = $${i++}`);
      valores.push(titulo);
    }

    if (etiquetas !== undefined) {
      campos.push(`etiquetas = $${i++}`);
      valores.push(etiquetas);
    }

    // Si no enviaron nada para actualizar
    if (campos.length === 0) {
      return res.status(400).json({ error: "No se proporcionaron campos para actualizar" });
    }
    campos.push(`fecha_edicion = CURRENT_TIMESTAMP`);
    valores.push(idTablero);
    const query = `
      UPDATE tableros
      SET ${campos.join(", ")}
      WHERE id = $${i}
      RETURNING *
    `;

    const result = await pool.query(query, valores);
    res.status(200).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar el tablero" });
  }
});

// DELETE /tableros/:idTablero/publicaciones/:idPublicacion  Elimina la relación entre una publicacion y un tablero
tableros.delete("/:idTablero/publicaciones/:idPublicacion", async (req, res) => {
  try {
    const { idTablero, idPublicacion } = req.params;

    const result = await pool.query(`
      DELETE FROM tableros_publicaciones
      WHERE tablero_id = $1 AND publicacion_id = $2
      RETURNING *
    `, [idTablero, idPublicacion]);

    if (!result.rowCount) {
      return res.status(404).json({ error: "Relación no encontrada" });
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al quitar publicación del tablero" });
  }
});


// DELETE /tableros/:idTablero  Elimina un tablero
tableros.delete("/:idTablero", async (req, res) => {
  try {
    const { idTablero } = req.params;

    const result = await pool.query(`
      DELETE FROM tableros
      WHERE id = $1
      RETURNING *
    `, [idTablero]);

    if (!result.rowCount) {
      return res.status(404).json({ error: "Tablero no encontrado" });
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar tablero" });
  }
});

export default tableros;
