import os from 'os'

function required(name: string): string {
    const val = process.env[name]
    if (!val) throw new Error(`Missing required env var: ${name}`)
    return val
}

function expandTilde(p: string): string {
    if (p.startsWith('~')) return os.homedir() + p.slice(1)
    return p
}

export const config = {
    cognitoRegion: required('COGNITO_REGION'),
    cognitoUserPoolId: required('COGNITO_USER_POOL_ID'),
    googleApiKey: required('GOOGLE_API_KEY'),
    mountDir: expandTilde(required('MOUNT_DIR')),
    origin: required('ORIGIN'),
    redisHost: required('REDIS_HOST'),
    redisPort: parseInt(required('REDIS_PORT'), 10),
}
