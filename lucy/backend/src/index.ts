import { config } from './config'
import { createServer } from './server'

const app = createServer()

app.listen(config.port, () => {
    console.log(`Lucy backend running on port ${config.port}`)
})
