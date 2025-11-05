
import express from 'express'

const usuarioRouter = express.Router()

usuarioRouter.get('/:id', (req, res) => {
    res.status(501).send()
})

usuarioRouter.post('/', (req, res) => {
    res.status(501).send()
})

usuarioRouter.patch('/:id', (req, res) => {
    res.status(501).send()
})

usuarioRouter.delete('/:id', (req, res) => {
    res.status(501).send()
})

export default usuarioRouter
