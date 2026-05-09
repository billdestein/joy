import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { connectRedis } from './session'
import { sessionMiddleware } from './middleware'
import authRouter from './routes/auth'
import healthRouter from './routes/health'
import workbooksRouter from './routes/workbooks'

const app = express()
const PORT = 8080

app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

app.use('/v1/auth', authRouter)
app.use('/v1/health', healthRouter)
app.use('/v1/workbooks', sessionMiddleware, workbooksRouter)

async function start() {
    await connectRedis()
    app.listen(PORT, () => {
        console.log(`Backend listening on port ${PORT}`)
    })
}

start().catch(console.error)
