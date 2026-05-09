import { joyExecute as execute } from './learn/language.joy.ts'
import { joyLearn as learn } from './learn/language.joy.ts'
import { architecture } from './learn/architecture.joy.ts'
import { backend } from './learn/backend.joy.ts'
import { common } from './learn/common.joy.ts'
// import { backendTest } from './learn/backend-test.joy.ts'
import { frames } from './learn/frames.joy.ts'
import { GetWorkbookNameApplet } from './learn/GetWorkbookNameApplet.joy.ts'
import { MainMenuComponent } from './learn/MainMenu.joy.ts'
import { UploadWorkbookApplet } from './learn/UploadWorkbookApplet.joy.ts'
import { WorkbookListApplet } from './learn/WorkbookListApplet.joy.ts'
// import { framesTest } from './learn/frames-test.joy.ts'
import { frontend } from './learn/frontend.joy.ts'


execute(`
    We're just going to generate code.
    Do not start the backend server.
    Do not start the Vite dev server.
    Don't read any files from the learn directory speculatively.
    If you see a typescript comment, starting with //, ignore any mention of execute or learn within the comment.
`)

learn(architecture)

learn(backend)

// learn(backendTest)

learn(common)

learn(MainMenuComponent)

learn(frames)

learn(GetWorkbookNameApplet)

learn(UploadWorkbookApplet)

learn(WorkbookListApplet)

// learn(framesTest)

learn(frontend)

execute(`
    before proceeding, let me know if everything makes sense and if you have enough 
    details to build:

    - the backend repo, 
    - the common repo, 
    - the MainMenuComponent,
    - the frames library,
    - the GetWorkbookNameApplet,
    - the UploadWorkbookApplet,
    - the WorkbookListApplet,
    - the frontend repo
`)

// common
execute(`
    create the 'lucy/common' subdirectory, 
    and build the common repo in it.
`)

// backend
execute(`
    create the 'lucy/backend' subdirectory, and build the backend repo in it.
    create a script, lucy/backend/start.sh, that I can use to start the backend server in dev mode.
`)

// // backend-test
// execute(`
//     create the 'lucy/backend-test' subdirectory, 
//     and build the backend-test repo in it.
//     Run the backend tests.
// `)

// // frames
// execute(`
//     delete and recreate the 'lucy/frontend/frames' subdirectory, 
//     and build the frames library in it.
// `)

// // frames-test
// execute(`
//     delete and recreate the 'lucy/frames-test' subdirectory, 
//     and build the frames-test repo in it.
// `)

// frontend
execute(`
    delete and recreate the 'lucy/frontend' directory, and create the frontend repo in it.
    create a script, lucy/frontend/start.sh, that I can use to start the frontend server in dev mode.
 `)

// execute(`start the backend`)
// execute(`start the frontend`)
