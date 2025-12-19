
import express from 'express'
import {pool} from "../db.js";
import {
    actualizarUsuarioPorId, intentarConseguirUsuarioPorEmail,
    intentarConseguirUsuarioPorId,
    intentarConseguirUsuarioPorNombre, existeUsuarioConEmail,
    existeUsuarioConId, existeUsuarioConNombre
} from "../utils/database/usuarios.js";
import {esquemaActualizacionUsuario, esquemaUsuario} from "../utils/esquemas/usuarios.js";

const usuarios = express.Router()

// GET /usuarios

usuarios.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM usuarios');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error del servidor al obtener usuarios" });
    }
})

// GET /usuarios/:id

usuarios.get('/:id', async (req, res) => {
    const { id } = req.params; // Extraemos el ID de la URL
    
    try {
        // Usamos await para esperar el resultado de tu función de búsqueda
        const usuario = await intentarConseguirUsuarioPorId(id);

        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        // Si el usuario existe, lo enviamos
        res.status(200).json(usuario);

    } catch (err) {
        console.error("Error al obtener usuario por ID:", err);
        res.status(500).json({ error: "Error del servidor al obtener usuario" });
    }
});

// POST /usuarios

usuarios.post('/', async (req, res) => {
    try {
        // TODO:
        //  - validar la validez de la url del icono como imagen
        //  - validar que la fecha de nacimiento sea pasada
        //  - validar la edad del usuario

        const usuario = await esquemaUsuario.safeParseAsync({ ...req.body, fecha_registro: Date.now() })
        if (!usuario.success) {
            // hay errores en la request, ya sea por falta de campos o malformacion de los mismos
            console.error("error.issues:" + usuario.error.issues)
            res.status(400).json({ errors: usuario.error.issues })
            return;
        }

        // Validar unicidad del nombre y email

        const existeNombre = existeUsuarioConNombre(usuario.data.nombre);
        const existeEmail = existeUsuarioConEmail(usuario.data.email);

        if (await existeNombre) {
            console.error(`ya existe un usuario con el nombre ${usuario.data.nombre}`)
            res.status(409).json({ error: "El nombre de usuario ya existe" });
            return;
        }

        if (await existeEmail) {
            console.error(`Ya existe un usuario con el email ${existeEmail}`)
            res.status(409).json({ error: "El email ya está registrado" });
            return;
        }

        const result = await pool.query(
            "INSERT INTO usuarios (nombre, contrasenia, email, icono, fecha_nacimiento, fecha_registro) VALUES (?, ?, ?, ?, ?, ?) RETURNING *",
            usuario.data.nombre,
            usuario.data.contrasenia,
            usuario.data.email,
            usuario.data.icono || null,
            usuario.data.fecha_nacimiento,
            usuario.data.fecha_registro,
            usuario.data.fecha_registro,
        ).then(() => {
            res.status(200).json(result.rows[0]);
        }).catch((err) => {
            console.error(err);
            res.status(404).json({})
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al crear usuario" });
    }
})

// PATCH /usuarios/:id

usuarios.patch('/:id', async (req, res) => {
    try {
        const usuario = await intentarConseguirUsuarioPorId(req.params.id);
        if (!usuario.success) {
            console.error("error.issues:" + usuario.error.issues)
            return res.status(404).json({error: "Usuario no encontrado"});
        }

        const actualizacion = await esquemaActualizacionUsuario.safeParseAsync({ ...req.body, id: req.params.id });
        if (!actualizacion.success) {
            console.error("error.issues:" + usuario.error.issues)
            res.status(404).json({errors: usuario.error.issues});
        }

        // Validar unicidad si se cambia el nombre
        if (actualizacion.data.nombre !== undefined && actualizacion.data.nombre !== usuario.data.nombre) {
            if (await intentarConseguirUsuarioPorNombre(actualizacion.data.nombre)) {
                console.error(`ya existe un usuario con el nombre ${usuario.data.nombre}`)
                res.status(409).json({ error: "El nombre de usuario ya existe" });
                return;
            }
        }

        // Validar unicidad si se cambia el email
        if (actualizacion.data.email !== undefined && actualizacion.data.email !== usuario.data.email) {
            if (await existeUsuarioConEmail(usuario.data.email)) {
                console.error(`Ya existe un usuario con el email ${existeEmail}`)
                res.status(409).json({ error: "El email ya está registrado" });
                return;
            }
        }

        actualizarUsuarioPorId(req.params.id, req.body.nombre, req.body.contrasenia, req.body.email, req.body.icono)
            .then( (queryResponse) => {
                if (queryResponse.rowCount !== 1) {
                    res.status(404).send({}) // no encontrado
                } else {
                    res.status(200).send(queryResponse.rows[0]) // se devuelven los cambios
                }
            }).catch( (err) => { // se ha pasado una cantidad invalida de parametros
                console.error(err);
                res.status(400).send();
            })
    } catch (err) {
        console.error(err);
        res.status(500).send()
    }
})

// DELETE /usuarios/:id

usuarios.delete('/:id', async (req, res) => {
    try {
        if (await existeUsuarioConId(req.params.id) !== true)
            return res.status(404).json({ error: "Usuario no encontrado" });

        await pool.query(
            "DELETE FROM usuarios WHERE id = $1",
            req.params.id
        );

        res.status(200).json({ message: "Usuario eliminado" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al eliminar usuario" });
    }
})

export default usuarios
