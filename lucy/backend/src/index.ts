import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { initRedis } from './session'
import authRouter from './routes/auth'
import healthRouter from './routes/health'
import workbooksRouter from './routes/workbooks'

const app = express()
const PORT = 8080

app.use(cors({
    origin: process.env.ORIGIN || 'http://localhost:5173',
    credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

app.use('/v1/auth', authRouter)
app.use('/v1/health', healthRouter)
app.use('/v1/workbooks', workbooksRouter)

async function main(): Promise<void> {
    await initRedis()
    app.listen(PORT, () => console.log(`Lucy backend listening on port ${PORT}`))
}

main().catch(console.error)
