import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getEmailFromAccessToken } from '../services/cognito'
import { setSession } from '../services/redis'
import { findOrCreateUser } from '../services/user-store'
import { config } from '../config'

const router = Router()

router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader) {
            res.status(401).json({ error: 'Missing authorization header' })
            return
        }

        const accessToken = authHeader.replace(/^Bearer\s+/i, '')
        const email = await getEmailFromAccessToken(accessToken)

        const sessionId = uuidv4()
        await setSession(sessionId, email)
        findOrCreateUser(email)

        res.cookie(config.sessionCookieName, sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: config.sessionTtlSeconds * 1000,
            sameSite: 'strict',
        })

        res.status(200).end()
    } catch (err) {
        console.error('Login error:', err)
        res.status(401).json({ error: 'Authentication failed' })
    }
})

export default router
