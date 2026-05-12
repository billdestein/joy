import { createClient } from 'redis'

const SESSION_TTL = 3600

let redisClient: ReturnType<typeof createClient>

export async function initRedis(host: string, port: number) {
    redisClient = createClient({ socket: { host, port } })
    await redisClient.connect()
}

export async function setSession(sessionId: string, email: string): Promise<void> {
    await redisClient.set(`session:${sessionId}`, email, { EX: SESSION_TTL })
}

export async function getEmailFromSession(sessionId: string): Promise<string | null> {
    return redisClient.get(`session:${sessionId}`)
}
