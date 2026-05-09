import fs from 'fs'
import path from 'path'
import { WorkbookType } from '@billdestein/joy-common'

function workbookDir(slug: string, workbookName: string): string {
    return path.join(process.env.MOUNT_DIR!, 'users', slug, workbookName)
}

function workbookFile(slug: string, workbookName: string): string {
    return path.join(workbookDir(slug, workbookName), 'workbook.json')
}

export function readWorkbook(slug: string, workbookName: string): WorkbookType {
    const raw = fs.readFileSync(workbookFile(slug, workbookName), 'utf-8')
    return JSON.parse(raw)
}

export function writeWorkbook(slug: string, workbook: WorkbookType) {
    const dir = workbookDir(slug, workbook.workbookName)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(workbookFile(slug, workbook.workbookName), JSON.stringify(workbook, null, 2))
}

export function listWorkbooks(slug: string): WorkbookType[] {
    const userDir = path.join(process.env.MOUNT_DIR!, 'users', slug)
    if (!fs.existsSync(userDir)) return []
    return fs.readdirSync(userDir)
        .filter(name => fs.existsSync(path.join(userDir, name, 'workbook.json')))
        .map(name => readWorkbook(slug, name))
}

export function deleteWorkbook(slug: string, workbookName: string) {
    const dir = workbookDir(slug, workbookName)
    fs.rmSync(dir, { recursive: true, force: true })
}

export function deletePicFile(slug: string, workbookName: string, filename: string) {
    const filePath = path.join(workbookDir(slug, workbookName), filename)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
}

export function renamePicFile(slug: string, workbookName: string, oldName: string, newName: string) {
    const dir = workbookDir(slug, workbookName)
    fs.renameSync(path.join(dir, oldName), path.join(dir, newName))
}

export function writePicFile(slug: string, workbookName: string, filename: string, data: Buffer) {
    const filePath = path.join(workbookDir(slug, workbookName), filename)
    fs.writeFileSync(filePath, data)
}
