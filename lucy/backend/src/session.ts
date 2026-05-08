import { createClient } from 'redis'

let redisClient: ReturnType<typeof createClient>

export async function initRedis() {
    redisClient = createClient({
        socket: {
            host: process.env.REDIS_HOST!,
            port: parseInt(process.env.REDIS_PORT!)
        }
    })
    await redisClient.connect()
}

export async function storeSession(sessionId: string, email: string) {
    await redisClient.set(`session:${sessionId}`, email, { EX: 3600 })
}

export async function getEmailFromSession(sessionId: string): Promise<string | null> {
    return redisClient.get(`session:${sessionId}`)
}
