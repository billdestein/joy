import { createClient } from 'redis'
import crypto from 'crypto'

let client: ReturnType<typeof createClient>

export async function initRedis(host: string, port: number): Promise<void> {
    client = createClient({ socket: { host, port } })
    await client.connect()
}

export function generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex')
}

export async function setSession(sessionId: string, email: string): Promise<void> {
    await client.set(sessionId, email, { EX: 3600 })
}

export async function getEmailFromSession(sessionId: string): Promise<string | null> {
    return client.get(sessionId)
}
