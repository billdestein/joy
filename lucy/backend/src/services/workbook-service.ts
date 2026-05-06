import fs from 'fs/promises'
import path from 'path'
import { WorkbookType, PicType } from '@billdestein/lucy-common'
import { config } from '../config'

function userDir(slug: string): string {
    return path.join(config.mountPath, 'users', slug)
}

function workbookDir(slug: string, workbookName: string): string {
    return path.join(userDir(slug), workbookName)
}

function workbookFile(slug: string, workbookName: string): string {
    return path.join(workbookDir(slug, workbookName), 'workbook.json')
}

async function readWorkbook(slug: string, workbookName: string): Promise<WorkbookType> {
    const content = await fs.readFile(workbookFile(slug, workbookName), 'utf-8')
    return JSON.parse(content) as WorkbookType
}

async function writeWorkbook(slug: string, wb: WorkbookType): Promise<void> {
    await fs.writeFile(workbookFile(slug, wb.workbookName), JSON.stringify(wb, null, 2))
}

export async function createWorkbook(slug: string, workbookName: string): Promise<void> {
    const dir = workbookDir(slug, workbookName)
    await fs.mkdir(dir, { recursive: true })
    const wb: WorkbookType = { workbookName, pics: [], prompts: [] }
    await writeWorkbook(slug, wb)
}

export async function deleteWorkbook(slug: string, workbookName: string): Promise<void> {
    await fs.rm(workbookDir(slug, workbookName), { recursive: true, force: true })
}

export async function getWorkbook(slug: string, workbookName: string): Promise<WorkbookType> {
    return readWorkbook(slug, workbookName)
}

export async function listWorkbooks(slug: string): Promise<WorkbookType[]> {
    const dir = userDir(slug)
    await fs.mkdir(dir, { recursive: true })

    let entries: string[]
    try {
        entries = await fs.readdir(dir)
    } catch {
        return []
    }

    const workbooks: WorkbookType[] = []
    for (const entry of entries) {
        try {
            workbooks.push(await readWorkbook(slug, entry))
        } catch {
            // skip non-workbook entries
        }
    }
    return workbooks
}

export async function deletePic(slug: string, workbookName: string, picName: string): Promise<void> {
    const wb = await readWorkbook(slug, workbookName)
    const pic = wb.pics.find(p => p.filename === picName)
    if (pic) {
        await fs.rm(path.join(workbookDir(slug, workbookName), pic.filename), { force: true })
        wb.pics = wb.pics.filter(p => p.filename !== picName)
        await writeWorkbook(slug, wb)
    }
}

export async function renamePic(slug: string, workbookName: string, newPicName: string): Promise<void> {
    const wb = await readWorkbook(slug, workbookName)
    const pic = wb.pics.find(p => p.filename === 'unnamed')
    if (!pic) throw new Error('No unnamed pic found')

    const dir = workbookDir(slug, workbookName)
    await fs.rename(path.join(dir, 'unnamed'), path.join(dir, newPicName))
    pic.filename = newPicName
    await writeWorkbook(slug, wb)
}

export async function addGeneratedPic(
    slug: string,
    workbookName: string,
    imageData: Buffer,
    mimeType: string
): Promise<WorkbookType> {
    const wb = await readWorkbook(slug, workbookName)
    const dir = workbookDir(slug, workbookName)

    await fs.writeFile(path.join(dir, 'unnamed'), imageData)

    const pic: PicType = {
        createdAt: Date.now(),
        filename: 'unnamed',
        mimeType,
    }
    wb.pics.push(pic)
    await writeWorkbook(slug, wb)
    return wb
}
