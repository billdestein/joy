import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { WorkbookType, PicType } from '@billdestein/joy-common'

function getMountDir(): string {
    const raw = process.env.MOUNT_DIR || '~/.lucy/mount'
    return raw.replace(/^~/, os.homedir())
}

function getWorkbookDir(slug: string, workbookName: string): string {
    return path.join(getMountDir(), 'users', slug, workbookName)
}

function getWorkbookJsonPath(slug: string, workbookName: string): string {
    return path.join(getWorkbookDir(slug, workbookName), 'workbook.json')
}

export function readWorkbook(slug: string, workbookName: string): WorkbookType {
    return JSON.parse(fs.readFileSync(getWorkbookJsonPath(slug, workbookName), 'utf-8')) as WorkbookType
}

export function writeWorkbook(slug: string, workbookName: string, workbook: WorkbookType): void {
    fs.writeFileSync(getWorkbookJsonPath(slug, workbookName), JSON.stringify(workbook, null, 2), 'utf-8')
}

export function createWorkbookOnDisk(slug: string, workbookName: string): void {
    const dir = getWorkbookDir(slug, workbookName)
    fs.mkdirSync(dir, { recursive: true })
    const workbook: WorkbookType = {
        createdAt: Date.now(),
        pics: [],
        prompts: [],
        workbookName,
    }
    writeWorkbook(slug, workbookName, workbook)
}

export function deleteWorkbookFromDisk(slug: string, workbookName: string): void {
    fs.rmSync(getWorkbookDir(slug, workbookName), { recursive: true, force: true })
}

export function listWorkbooksFromDisk(slug: string): WorkbookType[] {
    const userDir = path.join(getMountDir(), 'users', slug)
    if (!fs.existsSync(userDir)) return []
    return fs.readdirSync(userDir, { withFileTypes: true })
        .filter(e => e.isDirectory())
        .flatMap(e => {
            try { return [readWorkbook(slug, e.name)] } catch { return [] }
        })
}

export function getPicPath(slug: string, workbookName: string, filename: string): string {
    return path.join(getWorkbookDir(slug, workbookName), filename)
}

export function deletePicFile(slug: string, workbookName: string, filename: string): void {
    const p = getPicPath(slug, workbookName, filename)
    if (fs.existsSync(p)) fs.unlinkSync(p)
}

export function renamePicFile(slug: string, workbookName: string, oldName: string, newName: string): void {
    fs.renameSync(getPicPath(slug, workbookName, oldName), getPicPath(slug, workbookName, newName))
}

export function savePicFile(slug: string, workbookName: string, filename: string, data: Buffer): void {
    fs.writeFileSync(getPicPath(slug, workbookName, filename), data)
}

export function addPicToWorkbook(slug: string, workbookName: string, pic: PicType): WorkbookType {
    const wb = readWorkbook(slug, workbookName)
    wb.pics.push(pic)
    writeWorkbook(slug, workbookName, wb)
    return wb
}
