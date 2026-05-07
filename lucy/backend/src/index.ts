import fs from 'fs'
import path from 'path'
import os from 'os'

function expandTilde(p: string): string {
    return p.startsWith('~') ? path.join(os.homedir(), p.slice(1)) : p
}

import express from 'express'
import cookieParser from 'cookie-parser'
import { initRedis } from './session'
import { healthRouter } from './routes/health'
import { authRouter } from './routes/auth'
import { workbooksRouter } from './routes/workbooks'

const mode = process.argv[2] ?? 'local'
const configFile = mode === 'prod' ? 'BackendProdConfig.json' : 'BackendLocalConfig.json'
const configPath = path.join(os.homedir(), '.lucy-config', configFile)
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

for (const key of [
    'COGNITO_REGION',
    'COGNITO_USER_POOL_ID',
    'GOOGLE_API_KEY',
    'MOUNT_DIR',
    'ORIGIN',
    'REDIS_HOST',
    'REDIS_PORT',
]) {
    process.env[key] = String(config[key])
}
process.env.MOUNT_DIR = expandTilde(process.env.MOUNT_DIR!)

async function main() {
    await initRedis(process.env.REDIS_HOST!, parseInt(process.env.REDIS_PORT!, 10))

    const app = express()
    app.use(express.json())
    app.use(cookieParser())

    app.use('/v1/health', healthRouter)
    app.use('/v1/auth', authRouter)
    app.use('/v1/workbooks', workbooksRouter)

    app.listen(8080, () => {
        console.log(`lucy-backend listening on port 8080 (${mode} mode)`)
    })
}

main().catch(err => {
    console.error(err)
    process.exit(1)
})
