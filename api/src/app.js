
import express from 'express'

import usuarioRouter from "./routes/usuarioRouter.js";
import usuariosRouter from "./routes/usuariosRouter.js";

const PORT = 3000
const app = express()

app.use(express.json()) // parsea a json los cuerpos de las request

app.use("/usuario", usuarioRouter)
app.use("/usuarios", usuariosRouter)

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})
