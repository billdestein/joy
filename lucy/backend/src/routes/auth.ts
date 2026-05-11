import { Router, Request, Response } from 'express'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { v4 as uuidv4 } from 'uuid'
import { setSession } from '../session'
import { findOrCreateUser } from '../user'
import { ensureUserRootDir } from '../fileSystem'

const router = Router()

router.post('/login', async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing authorization header' })
        return
    }
    const idToken = authHeader.slice(7)

    const region = process.env.COGNITO_REGION!
    const userPoolId = process.env.COGNITO_USER_POOL_ID!
    const jwksUrl = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`

    let email: string
    try {
        const JWKS = createRemoteJWKSet(new URL(jwksUrl))
        const { payload } = await jwtVerify(idToken, JWKS)
        email = payload['email'] as string
        if (!email) {
            res.status(401).json({ error: 'No email in token' })
            return
        }
    } catch (err) {
        console.error('JWT verification failed:', err)
        res.status(401).json({ error: 'Invalid token' })
        return
    }

    const user = findOrCreateUser(email)
    ensureUserRootDir(user.slug)

    const sessionId = uuidv4()
    await setSession(sessionId, email)

    res.cookie('sessionId', sessionId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    })
    res.status(200).end()
})

export default router
