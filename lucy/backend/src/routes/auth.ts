import { Router, Request, Response } from 'express'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { v4 as uuidv4 } from 'uuid'
import { setSession } from '../session'
import { findOrCreateUser } from '../user'

const router = Router()

const jwksUrl = () =>
    new URL(`https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`)

router.post('/login', async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing authorization header' })
        return
    }
    const idToken = authHeader.slice(7)
    try {
        const JWKS = createRemoteJWKSet(jwksUrl())
        const { payload } = await jwtVerify(idToken, JWKS)
        const email = payload.email as string
        if (!email) {
            res.status(401).json({ error: 'No email in token' })
            return
        }
        findOrCreateUser(email)
        const sessionId = uuidv4()
        await setSession(sessionId, email)
        res.cookie('sessionId', sessionId, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 3600 * 1000,
        })
        res.status(200).end()
    } catch (err) {
        console.error('Login error:', err)
        res.status(401).json({ error: 'Invalid token' })
    }
})

export default router
