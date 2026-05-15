import { Router, Request, Response } from 'express'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { randomUUID } from 'crypto'
import fs from 'fs'
import path from 'path'
import { config } from '../config'
import { redisClient } from '../services/redis'
import { findOrCreateUser } from '../services/users'

const router = Router()

const jwksUrl = `https://cognito-idp.${config.cognitoRegion}.amazonaws.com/${config.cognitoUserPoolId}/.well-known/jwks.json`
const JWKS = createRemoteJWKSet(new URL(jwksUrl))

router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const authHeader = req.headers['authorization'] ?? ''
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader

        if (!token) {
            res.status(401).json({ error: 'Missing authorization token' })
            return
        }

        const { payload } = await jwtVerify(token, JWKS)
        const email = payload['email'] as string
        if (!email) {
            res.status(401).json({ error: 'Token missing email claim' })
            return
        }

        const sessionId = randomUUID()
        await redisClient.set(sessionId, email, { EX: 3600 })

        res.cookie('sessionId', sessionId, {
            httpOnly: true,
            maxAge: 3600 * 1000,
            sameSite: 'lax',
        })

        const user = findOrCreateUser(email)

        const workbooksDir = path.join(config.mountDir, 'users', user.slug, 'workbooks')
        fs.mkdirSync(workbooksDir, { recursive: true })

        res.status(200).end()
    } catch (err: any) {
        console.error('Login error:', err)
        res.status(401).json({ error: err.message ?? 'Authentication failed' })
    }
})

export default router
