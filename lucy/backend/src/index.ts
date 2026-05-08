import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { initRedis } from './session'
import authRouter from './routes/auth'
import healthRouter from './routes/health'
import workbooksRouter from './routes/workbooks'

const app = express()

app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

app.use('/v1/auth', authRouter)
app.use('/v1/health', healthRouter)
app.use('/v1/workbooks', workbooksRouter)

async function start() {
    await initRedis()
    app.listen(8080, () => {
        console.log('Backend listening on port 8080')
    })
}

start().catch(err => {
    console.error('Failed to start:', err)
    process.exit(1)
})
