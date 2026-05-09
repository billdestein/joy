import fs from 'fs'
import path from 'path'
import os from 'os'
import { WorkbookType } from '@billdestein/joy-common'

function expandTilde(p: string): string {
    if (p.startsWith('~')) {
        return os.homedir() + p.slice(1)
    }
    return p
}

function getMountDir(): string {
    return expandTilde(process.env.MOUNT_DIR ?? '~/mount')
}

function getUserDir(slug: string): string {
    return path.join(getMountDir(), 'users', slug)
}

function getWorkbookDir(slug: string, workbookName: string): string {
    return path.join(getUserDir(slug), workbookName)
}

function getWorkbookJsonPath(slug: string, workbookName: string): string {
    return path.join(getWorkbookDir(slug, workbookName), 'workbook.json')
}

export function ensureUserDir(slug: string): void {
    fs.mkdirSync(getUserDir(slug), { recursive: true })
}

export function readWorkbook(slug: string, workbookName: string): WorkbookType {
    const raw = fs.readFileSync(getWorkbookJsonPath(slug, workbookName), 'utf-8')
    return JSON.parse(raw) as WorkbookType
}

export function writeWorkbook(slug: string, workbook: WorkbookType): void {
    const dir = getWorkbookDir(slug, workbook.workbookName)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(getWorkbookJsonPath(slug, workbook.workbookName), JSON.stringify(workbook, null, 2))
}

export function listWorkbooks(slug: string): WorkbookType[] {
    ensureUserDir(slug)
    const userDir = getUserDir(slug)
    const entries = fs.readdirSync(userDir, { withFileTypes: true })
    const workbooks: WorkbookType[] = []
    for (const entry of entries) {
        if (!entry.isDirectory()) continue
        try {
            const wb = readWorkbook(slug, entry.name)
            workbooks.push(wb)
        } catch {
            // skip directories without workbook.json
        }
    }
    return workbooks
}

export function createWorkbook(slug: string, workbookName: string): void {
    ensureUserDir(slug)
    const workbook: WorkbookType = {
        createdAt: Date.now(),
        pics: [],
        prompts: [],
        workbookName,
    }
    writeWorkbook(slug, workbook)
}

export function deleteWorkbook(slug: string, workbookName: string): void {
    const dir = getWorkbookDir(slug, workbookName)
    fs.rmSync(dir, { recursive: true, force: true })
}

export function savePicFile(slug: string, workbookName: string, filename: string, data: Buffer): void {
    const filePath = path.join(getWorkbookDir(slug, workbookName), filename)
    fs.writeFileSync(filePath, data)
}

export function deletePicFile(slug: string, workbookName: string, filename: string): void {
    const filePath = path.join(getWorkbookDir(slug, workbookName), filename)
    fs.rmSync(filePath, { force: true })
}

export function renamePicFile(slug: string, workbookName: string, oldName: string, newName: string): void {
    const dir = getWorkbookDir(slug, workbookName)
    fs.renameSync(path.join(dir, oldName), path.join(dir, newName))
}
