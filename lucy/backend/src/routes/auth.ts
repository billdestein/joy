import { Router, Request, Response } from 'express'
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider'
import { createSession } from '../session'
import { findOrCreateUser } from '../user'

const router = Router()
const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.COGNITO_REGION! })

router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader) {
            res.status(401).json({ error: 'Missing authorization header' })
            return
        }
        const token = authHeader.replace(/^Bearer\s+/i, '')
        const command = new GetUserCommand({ AccessToken: token })
        const cognitoResponse = await cognitoClient.send(command)
        const email = cognitoResponse.UserAttributes?.find(a => a.Name === 'email')?.Value
        if (!email) {
            res.status(401).json({ error: 'Could not retrieve email from token' })
            return
        }
        findOrCreateUser(email)
        const sessionId = await createSession(email)
        res.cookie('sessionId', sessionId, { httpOnly: true, sameSite: 'lax' })
        res.status(200).end()
    } catch {
        res.status(401).json({ error: 'Invalid token' })
    }
})

export default router
