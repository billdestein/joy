import { Request, Response, NextFunction } from 'express'
import { getEmailFromSession } from './session'
import { findOrCreateUser } from './user'

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    const sessionId = req.cookies?.sessionId
    if (!sessionId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
    }
    const email = await getEmailFromSession(sessionId)
    if (!email) {
        res.status(401).json({ error: 'Unauthorized' })
        return
    }
    res.locals.user = findOrCreateUser(email)
    next()
}
