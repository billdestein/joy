import { Request, Response, NextFunction } from 'express'
import { getEmailFromSession } from './session'
import { findOrCreateUser } from './user'
import { UserType } from '@billdestein/joy-common'

declare global {
    namespace Express {
        interface Request {
            user?: UserType
        }
    }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    const sessionId = req.cookies?.sessionId
    if (!sessionId) {
        res.status(401).json({ error: 'No session' })
        return
    }
    const email = await getEmailFromSession(sessionId)
    if (!email) {
        res.status(401).json({ error: 'Invalid or expired session' })
        return
    }
    req.user = findOrCreateUser(email)
    next()
}
