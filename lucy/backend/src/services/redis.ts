import { createClient } from 'redis'
import { config } from '../config'

export const redisClient = createClient({
    socket: {
        host: config.redisHost,
        port: config.redisPort,
    },
})

redisClient.on('error', (err) => console.error('Redis error:', err))

export async function initRedis(): Promise<void> {
    await redisClient.connect()
}
