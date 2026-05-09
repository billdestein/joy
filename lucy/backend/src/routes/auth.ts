import { Router, Request, Response } from 'express'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { v4 as uuidv4 } from 'uuid'
import { setSession } from '../session'
import { findOrCreateUser } from '../user'

const router = Router()

router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader) {
            res.status(401).json({ error: 'Missing authorization header' })
            return
        }

        const idToken = authHeader.replace(/^Bearer\s+/i, '')
        const region = process.env.COGNITO_REGION!
        const userPoolId = process.env.COGNITO_USER_POOL_ID!
        const jwksUrl = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`

        const JWKS = createRemoteJWKSet(new URL(jwksUrl))
        const { payload } = await jwtVerify(idToken, JWKS, {
            issuer: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
        })

        const email = payload.email as string | undefined
        if (!email) {
            res.status(401).json({ error: 'Email not found in token' })
            return
        }

        const sessionId = uuidv4()
        await setSession(sessionId, email)
        findOrCreateUser(email)

        res.cookie('sessionId', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 3600 * 1000,
        })

        res.status(200).end()
    } catch (err) {
        console.error('Login error:', err)
        res.status(401).json({ error: 'Authentication failed' })
    }
})

export default router
