import dotenv from 'dotenv'
dotenv.config()

export const config = {
    port: parseInt(process.env.PORT || '3000'),
    awsRegion: process.env.AWS_REGION || 'us-east-1',
    cognitoUserPoolId: process.env.COGNITO_USER_POOL_ID || '',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    mountDir: process.env.MOUNT_DIR || './mount',
}
