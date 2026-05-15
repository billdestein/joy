import { Router } from 'express'

const router = Router()

router.get('/check', (_req, res) => {
    res.status(200).end()
})

export default router
