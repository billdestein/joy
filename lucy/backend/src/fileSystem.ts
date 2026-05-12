import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { WorkbookType } from '@billdestein/joy-common'

function expandTilde(p: string): string {
    if (p.startsWith('~')) {
        return path.join(os.homedir(), p.slice(1))
    }
    return p
}

function getMountDir(): string {
    return expandTilde(process.env.MOUNT_DIR || '')
}

function workbookDir(slug: string, workbookName: string): string {
    return path.join(getMountDir(), 'users', slug, 'workbooks', workbookName)
}

function workbookJsonPath(slug: string, workbookName: string): string {
    return path.join(workbookDir(slug, workbookName), 'workbook.json')
}

export function readWorkbook(slug: string, workbookName: string): WorkbookType {
    const raw = fs.readFileSync(workbookJsonPath(slug, workbookName), 'utf8')
    const wb = JSON.parse(raw) as WorkbookType
    return { ...wb, pics: wb.pics.map(p => ({ ...p, encodedImage: p.encodedImage ?? '' })) }
}

export function writeWorkbook(slug: string, workbook: WorkbookType): void {
    const dir = workbookDir(slug, workbook.workbookName)
    fs.mkdirSync(dir, { recursive: true })
    const clean: WorkbookType = {
        ...workbook,
        pics: workbook.pics.map(p => ({ ...p, encodedImage: '' })),
    }
    fs.writeFileSync(workbookJsonPath(slug, workbook.workbookName), JSON.stringify(clean, null, 2))
}

export function listWorkbooks(slug: string): WorkbookType[] {
    const workbooksDir = path.join(getMountDir(), 'users', slug, 'workbooks')
    if (!fs.existsSync(workbooksDir)) return []
    const entries = fs.readdirSync(workbooksDir, { withFileTypes: true })
    const workbooks: WorkbookType[] = []
    for (const entry of entries) {
        if (entry.isDirectory()) {
            try {
                workbooks.push(readWorkbook(slug, entry.name))
            } catch {
                // skip malformed workbook dirs
            }
        }
    }
    return workbooks
}

export function deleteWorkbook(slug: string, workbookName: string): void {
    const dir = workbookDir(slug, workbookName)
    fs.rmSync(dir, { recursive: true, force: true })
}

export function picPath(slug: string, workbookName: string, filename: string): string {
    return path.join(workbookDir(slug, workbookName), filename)
}

export function deletePicFile(slug: string, workbookName: string, filename: string): void {
    const p = picPath(slug, workbookName, filename)
    if (fs.existsSync(p)) fs.unlinkSync(p)
}

export function renamePicFile(slug: string, workbookName: string, oldName: string, newName: string): void {
    const dir = workbookDir(slug, workbookName)
    fs.renameSync(path.join(dir, oldName), path.join(dir, newName))
}

export function ensureUserRootDir(slug: string): void {
    const dir = path.join(getMountDir(), 'users', slug)
    fs.mkdirSync(dir, { recursive: true })
}

export function writePicFile(slug: string, workbookName: string, filename: string, data: Buffer): void {
    const dir = workbookDir(slug, workbookName)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, filename), data)
}
