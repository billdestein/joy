import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getUserEmail } from '../services/cognito'
import { findOrCreateUser } from '../services/user-store'
import { redis, SESSION_TTL } from '../services/redis'

export const authRouter = Router()

authRouter.post('/login', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader) {
            return res.status(401).json({ error: 'Missing authorization header' })
        }

        const accessToken = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : authHeader

        const email = await getUserEmail(accessToken)
        findOrCreateUser(email)

        const sessionId = uuidv4()
        await redis.set(sessionId, email, 'EX', SESSION_TTL)

        res.cookie('sessionId', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: SESSION_TTL * 1000,
        })

        res.status(200).end()
    } catch {
        res.status(401).json({ error: 'Authentication failed' })
    }
})
