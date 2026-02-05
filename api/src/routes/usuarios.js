
import express from 'express'
import {pool} from "../db.js";
import {
    actualizarUsuarioPorId, intentarConseguirUsuarioPorId,
    existeUsuarioConEmail,
    existeUsuarioConId, existeUsuarioConNombre
} from "../utils/database/usuarios.js";
import {esquemaActualizacionUsuario, esquemaPostUsuario} from "../utils/esquemas/usuarios.js";
import {deleteFile, getFileUrl, iconoUsuarioUpload, USE_S3} from "../middlewares/storage.js";
import multer from "multer";
import {elimiarIconoUsuarioPorId} from "../utils/storage/usuarios.js";

const usuarios = express.Router()

// GET /usuarios
usuarios.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM usuarios');

        // Mapear URLs de iconos según storage dinámico
        const usuariosConIconos = result.rows.map(u => ({
            ...u,
            icono: u.icono ? getFileUrl(u.icono, "iconos") : null
        }));

        res.status(200).json(usuariosConIconos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error del servidor al obtener usuarios" });
    }
});

// GET /usuarios/:id
usuarios.get('/:id', async (req, res) => {
    try {
        intentarConseguirUsuarioPorId(req.params.id)
            .then((usuario) => {
                if (usuario.icono) {
                    usuario.icono = getFileUrl(usuario.icono, 'iconos');
                }
                res.status(200).send(usuario);
            })
            .catch((err) => {
                console.error(err);
                res.status(404).json({ error: "Usuario no encontrado" });
            });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error del servidor al obtener usuario" });
    }
});

// POST /usuarios
usuarios.post('/',
    (req, res, next) => {
        iconoUsuarioUpload.single('icono')(req, res, function(err) {
            if (err instanceof multer.MulterError ) {
                return res.status(400).json({ error: err.message });
            } else if (err) {
                return res.status(500).json({ error: "Error en la subida de archivo" });
            }
            next();
        });
    },
    async (req, res) => {
        try {
            const usuarioData = {
                nombre: req.body.nombre,
                contrasenia: req.body.contrasenia,
                email: req.body.email,
                fecha_nacimiento: new Date(req.body.fecha_nacimiento),
                fecha_registro: new Date(),
                icono: req.file ? (USE_S3 ? req.file.key : req.file.filename) : null
            };

            const usuario = await esquemaPostUsuario.safeParseAsync(usuarioData);
            if (!usuario.success) {
                return res.status(400).json({ errors: usuario.error.issues });
            }

            if (await existeUsuarioConNombre(usuario.data.nombre)) {
                return res.status(409).json({ error: "El nombre de usuario ya existe" });
            }
            if (await existeUsuarioConEmail(usuario.data.email)) {
                return res.status(409).json({ error: "El email ya está registrado" });
            }

            const result = await pool.query(
                `INSERT INTO usuarios
                     (nombre, contrasenia, email, icono, fecha_nacimiento, fecha_registro)
                 VALUES ($1, $2, $3, $4, $5, $6)
                     RETURNING *`,
                [
                    usuario.data.nombre,
                    usuario.data.contrasenia,
                    usuario.data.email,
                    req.file ? req.file.filename : null, // almacenar solo el filename/path en DB
                    usuario.data.fecha_nacimiento,
                    usuario.data.fecha_registro
                ]
            );

            const responseUsuario = result.rows[0];
            if (responseUsuario.icono) {
                responseUsuario.icono = await getFileUrl(responseUsuario.icono, "iconos");
            }

            res.status(201).json(responseUsuario);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Error al crear usuario" });
        }
    });

// PATCH /usuarios/:id
usuarios.patch(
    '/:id',
    (req, res, next) => {
        iconoUsuarioUpload.single('icono')(req, res, function (err) {
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
            const id = Number(req.params.id);

            if (Number.isNaN(id)) {
                return res.status(400).json({
                    errors: [{ path: ['id'], message: 'Id de usuario invalido' }]
                });
            }

            const usuario = await intentarConseguirUsuarioPorId(id);
            if (!usuario.success) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            const datosActualizados = {
                ...req.body,
                id,
                icono: req.file ? req.file.filename : usuario.data.icono
            };

            const actualizacion = await esquemaActualizacionUsuario.safeParseAsync(datosActualizados);
            if (!actualizacion.success) {
                return res.status(400).json({ errors: actualizacion.error.issues });
            }

            // Validar unicidad nombre
            if (
                actualizacion.data.nombre !== undefined &&
                actualizacion.data.nombre !== usuario.data.nombre
            ) {
                if (await existeUsuarioConNombre(actualizacion.data.nombre)) {
                    return res.status(409).json({ error: "El nombre de usuario ya existe" });
                }
            }

            // Validar unicidad email
            if (
                actualizacion.data.email !== undefined &&
                actualizacion.data.email !== usuario.data.email
            ) {
                if (await existeUsuarioConEmail(actualizacion.data.email)) {
                    return res.status(409).json({ error: "El email ya está registrado" });
                }
            }

            // Si hay icono nuevo, eliminar el anterior
            if (req.file && usuario.data.icono) {
                await elimiarIconoUsuarioPorId(usuario.data.id);
            }

            const result = await actualizarUsuarioPorId(
                id,
                actualizacion.data.nombre,
                actualizacion.data.contrasenia,
                actualizacion.data.email,
                actualizacion.data.icono
            );

            if (result.rowCount !== 1) {
                return res.status(404).send({});
            }

            const usuarioActualizado = result.rows[0];
            if (usuarioActualizado.icono) {
                usuarioActualizado.icono = getFileUrl(usuarioActualizado.icono, "iconos");
            }

            res.status(200).json(usuarioActualizado);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Error al actualizar usuario" });
        }
    }
);

// DELETE /usuarios/:id
usuarios.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (await existeUsuarioConId(id) !== true)
            return res.status(404).json({ error: "Usuario no encontrado" });

        // Obtener usuario para saber el nombre/path del icono
        const usuario = await intentarConseguirUsuarioPorId(id);
        if (usuario.success && usuario.data.icono) {
            await deleteFile(usuario.data.icono); // elimina icono local o en S3 según storage
        }

        await pool.query(
            "DELETE FROM usuarios WHERE id = $1",
            [id]
        );

        res.status(200).json({ message: "Usuario eliminado" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al eliminar usuario" });
    }
});

export default usuarios