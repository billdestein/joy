import { architecture } from './learn/architecture.joy.ts'
import { backend } from './learn/backend.joy.ts'
import { common } from './learn/common.joy.ts'

// @ts-ignore
learn(architecture)

// @ts-ignore
learn(backend)

// @ts-ignore
learn(common)

// @ts-ignore
execute(`remove the 'output' subdirectory if it exists`)

// @ts-ignore
execute(`create the 'output/common' subdirectory, and build the common repo in it.`)

// @ts-ignore
execute(`create the 'output/backend' subdirectory, and build the backend repo in it.`)

