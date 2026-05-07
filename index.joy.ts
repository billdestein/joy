import { joyExecute as execute } from './learn/language.joy.ts'
import { joyLearn as learn } from './learn/language.joy.ts'
import { architecture } from './learn/architecture.joy.ts'
import { backend } from './learn/backend.joy.ts'
import { common } from './learn/common.joy.ts'
import { backendTest } from './learn/backend-test.joy.ts'
import { frontend } from './learn/frontend.joy.ts'

learn(architecture)

learn(backend)

learn(common)

learn(frontend)

// execute('let me know if you have enough details to build the backend repo, the common repo, and the backend-test repo')

// execute(`remove the 'lucy' subdirectory if it exists`)

// execute(`create the 'lucy/common' subdirectory, and build the common repo in it.`)

// execute(`create the 'lucy/backend' subdirectory, and build the backend repo in it.`)

// execute(`create the 'lucy/backend-test' subdirectory, and build the backend-test repo in it.`)

execute(`delete and recreate the 'lucy/frontend' subdirectory, and build the frontend repo in it.`)
