import fs from 'fs'
import path from 'path'
import { WorkbookType } from '@billdestein/joy-common'

function workbookDir(slug: string, workbookName: string): string {
    return path.join(process.env.MOUNT_DIR!, 'users', slug, workbookName)
}

function workbookJsonPath(slug: string, workbookName: string): string {
    return path.join(workbookDir(slug, workbookName), 'workbook.json')
}

export function readWorkbook(slug: string, workbookName: string): WorkbookType {
    const data = fs.readFileSync(workbookJsonPath(slug, workbookName), 'utf8')
    return JSON.parse(data)
}

export function writeWorkbook(slug: string, workbook: WorkbookType): void {
    fs.writeFileSync(workbookJsonPath(slug, workbook.workbookName), JSON.stringify(workbook, null, 2))
}

export function createWorkbookDir(slug: string, workbookName: string): void {
    fs.mkdirSync(workbookDir(slug, workbookName), { recursive: true })
}

export function listWorkbooks(slug: string): WorkbookType[] {
    const userDir = path.join(process.env.MOUNT_DIR!, 'users', slug)
    if (!fs.existsSync(userDir)) return []
    const entries = fs.readdirSync(userDir, { withFileTypes: true })
    const workbooks: WorkbookType[] = []
    for (const entry of entries) {
        if (entry.isDirectory()) {
            try {
                workbooks.push(readWorkbook(slug, entry.name))
            } catch {
                // skip directories that don't have a valid workbook.json
            }
        }
    }
    return workbooks
}

export function deleteWorkbookDir(slug: string, workbookName: string): void {
    fs.rmSync(workbookDir(slug, workbookName), { recursive: true, force: true })
}

export function picFilePath(slug: string, workbookName: string, filename: string): string {
    return path.join(workbookDir(slug, workbookName), filename)
}

export function writePicFile(slug: string, workbookName: string, filename: string, data: Buffer): void {
    fs.writeFileSync(picFilePath(slug, workbookName, filename), data)
}

export function renamePicFile(slug: string, workbookName: string, oldName: string, newName: string): void {
    fs.renameSync(picFilePath(slug, workbookName, oldName), picFilePath(slug, workbookName, newName))
}

export function deletePicFile(slug: string, workbookName: string, filename: string): void {
    fs.unlinkSync(picFilePath(slug, workbookName, filename))
}
