import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import authRouter from './routes/auth'
import healthRouter from './routes/health'
import workbooksRouter from './routes/workbooks'

export function createServer(): express.Application {
    const app = express()

    app.use(cors({ origin: true, credentials: true }))
    app.use(express.json())
    app.use(cookieParser())

    app.use('/v1/auth', authRouter)
    app.use('/v1/health', healthRouter)
    app.use('/v1/workbooks', workbooksRouter)

    return app
}
