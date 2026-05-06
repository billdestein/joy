import dotenv from 'dotenv'
dotenv.config()

export const config = {
    port: parseInt(process.env.PORT || '3001'),
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    cognitoUserPoolId: process.env.COGNITO_USER_POOL_ID || '',
    cognitoClientId: process.env.COGNITO_CLIENT_ID || '',
    awsRegion: process.env.AWS_REGION || 'us-east-1',
    mountPath: process.env.MOUNT_PATH || './mount',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    sessionCookieName: 'lucy_session',
    sessionTtlSeconds: 3600,
}
