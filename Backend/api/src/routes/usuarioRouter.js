import express from 'express';
import { pool } from "../db/connection.js";
import * as zod from "zod";

// Esquema mejorado
const esquemaUsuario = zod.object({
    nombre: zod.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    contrasenia: zod.string().min(5, "La contraseña debe tener al menos 5 caracteres"),
    email: zod.string().email("Email inválido"),
    icono: zod.string().url("URL inválida").optional(),
    fecha_nacimiento: zod.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
    // fecha_registro se genera automáticamente
});

const esquemaActualizacionUsuario = zod.object({
    nombre: zod.string().min(2).optional(),
    email: zod.string().email().optional(),
    icono: zod.string().url().optional(),
    fecha_nacimiento: zod.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "Al menos un campo debe ser proporcionado para actualizar"
});

// Funciones auxiliares (están bien)
async function intentarConseguirUsuarioPorNombre(nombre) {
    const result = await pool.query("SELECT * FROM usuarios WHERE nombre = $1", [nombre]);
    return result.rowCount === 0 ? null : result.rows[0];
}

async function intentarConseguirUsuarioPorId(id) {
    const result = await pool.query("SELECT * FROM usuarios WHERE id = $1", [id]);
    return result.rowCount === 0 ? null : result.rows[0];
}

const usuarioRouter = express.Router();

// GET /usuarios 
usuarioRouter.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM usuarios');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener usuarios" });
    }
});

// GET /usuarios/:id 
usuarioRouter.get('/:id', async (req, res) => {
    try {
        const usuario = await intentarConseguirUsuarioPorId(req.params.id);
        if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
        res.status(200).json(usuario);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener usuario" });
    }
});

// POST /usuarios
usuarioRouter.post('/', async (req, res) => {
    try {
        const parsedUsuario = esquemaUsuario.safeParse(req.body);

        if (!parsedUsuario.success) {
            console.error(parsedUsuario.error.issues);
            return res.status(400).json({ errors: parsedUsuario.error.issues });
        }

        // Validar unicidad del nombre y email
        const existeUsuario = await intentarConseguirUsuarioPorNombre(parsedUsuario.data.nombre);
        if (existeUsuario) {
            return res.status(409).json({ error: "El nombre de usuario ya existe" });
        }

        // Verificar email único
        const emailResult = await pool.query("SELECT * FROM usuarios WHERE email = $1", [parsedUsuario.data.email]);
        if (emailResult.rowCount > 0) {
            return res.status(409).json({ error: "El email ya está registrado" });
        }

        const result = await pool.query(
            `INSERT INTO usuarios 
            (nombre, contrasenia, email, icono, fecha_nacimiento, fecha_registro)
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING *`,
            [
                parsedUsuario.data.nombre,
                parsedUsuario.data.contrasenia,
                parsedUsuario.data.email,
                parsedUsuario.data.icono || null,
                parsedUsuario.data.fecha_nacimiento
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al crear usuario" });
    }
});

// PATCH /usuarios/:id 
usuarioRouter.patch('/:id', async (req, res) => {
    try {
        const usuario = await intentarConseguirUsuarioPorId(req.params.id);
        if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

        const parsedActualizacion = esquemaActualizacionUsuario.safeParse(req.body);
        if (!parsedActualizacion.success) {
            return res.status(400).json({ errors: parsedActualizacion.error.issues });
        }

        // Validar unicidad si se cambia el nombre
        if (parsedActualizacion.data.nombre && parsedActualizacion.data.nombre !== usuario.nombre) {
            const existeUsuario = await intentarConseguirUsuarioPorNombre(parsedActualizacion.data.nombre);
            if (existeUsuario) {
                return res.status(409).json({ error: "El nombre de usuario ya existe" });
            }
        }

        // Validar unicidad si se cambia el email
        if (parsedActualizacion.data.email && parsedActualizacion.data.email !== usuario.email) {
            const emailResult = await pool.query("SELECT * FROM usuarios WHERE email = $1", [parsedActualizacion.data.email]);
            if (emailResult.rowCount > 0) {
                return res.status(409).json({ error: "El email ya está registrado" });
            }
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

        valores.push(req.params.id);
        const query = `UPDATE usuarios SET ${campos.join(', ')} WHERE id = $${contador} RETURNING *`;
        
        const result = await pool.query(query, valores);
        res.status(200).json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al actualizar usuario" });
    }
});

// DELETE /usuarios/:id (está bien)
usuarioRouter.delete('/:id', async (req, res) => {
    try {
        const usuario = await intentarConseguirUsuarioPorId(req.params.id);
        if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

        await pool.query("DELETE FROM usuarios WHERE id = $1", [req.params.id]);
        res.status(200).json({ message: "Usuario eliminado" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al eliminar usuario" });
    }
});

export default usuarioRouter;