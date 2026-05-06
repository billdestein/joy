import express from 'express'
import cookieParser from 'cookie-parser'
import { connectRedis } from './session.js'
import { authRouter } from './routes/auth.js'
import { healthRouter } from './routes/health.js'
import { workbooksRouter } from './routes/workbooks.js'

const app = express()
const PORT = process.env.PORT ?? 3000

app.use(express.json())
app.use(cookieParser())

app.use('/v1/auth', authRouter)
app.use('/v1/health', healthRouter)
app.use('/v1/workbooks', workbooksRouter)

async function start() {
    await connectRedis()
    app.listen(PORT, () => {
        console.log(`Lucy backend listening on port ${PORT}`)
    })
}

start().catch(console.error)
