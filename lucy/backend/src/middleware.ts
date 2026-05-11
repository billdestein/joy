import { Request, Response, NextFunction } from 'express'
import { getEmailFromSession } from './session'
import { findOrCreateUser, User } from './user'

export interface AuthRequest extends Request {
    user?: User
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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
