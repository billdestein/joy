import fs from 'fs'
import path from 'path'
import { WorkbookType } from '@billdestein/joy-common'

function workbookDir(mountDir: string, slug: string, workbookName: string): string {
    return path.join(mountDir, 'users', slug, workbookName)
}

function workbookJsonPath(mountDir: string, slug: string, workbookName: string): string {
    return path.join(workbookDir(mountDir, slug, workbookName), 'workbook.json')
}

export function readWorkbook(mountDir: string, slug: string, workbookName: string): WorkbookType {
    const data = fs.readFileSync(workbookJsonPath(mountDir, slug, workbookName), 'utf-8')
    return JSON.parse(data) as WorkbookType
}

export function writeWorkbook(mountDir: string, slug: string, workbook: WorkbookType): void {
    const dir = workbookDir(mountDir, slug, workbook.workbookName)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(workbookJsonPath(mountDir, slug, workbook.workbookName), JSON.stringify(workbook, null, 2))
}

export function deleteWorkbook(mountDir: string, slug: string, workbookName: string): void {
    const dir = workbookDir(mountDir, slug, workbookName)
    fs.rmSync(dir, { recursive: true, force: true })
}

export function listWorkbooks(mountDir: string, slug: string): WorkbookType[] {
    const userDir = path.join(mountDir, 'users', slug)
    if (!fs.existsSync(userDir)) return []
    return fs.readdirSync(userDir)
        .filter(name => fs.statSync(path.join(userDir, name)).isDirectory())
        .map(name => readWorkbook(mountDir, slug, name))
}

export function picPath(mountDir: string, slug: string, workbookName: string, filename: string): string {
    return path.join(workbookDir(mountDir, slug, workbookName), filename)
}

export function writePic(mountDir: string, slug: string, workbookName: string, filename: string, data: Buffer): void {
    const p = picPath(mountDir, slug, workbookName, filename)
    fs.writeFileSync(p, data)
}

export function deletePic(mountDir: string, slug: string, workbookName: string, filename: string): void {
    const p = picPath(mountDir, slug, workbookName, filename)
    if (fs.existsSync(p)) fs.unlinkSync(p)
}

export function renamePic(mountDir: string, slug: string, workbookName: string, oldName: string, newName: string): void {
    const oldPath = picPath(mountDir, slug, workbookName, oldName)
    const newPath = picPath(mountDir, slug, workbookName, newName)
    fs.renameSync(oldPath, newPath)
}

export function readPic(mountDir: string, slug: string, workbookName: string, filename: string): Buffer {
    return fs.readFileSync(picPath(mountDir, slug, workbookName, filename))
}
