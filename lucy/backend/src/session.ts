import { createClient } from 'redis'

let redisClient: ReturnType<typeof createClient>

export async function initRedis(host: string, port: number): Promise<void> {
    redisClient = createClient({ socket: { host, port } })
    await redisClient.connect()
}

export async function setSession(sessionId: string, email: string): Promise<void> {
    await redisClient.set(`session:${sessionId}`, email, { EX: 3600 })
}

export async function getEmailFromSession(sessionId: string): Promise<string | null> {
    return redisClient.get(`session:${sessionId}`)
}
