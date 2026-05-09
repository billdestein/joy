import { createClient } from 'redis'

const SESSION_TTL = 3600

type RedisClient = ReturnType<typeof createClient>
let redisClient: RedisClient

export async function initRedis(): Promise<void> {
    const host = process.env.REDIS_HOST || 'localhost'
    const port = parseInt(process.env.REDIS_PORT || '6379', 10)

    redisClient = createClient({ socket: { host, port } })
    redisClient.on('error', (err) => console.error('Redis error:', err))
    await redisClient.connect()
}

export async function setSession(sessionId: string, email: string): Promise<void> {
    await redisClient.setEx(sessionId, SESSION_TTL, email)
}

export async function getEmailFromSession(sessionId: string): Promise<string | null> {
    return redisClient.get(sessionId)
}
