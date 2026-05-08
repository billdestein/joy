import * as fs from 'fs'
import * as path from 'path'
import { WorkbookType } from '@billdestein/joy-common'

export function workbookDir(slug: string, workbookName: string): string {
    return path.join(process.env.MOUNT_DIR!, 'users', slug, workbookName)
}

function workbookJsonPath(slug: string, workbookName: string): string {
    return path.join(workbookDir(slug, workbookName), 'workbook.json')
}

export function readWorkbook(slug: string, workbookName: string): WorkbookType {
    const raw = fs.readFileSync(workbookJsonPath(slug, workbookName), 'utf-8')
    return JSON.parse(raw) as WorkbookType
}

export function writeWorkbook(slug: string, workbook: WorkbookType): void {
    const dir = workbookDir(slug, workbook.workbookName)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(workbookJsonPath(slug, workbook.workbookName), JSON.stringify(workbook, null, 2))
}

export function listWorkbooks(slug: string): WorkbookType[] {
    const usersDir = path.join(process.env.MOUNT_DIR!, 'users', slug)
    if (!fs.existsSync(usersDir)) return []
    return fs.readdirSync(usersDir)
        .filter(name => fs.existsSync(path.join(usersDir, name, 'workbook.json')))
        .map(name => readWorkbook(slug, name))
}
