import { Request, Response, NextFunction } from 'express'
import { getSession } from './session'
import { findOrCreateUser, User } from './user'

export interface AuthenticatedRequest extends Request {
    user: User
}

export async function sessionMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    const sessionId = req.cookies?.['session_id']
    if (!sessionId) {
        res.status(401).json({ error: 'Not authenticated' })
        return
    }
    const email = await getSession(sessionId)
    if (!email) {
        res.status(401).json({ error: 'Session expired' })
        return
    }
    ;(req as AuthenticatedRequest).user = findOrCreateUser(email)
    next()
}
