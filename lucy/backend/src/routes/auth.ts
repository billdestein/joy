import { Router } from 'express'
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider'
import { v4 as uuidv4 } from 'uuid'
import { storeSession } from '../session.js'
import { findOrCreateUser } from '../user.js'
import { ensureUserDir } from '../fileSystem.js'

export const authRouter = Router()

const cognitoClient = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION ?? 'us-east-1',
})

authRouter.post('/login', async (req, res) => {
    const authHeader = req.headers['authorization']
    if (!authHeader?.startsWith('Bearer ')) {
        res.sendStatus(401)
        return
    }
    const accessToken = authHeader.slice(7)

    const cognitoResponse = await cognitoClient.send(new GetUserCommand({ AccessToken: accessToken }))
    const email = cognitoResponse.UserAttributes?.find((a) => a.Name === 'email')?.Value
    if (!email) {
        res.sendStatus(401)
        return
    }

    const sessionId = uuidv4()
    await storeSession(sessionId, email)

    const user = findOrCreateUser(email)
    await ensureUserDir(user.slug)

    res.cookie('sessionId', sessionId, { httpOnly: true })
    res.sendStatus(200)
})
