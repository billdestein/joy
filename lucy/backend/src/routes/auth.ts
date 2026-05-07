import { Router, Request, Response } from 'express'
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider'
import { v4 as uuidv4 } from 'uuid'
import { setSession } from '../session'
import { findOrCreateUser } from '../user'

export const authRouter = Router()

authRouter.post('/login', async (req: Request, res: Response) => {
    const authHeader = req.headers['authorization']
    if (!authHeader) {
        res.sendStatus(401)
        return
    }

    const accessToken = authHeader.replace(/^Bearer\s+/i, '')

    const cognitoClient = new CognitoIdentityProviderClient({
        region: process.env.COGNITO_REGION,
    })

    const userResponse = await cognitoClient.send(new GetUserCommand({ AccessToken: accessToken }))
    const emailAttr = userResponse.UserAttributes?.find(a => a.Name === 'email')
    if (!emailAttr?.Value) {
        res.sendStatus(401)
        return
    }

    const email = emailAttr.Value
    findOrCreateUser(email)

    const sessionId = uuidv4()
    await setSession(sessionId, email)

    res.cookie('sessionId', sessionId, { httpOnly: true, sameSite: 'strict' })
    res.sendStatus(200)
})
