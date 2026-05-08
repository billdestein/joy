import { createClient } from 'redis'
import { v4 as uuidv4 } from 'uuid'

const SESSION_TTL_SECONDS = 3600

let redisClient: ReturnType<typeof createClient>

export async function initRedis(): Promise<void> {
    redisClient = createClient({
        socket: {
            host: process.env.REDIS_HOST!,
            port: parseInt(process.env.REDIS_PORT!, 10),
        },
    })
    await redisClient.connect()
}

export async function createSession(email: string): Promise<string> {
    const sessionId = uuidv4()
    await redisClient.set(sessionId, email, { EX: SESSION_TTL_SECONDS })
    return sessionId
}

export async function getEmailFromSession(sessionId: string): Promise<string | null> {
    return redisClient.get(sessionId)
}
