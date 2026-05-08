import { Router } from 'express'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { generateSessionId, setSession } from '../session'
import { findOrCreateUser } from '../user'

const router = Router()

// Lazily initialized so env vars are read after startup
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null
function getJwks() {
    if (!jwks) {
        const url = `https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`
        jwks = createRemoteJWKSet(new URL(url))
    }
    return jwks
}

router.post('/login', async (req, res) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader) {
            res.status(401).json({ error: 'Missing authorization header' })
            return
        }
        const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader

        const { payload } = await jwtVerify(idToken, getJwks())
        const email = payload.email as string | undefined
        if (!email) {
            res.status(401).json({ error: 'No email claim in token' })
            return
        }

        findOrCreateUser(email)
        const sessionId = generateSessionId()
        await setSession(sessionId, email)

        res.cookie('sessionId', sessionId, { httpOnly: true, maxAge: 3600000 })
        res.json({})
    } catch (err) {
        console.error('Login error:', err)
        const message = err instanceof Error ? err.message : String(err)
        res.status(401).json({ error: 'Authentication failed', detail: message })
    }
})

export default router
