import { Router, Request, Response } from 'express'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { v4 as uuidv4 } from 'uuid'
import { setSession } from '../session'
import { findOrCreateUser } from '../user'

const router = Router()

router.post('/login', async (req: Request, res: Response): Promise<void> => {
    const auth = req.headers.authorization
    if (!auth?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing authorization header' })
        return
    }
    const token = auth.slice(7)

    try {
        const region = process.env.COGNITO_REGION!
        const poolId = process.env.COGNITO_USER_POOL_ID!
        const jwksUrl = `https://cognito-idp.${region}.amazonaws.com/${poolId}/.well-known/jwks.json`
        const JWKS = createRemoteJWKSet(new URL(jwksUrl))

        const { payload } = await jwtVerify(token, JWKS)
        const email = payload['email'] as string
        if (!email) {
            res.status(401).json({ error: 'No email in token' })
            return
        }

        findOrCreateUser(email)

        const sessionId = uuidv4()
        await setSession(sessionId, email)

        res.cookie('session_id', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 3600 * 1000,
        })

        res.status(200).send()
    } catch (err) {
        console.error('Login error:', err)
        res.status(401).json({ error: 'Invalid token' })
    }
})

export default router
