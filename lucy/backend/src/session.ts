import { createClient } from 'redis'

let redisClient: ReturnType<typeof createClient>

export async function initRedis() {
    redisClient = createClient({
        socket: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
        }
    })
    redisClient.on('error', (err) => console.error('Redis error:', err))
    await redisClient.connect()
}

export async function setSession(sessionId: string, email: string) {
    await redisClient.set(sessionId, email, { EX: 3600 })
}

export async function getEmailFromSession(sessionId: string): Promise<string | null> {
    return redisClient.get(sessionId)
}
