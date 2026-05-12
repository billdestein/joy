import { Router, Request, Response } from 'express'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { v4 as uuidv4 } from 'uuid'
import { setSession } from '../session'
import { findOrCreateUser } from '../user'
import { ensureUserDir } from '../fileSystem'

const router = Router()

const COGNITO_REGION = process.env.COGNITO_REGION!
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID!

const jwksUrl = new URL(
    `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}/.well-known/jwks.json`
)
const JWKS = createRemoteJWKSet(jwksUrl)

router.post('/login', async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing authorization header' })
        return
    }
    const idToken = authHeader.slice(7)
    try {
        const { payload } = await jwtVerify(idToken, JWKS, {
            issuer: `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`,
        })
        const email = payload.email as string
        if (!email) {
            res.status(401).json({ error: 'No email in token' })
            return
        }
        const sessionId = uuidv4()
        await setSession(sessionId, email)
        const user = findOrCreateUser(email)
        ensureUserDir(user.slug)
        res.cookie('sessionId', sessionId, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 3600 * 1000,
        })
        res.status(200).end()
    } catch (err) {
        console.error('Login error:', err)
        res.status(401).json({ error: 'Invalid token' })
    }
})

export default router
