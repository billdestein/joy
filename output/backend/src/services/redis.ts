import Redis from 'ioredis'
import { config } from '../config'

export const redis = new Redis(config.redisUrl)

export const SESSION_TTL = 60 * 60 // 1 hour in seconds
