
import express from 'express'

const usuarioRouter = express.Router()

usuarioRouter.get('/:id',  async (req, res) => {
    res.status(501).send()
})

usuarioRouter.post('/', async (req, res) => {
    res.status(501).send()
})

usuarioRouter.patch('/:id', async (req, res) => {
    res.status(501).send()
})

usuarioRouter.delete('/:id', async (req, res) => {
    res.status(501).send()
})

export default usuarioRouter
