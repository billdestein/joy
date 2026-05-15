import fs from 'fs'
import path from 'path'
import { WorkbookType } from '@billdestein/joy-common'
import { config } from '../config'

export function workbookDir(slug: string, workbookName: string): string {
    return path.join(config.mountDir, 'users', slug, 'workbooks', workbookName)
}

export function workbookJsonPath(slug: string, workbookName: string): string {
    return path.join(workbookDir(slug, workbookName), 'workbook.json')
}

export function picPath(slug: string, workbookName: string, filename: string): string {
    return path.join(workbookDir(slug, workbookName), filename)
}

export function readWorkbook(slug: string, workbookName: string): WorkbookType {
    const raw = fs.readFileSync(workbookJsonPath(slug, workbookName), 'utf-8')
    return JSON.parse(raw) as WorkbookType
}

export function saveWorkbook(slug: string, workbookName: string, workbook: WorkbookType): void {
    fs.writeFileSync(workbookJsonPath(slug, workbookName), JSON.stringify(workbook, null, 2))
}

export function listWorkbooks(slug: string): WorkbookType[] {
    const workbooksRoot = path.join(config.mountDir, 'users', slug, 'workbooks')
    if (!fs.existsSync(workbooksRoot)) return []

    const entries = fs.readdirSync(workbooksRoot, { withFileTypes: true })
    const workbooks: WorkbookType[] = []

    for (const entry of entries) {
        if (!entry.isDirectory()) continue
        const jsonPath = path.join(workbooksRoot, entry.name, 'workbook.json')
        if (!fs.existsSync(jsonPath)) continue
        try {
            const wb = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as WorkbookType
            workbooks.push(wb)
        } catch {
            // skip malformed workbooks
        }
    }

    return workbooks
}
