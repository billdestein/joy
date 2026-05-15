import { Request, Response, NextFunction } from 'express'
import { redisClient } from '../services/redis'
import { findOrCreateUser } from '../services/users'
import { UserType } from '@billdestein/joy-common'

export interface AuthenticatedRequest extends Request {
    user: UserType
}

export async function sessionMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const sessionId = (req as any).cookies?.['sessionId']
    if (!sessionId) {
        res.status(401).json({ error: 'No session' })
        return
    }

    const email = await redisClient.get(sessionId)
    if (!email) {
        res.status(401).json({ error: 'Session expired or invalid' })
        return
    }

    const user = findOrCreateUser(email)
    ;(req as AuthenticatedRequest).user = user
    next()
}
