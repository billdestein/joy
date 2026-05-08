import { Request, Response, NextFunction } from 'express'
import { getEmailFromSession } from './session'
import { findOrCreateUser, User } from './user'

declare global {
    namespace Express {
        interface Request {
            user?: User
        }
    }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
    const sessionId = req.cookies['session_id']
    if (!sessionId) {
        res.status(401).json({ error: 'Not authenticated' })
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
