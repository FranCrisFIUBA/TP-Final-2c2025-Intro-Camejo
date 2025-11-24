
// carga las variables de entorno
import dotenv from 'dotenv'
dotenv.config()

console.log(`NODE_ENV: ${process.env.NODE_ENV}`)

const PORT = process.env.PORT || 3000;

import express from 'express'

import usuarioRouter from "./routes/usuarioRouter.js";
import usuariosRouter from "./routes/usuariosRouter.js";

const app = express()

// parsea a json los cuerpos de las request
app.use(express.json())

// realiza logs al llegar una request y al enviarse una response
app.use((req, res, next) => {
    console.debug(`Request: ${req.method} ${req.url}`)
    console.trace(`Request Body: ${req.body}`)

    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        console.debug(`Response: ${req.method} ${req.url} -> ${res.statusCode} (estimate: ${duration}ms)`);
        console.debug(`Response Body: ${req.body}`);
    })

    next()
})

app.use("/usuario", usuarioRouter)
app.use("/usuarios", usuariosRouter)

app.listen(PORT, () => {
    console.log(`Api escuchando en el puerto ${PORT}`)
})
