import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider'
import { config } from '../config'

const cognitoClient = new CognitoIdentityProviderClient({ region: config.awsRegion })

export async function getUserEmail(accessToken: string): Promise<string> {
    const command = new GetUserCommand({ AccessToken: accessToken })
    const response = await cognitoClient.send(command)
    const emailAttr = response.UserAttributes?.find(attr => attr.Name === 'email')
    if (!emailAttr?.Value) {
        throw new Error('Email not found in Cognito user attributes')
    }
    return emailAttr.Value
}
