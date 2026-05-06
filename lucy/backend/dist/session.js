import { createClient } from 'redis';
const SESSION_TTL_SECONDS = 3600;
const redisClient = createClient({ url: process.env.REDIS_URL ?? 'redis://localhost:6379' });
redisClient.on('error', (err) => console.error('Redis error:', err));
export async function connectRedis() {
    await redisClient.connect();
}
export async function storeSession(sessionId, email) {
    await redisClient.set(`session:${sessionId}`, email, { EX: SESSION_TTL_SECONDS });
}
export async function getEmailFromSession(sessionId) {
    return redisClient.get(`session:${sessionId}`);
}
