import { Request, Response, NextFunction } from 'express'
import { UserType } from '@billdestein/lucy-common'
import { getEmailFromSession } from '../services/redis'
import { findOrCreateUser } from '../services/user-store'
import { config } from '../config'

declare global {
    namespace Express {
        interface Request {
            user?: UserType
        }
    }
}

export async function sessionMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    const sessionId = req.cookies?.[config.sessionCookieName]
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
