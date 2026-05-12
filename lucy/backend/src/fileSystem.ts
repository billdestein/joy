import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { WorkbookType, PicType } from '@billdestein/joy-common'

function expandTilde(p: string): string {
    if (p.startsWith('~')) {
        return os.homedir() + p.slice(1)
    }
    return p
}

let mountDir: string

export function initFileSystem(rawMountDir: string) {
    mountDir = expandTilde(rawMountDir)
    const usersDir = path.join(mountDir, 'users')
    fs.mkdirSync(usersDir, { recursive: true })
}

export function userDir(slug: string): string {
    return path.join(mountDir, 'users', slug)
}

export function workbooksDir(slug: string): string {
    return path.join(userDir(slug), 'workbooks')
}

export function workbookDir(slug: string, workbookName: string): string {
    return path.join(workbooksDir(slug), workbookName)
}

export function workbookJsonPath(slug: string, workbookName: string): string {
    return path.join(workbookDir(slug, workbookName), 'workbook.json')
}

export function ensureUserDir(slug: string) {
    fs.mkdirSync(workbooksDir(slug), { recursive: true })
}

export function readWorkbook(slug: string, workbookName: string): WorkbookType {
    const raw = fs.readFileSync(workbookJsonPath(slug, workbookName), 'utf-8')
    return JSON.parse(raw) as WorkbookType
}

export function writeWorkbook(slug: string, workbook: WorkbookType) {
    fs.writeFileSync(workbookJsonPath(slug, workbook.workbookName), JSON.stringify(workbook, null, 2))
}

export function listWorkbooks(slug: string): WorkbookType[] {
    const wbDir = workbooksDir(slug)
    if (!fs.existsSync(wbDir)) return []
    const entries = fs.readdirSync(wbDir, { withFileTypes: true })
    const workbooks: WorkbookType[] = []
    for (const entry of entries) {
        if (entry.isDirectory()) {
            const jsonPath = path.join(wbDir, entry.name, 'workbook.json')
            if (fs.existsSync(jsonPath)) {
                const raw = fs.readFileSync(jsonPath, 'utf-8')
                workbooks.push(JSON.parse(raw) as WorkbookType)
            }
        }
    }
    return workbooks
}

export function createWorkbook(slug: string, workbookName: string): void {
    const dir = workbookDir(slug, workbookName)
    fs.mkdirSync(dir, { recursive: true })
    const workbook: WorkbookType = {
        createdAt: Date.now(),
        pics: [],
        prompts: [],
        workbookName,
    }
    fs.writeFileSync(path.join(dir, 'workbook.json'), JSON.stringify(workbook, null, 2))
}

export function deleteWorkbook(slug: string, workbookName: string): void {
    const dir = workbookDir(slug, workbookName)
    fs.rmSync(dir, { recursive: true, force: true })
}

export function deletePic(slug: string, workbookName: string, picFilename: string): void {
    const wb = readWorkbook(slug, workbookName)
    wb.pics = wb.pics.filter((p: PicType) => p.filename !== picFilename)
    writeWorkbook(slug, wb)
    const picPath = path.join(workbookDir(slug, workbookName), picFilename)
    if (fs.existsSync(picPath)) {
        fs.unlinkSync(picPath)
    }
}

export function writePicFile(slug: string, workbookName: string, filename: string, encodedImage: string): void {
    const picPath = path.join(workbookDir(slug, workbookName), filename)
    fs.writeFileSync(picPath, Buffer.from(encodedImage, 'base64'))
}

export function readPicFile(slug: string, workbookName: string, picFilename: string): string {
    const picPath = path.join(workbookDir(slug, workbookName), picFilename)
    const data = fs.readFileSync(picPath)
    return data.toString('base64')
}
