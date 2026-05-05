import { Router } from 'express'

export const healthRouter = Router()

healthRouter.get('/check', (_req, res) => {
    res.status(200).end()
})
