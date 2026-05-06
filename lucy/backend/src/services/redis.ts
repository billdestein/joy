import { createClient } from 'redis'
import { config } from '../config'

const redisClient = createClient({ url: config.redisUrl })

redisClient.on('error', (err) => console.error('Redis error:', err))

export async function connect(): Promise<void> {
    await redisClient.connect()
}

export async function setSession(sessionId: string, email: string): Promise<void> {
    await redisClient.set(`session:${sessionId}`, email, { EX: config.sessionTtlSeconds })
}

export async function getEmailFromSession(sessionId: string): Promise<string | null> {
    return redisClient.get(`session:${sessionId}`)
}
