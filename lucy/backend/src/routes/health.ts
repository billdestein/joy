import { Router } from 'express'

const router = Router()

router.get('/check', (_, res) => {
    res.status(200).send()
})

export default router
