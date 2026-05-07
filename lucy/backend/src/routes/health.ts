import { Router, Request, Response } from 'express'

export const healthRouter = Router()

healthRouter.get('/check', (_req: Request, res: Response) => {
    res.sendStatus(200)
})
