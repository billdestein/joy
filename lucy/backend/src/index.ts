import { createServer } from './server'
import { connect as connectRedis } from './services/redis'
import { config } from './config'

async function main(): Promise<void> {
    await connectRedis()
    console.log('Connected to Redis')

    const app = createServer()
    app.listen(config.port, () => {
        console.log(`Lucy backend listening on port ${config.port}`)
    })
}

main().catch(err => {
    console.error('Failed to start server:', err)
    process.exit(1)
})
