import { createClient } from 'redis'

const client = createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
})

client.on('error', (err) => console.error('Redis error:', err))

export async function connectRedis(): Promise<void> {
    await client.connect()
}

export async function setSession(sessionId: string, email: string): Promise<void> {
    await client.set(`session:${sessionId}`, email, { EX: 3600 })
}

export async function getSession(sessionId: string): Promise<string | null> {
    return client.get(`session:${sessionId}`)
}
