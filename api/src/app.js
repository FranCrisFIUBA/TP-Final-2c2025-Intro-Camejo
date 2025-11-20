
// carga las variables de entorno
import dotenv from 'dotenv'
dotenv.config()

console.log(`NODE_ENV: ${process.env.NODE_ENV}`)

const PORT = process.env.PORT || 3000;

import express from 'express'

import usuarioRouter from "./routes/usuarioRouter.js";
import usuariosRouter from "./routes/usuariosRouter.js";

const app = express()

app.use(express.json()) // parsea a json los cuerpos de las request

app.use("/usuario", usuarioRouter)
app.use("/usuarios", usuariosRouter)

app.listen(PORT, () => {
    console.log(`Api escuchando en el puerto ${PORT}`)
})
