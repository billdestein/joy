import { Request, Response, NextFunction } from 'express'
import { UserType } from '@billdestein/joy-common'
import { getEmailFromSession } from './session'
import { findOrCreateUser } from './user'

declare global {
    namespace Express {
        interface Request {
            user?: UserType
        }
    }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
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
    req.user = findOrCreateUser(email)
    next()
}
