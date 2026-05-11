import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { initRedis } from './session'
import { requireAuth } from './middleware'
import authRouter from './routes/auth'
import healthRouter from './routes/health'
import workbooksRouter from './routes/workbooks'

const app = express()

app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

app.use('/v1/auth', authRouter)
app.use('/v1/health', healthRouter)
app.use('/v1/workbooks', requireAuth, workbooksRouter)

async function main() {
    const mountDir = (process.env.MOUNT_DIR ?? '').replace(/^~/, os.homedir())
    fs.mkdirSync(path.join(mountDir, 'users'), { recursive: true })

    const redisHost = process.env.REDIS_HOST!
    const redisPort = parseInt(process.env.REDIS_PORT!, 10)
    await initRedis(redisHost, redisPort)
    app.listen(8080, () => {
        console.log('Backend listening on port 8080')
    })
}

main().catch(err => {
    console.error('Failed to start:', err)
    process.exit(1)
})
