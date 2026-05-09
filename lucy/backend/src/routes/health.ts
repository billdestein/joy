import { Router, Request, Response } from 'express'

const router = Router()

router.get('/check', (_req: Request, res: Response) => {
    res.status(200).end()
})

export default router
