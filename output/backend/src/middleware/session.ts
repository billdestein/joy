import { Request, Response, NextFunction } from 'express'
import { redis } from '../services/redis'
import { findOrCreateUser } from '../services/user-store'

declare global {
    namespace Express {
        interface Request {
            user?: { email: string; slug: string }
        }
    }
}

export async function sessionMiddleware(req: Request, res: Response, next: NextFunction) {
    const sessionId = req.cookies?.sessionId
    if (!sessionId) {
        return res.status(401).json({ error: 'Unauthorized' })
    }
    const email = await redis.get(sessionId)
    if (!email) {
        return res.status(401).json({ error: 'Session expired' })
    }
    req.user = findOrCreateUser(email)
    next()
}
