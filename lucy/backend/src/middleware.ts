import { Request, Response, NextFunction } from 'express'
import { getEmailFromSession } from './session'
import { findOrCreateUser } from './user'

declare global {
    namespace Express {
        interface Request {
            user?: { email: string; slug: string }
        }
    }
}

export async function sessionMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    const sessionId = req.cookies?.sessionId
    if (!sessionId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
    }
    const email = await getEmailFromSession(sessionId)
    if (!email) {
        res.status(401).json({ error: 'Session expired' })
        return
    }
    req.user = findOrCreateUser(email)
    next()
}
