import { joyExecute as execute } from './learn/language.joy.ts'
import { joyLearn as learn } from './learn/language.joy.ts'
import { architecture } from './learn/architecture.joy.ts'
import { backend } from './learn/backend.joy.ts'
import { common } from './learn/common.joy.ts'
import { backendTest } from './learn/backend-test.joy.ts'
import { frames } from './learn/frames.joy.ts'
import { framesTest } from './learn/frames-test.joy.ts'

learn(architecture)

learn(backend)

learn(backendTest)

learn(common)

learn(frames)

learn(framesTest)

// execute(`
//     before proceeding, let me know if you have enough details to build the 
//     backend repo, the common repo, and the backend-test repo')
// `)

// // common
// execute(`
//     create the 'lucy/common' subdirectory, 
//     and build the common repo in it.
// `)

// // backend
// execute(`
//     create the 'lucy/backend' subdirectory, 
//     and build the backend repo in it.
// `)

// // backend-test
// execute(`
//     create the 'lucy/backend-test' subdirectory, 
//     and build the backend-test repo in it.
// `)

// // frames
// execute(`
//     delete and recreate the 'lucy/frontend/frames' subdirectory, 
//     and build the frames library in it.
// `)

// frames-test
execute(`
    delete and recreate the 'lucy/frames-test' subdirectory, 
    and build the frames-test repo in it.
`)
