import { Request, Response, NextFunction } from 'express'
import { getEmailFromSession } from './session'
import { findOrCreateUser } from './user'

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
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
    res.locals.user = findOrCreateUser(email)
    next()
}
