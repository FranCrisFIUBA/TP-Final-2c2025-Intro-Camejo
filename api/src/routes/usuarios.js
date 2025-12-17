
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

usuarios.get('/:id',  async (req, res) => {
    try {
        intentarConseguirUsuarioPorId(req.params.id)
            .then( (usuario) => {
                res.status(200).send(usuario)})
            .catch( (err) => {
                console.error(err)
                res.status(404).json({ error: "Usuario no encontrado" });})

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error del servidor al obtener usuario" });
    }
})

// POST /usuarios

usuarios.post('/', uploadUsuario.single('icono'), async (req, res) => {
    try {
        const usuarioData = {
            ...req.body,
            fecha_nacimiento: new Date(req.body.fecha_nacimiento),
            fecha_registro: new Date(),
            icono: req.file ? `/iconos/${req.file.filename}` : null
        };

        const usuario = await esquemaUsuario.safeParseAsync(usuarioData);
        if (!usuario.success) {
            return res.status(400).json({ errors: usuario.error.issues });
        }

        // Validar unicidad
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
                usuario.data.icono,
                usuario.data.fecha_nacimiento,
                usuario.data.fecha_registro
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al crear usuario" });
    }
});


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
