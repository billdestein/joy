import fs from 'fs'
import path from 'path'
import { WorkbookType, PicType } from '@billdestein/joy-common'

function workbookDir(mountDir: string, slug: string, workbookName: string): string {
    return path.join(mountDir, 'users', slug, workbookName)
}

function workbookFilePath(mountDir: string, slug: string, workbookName: string): string {
    return path.join(workbookDir(mountDir, slug, workbookName), 'workbook.json')
}

export function readWorkbook(mountDir: string, slug: string, workbookName: string): WorkbookType {
    const data = fs.readFileSync(workbookFilePath(mountDir, slug, workbookName), 'utf-8')
    return JSON.parse(data) as WorkbookType
}

export function writeWorkbook(mountDir: string, slug: string, workbook: WorkbookType): void {
    fs.writeFileSync(workbookFilePath(mountDir, slug, workbook.workbookName), JSON.stringify(workbook, null, 2))
}

export function createWorkbook(mountDir: string, slug: string, workbookName: string): void {
    const dir = workbookDir(mountDir, slug, workbookName)
    fs.mkdirSync(dir, { recursive: true })
    const workbook: WorkbookType = { workbookName, pics: [], prompts: [] }
    fs.writeFileSync(workbookFilePath(mountDir, slug, workbookName), JSON.stringify(workbook, null, 2))
}

export function deleteWorkbook(mountDir: string, slug: string, workbookName: string): void {
    const dir = workbookDir(mountDir, slug, workbookName)
    fs.rmSync(dir, { recursive: true, force: true })
}

export function listWorkbooks(mountDir: string, slug: string): WorkbookType[] {
    const userDir = path.join(mountDir, 'users', slug)
    if (!fs.existsSync(userDir)) return []
    const entries = fs.readdirSync(userDir, { withFileTypes: true })
    const workbooks: WorkbookType[] = []
    for (const entry of entries) {
        if (!entry.isDirectory()) continue
        try {
            const wbFilePath = path.join(userDir, entry.name, 'workbook.json')
            const stat = fs.statSync(wbFilePath)
            const wb = JSON.parse(fs.readFileSync(wbFilePath, 'utf-8')) as WorkbookType
            wb.lastModified = stat.mtimeMs
            workbooks.push(wb)
        } catch {
            // skip malformed workbook dirs
        }
    }
    return workbooks
}

export function picPath(mountDir: string, slug: string, workbookName: string, filename: string): string {
    return path.join(workbookDir(mountDir, slug, workbookName), filename)
}
