import fs from 'fs/promises'
import path from 'path'
import { config } from '../config'
import { WorkbookType, PicType } from '@billdestein/claude-toolbox-common'

function getWorkbookDir(slug: string, workbookName: string): string {
    return path.join(config.mountDir, 'users', slug, workbookName)
}

function getWorkbookFile(slug: string, workbookName: string): string {
    return path.join(getWorkbookDir(slug, workbookName), 'workbook.json')
}

function getPicPath(slug: string, workbookName: string, filename: string): string {
    return path.join(getWorkbookDir(slug, workbookName), filename)
}

export async function createWorkbook(slug: string, workbookName: string): Promise<void> {
    const dir = getWorkbookDir(slug, workbookName)
    await fs.mkdir(dir, { recursive: true })
    const workbook: WorkbookType = { workbookName, pics: [], prompts: [] }
    await fs.writeFile(getWorkbookFile(slug, workbookName), JSON.stringify(workbook, null, 2))
}

export async function getWorkbook(slug: string, workbookName: string): Promise<WorkbookType> {
    const content = await fs.readFile(getWorkbookFile(slug, workbookName), 'utf-8')
    return JSON.parse(content) as WorkbookType
}

export async function saveWorkbook(slug: string, workbook: WorkbookType): Promise<void> {
    await fs.writeFile(getWorkbookFile(slug, workbook.workbookName), JSON.stringify(workbook, null, 2))
}

export async function deleteWorkbook(slug: string, workbookName: string): Promise<void> {
    const dir = getWorkbookDir(slug, workbookName)
    await fs.rm(dir, { recursive: true, force: true })
}

export async function deletePic(slug: string, workbookName: string, picName: string): Promise<void> {
    const workbook = await getWorkbook(slug, workbookName)
    workbook.pics = workbook.pics.filter(p => p.filename !== picName)
    await saveWorkbook(slug, workbook)
    await fs.rm(getPicPath(slug, workbookName, picName), { force: true })
}

export async function savePic(slug: string, workbookName: string, data: Buffer, mimeType: string): Promise<WorkbookType> {
    const workbook = await getWorkbook(slug, workbookName)
    await fs.writeFile(getPicPath(slug, workbookName, 'unnamed'), data)
    const pic: PicType = { createdAt: Date.now(), filename: 'unnamed', mimeType }
    workbook.pics.push(pic)
    await saveWorkbook(slug, workbook)
    return workbook
}

export async function renamePic(slug: string, workbookName: string, newPicName: string): Promise<void> {
    const workbook = await getWorkbook(slug, workbookName)
    const pic = workbook.pics.find(p => p.filename === 'unnamed')
    if (!pic) throw new Error('No unnamed pic found')
    await fs.rename(getPicPath(slug, workbookName, 'unnamed'), getPicPath(slug, workbookName, newPicName))
    pic.filename = newPicName
    await saveWorkbook(slug, workbook)
}

export async function listWorkbooks(slug: string): Promise<WorkbookType[]> {
    const usersDir = path.join(config.mountDir, 'users', slug)
    try {
        const entries = await fs.readdir(usersDir, { withFileTypes: true })
        const workbooks = await Promise.all(
            entries
                .filter(e => e.isDirectory())
                .map(e => getWorkbook(slug, e.name).catch(() => null))
        )
        return workbooks.filter((w): w is WorkbookType => w !== null)
    } catch {
        return []
    }
}
