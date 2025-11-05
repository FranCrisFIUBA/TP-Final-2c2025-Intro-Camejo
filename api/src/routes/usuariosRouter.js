
import express from 'express'

const usuariosRouter = express.Router()

usuariosRouter.get('/', (req, res) => {
    res.status(501).send()
})

export default usuariosRouter
