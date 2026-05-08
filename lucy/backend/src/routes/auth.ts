import { Router } from 'express'
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider'
import { randomUUID } from 'crypto'
import { storeSession } from '../session'
import { findOrCreateUser } from '../user'

const router = Router()

const cognitoClient = new CognitoIdentityProviderClient({
    region: process.env.COGNITO_REGION
})

router.post('/login', async (req, res) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader?.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Missing authorization header' })
            return
        }
        const accessToken = authHeader.substring(7)

        const response = await cognitoClient.send(new GetUserCommand({ AccessToken: accessToken }))
        const emailAttr = response.UserAttributes?.find(a => a.Name === 'email')
        if (!emailAttr?.Value) {
            res.status(401).json({ error: 'Could not get email from token' })
            return
        }

        const email = emailAttr.Value
        findOrCreateUser(email)

        const sessionId = randomUUID()
        await storeSession(sessionId, email)

        res.cookie('session_id', sessionId, {
            httpOnly: true,
            secure: false,
            maxAge: 3600 * 1000
        })
        res.status(200).send()
    } catch {
        res.status(401).json({ error: 'Authentication failed' })
    }
})

export default router
