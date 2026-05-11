import { joyExecute as execute } from './learn/language.joy.ts'
import { joyLearn as learn } from './learn/language.joy.ts'

import { architecture } from './learn/architecture.joy.ts'
import { backend } from './learn/backend.joy.ts'
import { common } from './learn/common.joy.ts'
import { composerComponent } from './learn/composerComponent.joy.ts'
import { frameHeaderButtonComponent } from './learn/frameHeaderButtonComponent.joy.ts'
import { frontend } from './learn/frontend.joy.ts'
import { mainMenuComponent } from './learn/mainMenu.joy.ts'
import { getWorkbookNameFrame } from './learn/getWorkbookNameFrame.joy.ts'
import { picListComponent } from './learn/picListComponent.joy.ts'
import { uploadWorkbookFrame } from './learn/uploadWorkbookFrame.joy.ts'
import { viewerComponent } from './learn/viewerComponent.joy.ts'
import { workbookFrame } from './learn/workbookFrame.joy.ts'
import { workbookListFrame } from './learn/workbookListFrame.joy.ts'
import { windows } from './learn/windows.joy.ts'

execute(`
    We're just going to generate code.
    Do not start the backend server.
    Do not start the frontend server.
`)

learn(architecture)

learn(backend)

learn(common)

learn(composerComponent)

learn(frameHeaderButtonComponent)

learn(frontend)

learn(getWorkbookNameFrame)

learn(mainMenuComponent)

learn(picListComponent)

learn(uploadWorkbookFrame)

learn(viewerComponent)

learn(windows)

learn(workbookFrame)

learn(workbookListFrame)

execute(`
    before proceeding, let me know if everything makes sense and if you have enough details to build:

    - the backend repo, 
    - the common repo, 
    - the frontend repo
`)
