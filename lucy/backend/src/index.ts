import express from 'express'
import cookieParser from 'cookie-parser'
import { initRedis } from './session'
import { initFileSystem } from './fileSystem'
import authRouter from './routes/auth'
import healthRouter from './routes/health'
import workbooksRouter from './routes/workbooks'

const app = express()

const ORIGIN = process.env.ORIGIN || 'http://localhost:5173'

app.use(express.json({ limit: '50mb' }))
app.use(cookieParser())
app.use((_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', ORIGIN)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    next()
})

app.options('*', (_req, res) => res.status(200).end())

app.use('/v1/auth', authRouter)
app.use('/v1/health', healthRouter)
app.use('/v1/workbooks', workbooksRouter)

async function main() {
    const redisHost = process.env.REDIS_HOST || 'localhost'
    const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10)
    const mountDir = process.env.MOUNT_DIR || '~/lucy-data'

    await initRedis(redisHost, redisPort)
    initFileSystem(mountDir)

    app.listen(8080, () => {
        console.log('Lucy backend listening on port 8080')
    })
}

main().catch(err => {
    console.error('Startup error:', err)
    process.exit(1)
})
