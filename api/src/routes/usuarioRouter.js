
import express from 'express'
import {pool} from "../db.js";
import * as zod from "zod";

const esquemaUsuario = zod.object({
    nombre: zod.string().regex(regexNombre, ""),
    contrasenia: zod.string().regex(regexContrasenia, ""),
    email: zod.email(""),
    icono: zod.url(""),
    fecha_nacimiento: zod.uint64(""),
    fecha_registro: zod.date(""),
})

async function intentarConseguirUsuarioPorNombre(nombre) {
    const result = await pool.query("SELECT * FROM usuarios WHERE nombre = ?", [nombre])

    if (result.rowCount !== 0)
        return Promise.reject(`No existe usuario con el nombre ${nombre}`)

    return esquemaUsuario.safeParseAsync(result.rows[0])
}

async function intentarConseguirUsuarioPorId(id) {
    const result = await pool.query("SELECT * FROM usuarios WHERE id = ?", [id])

    if (result.rowCount !== 0)
        return Promise.reject(`No existe usuario con la id ${id}`)

    return esquemaUsuario.safeParseAsync(result.rows[0])
}

const usuarioRouter = express.Router()

usuarioRouter.get('/:id',  async (req, res) => {
    try {
        intentarConseguirUsuarioPorId(req.params.id)
            .then( (usuario) => {
                res.status(200).send(usuario)})
            .catch( (err) => {
                console.error(err)
                res.status(404).send({})})

    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
})

usuarioRouter.post('/', async (req, res) => {
    try {
        // TODO:
        //  - validar la unicidad del nombre
        //  - validar la unicidad del email
        //  - validar la validez de la url del icono como imagen
        //  - validar que la fecha de nacimiento sea pasada
        //  - validar la edad del usuario

        console.trace(req.body);

        const usuario = esquemaUsuario.safeParse({
            nombre: req.body.nombre,
            contrasenia: req.body.contrasenia,
            email: req.body.email,
            icono: req.body.icono,
            fecha_nacimiento: req.body.fecha_nacimiento,
            fecha_registro: Date.now()
        })

        if (!usuario.success) {
            // hay errores en la request, ya sea por falta de campos o malformacion de los mismos
            console.error("error:" + usuario.error)
            console.error("error.issues:" + usuario.error.issues)
            res.status(400).json({})
        }

        if ((await intentarConseguirUsuarioPorNombre(usuario.nombre)).success) {
            // ya existe un usuario con ese nombre
            console.error(`ya existe un usuario con el nombre ${usuario.nombre}`)
            res.status(409).json({})
        }

        const result = await pool.query(
            "INSERT INTO usuarios (nombre, contrasenia, email, icono, fecha_nacimiento, fecha_registro) VALUES (?, ?, ?, ?, ?, ?)",
            usuario.data.nombre,
            usuario.data.contrasenia,
            usuario.data.email,
            usuario.data.icono,
            usuario.data.fecha_nacimiento,
            usuario.data.fecha_registro
        ).then(() => {
            res.status(200).json(result.rows);
        }).catch((err) => {
            console.error(err);
            res.status(404).json({})
        })
    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
})

usuarioRouter.patch('/:id', async (req, res) => {
    try {
        intentarConseguirUsuarioPorId(req.params.id)
            .then( (usuario) => {
                res.status(200).send(usuario);})
            .catch( (err) => {
                console.error(err);
                res.status(404).send();})
    } catch (err) {
        console.error(err);
        res.status(500).send()
    }
})

usuarioRouter.delete('/:id', async (req, res) => {
    try {
        const result = await pool.query(
            "DELETE FROM usuarios WHERE id = ?",
            req.params.id
        )

        res.status(200).send()
    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
})

export default usuarioRouter
