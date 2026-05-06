import fs from 'fs/promises'
import path from 'path'
import type { WorkbookType } from '@billdestein/joy-common'

const MOUNT_DIR = process.env.MOUNT_DIR ?? './mount'

export function userDir(slug: string): string {
    return path.join(MOUNT_DIR, 'users', slug)
}

export function workbookDir(slug: string, workbookName: string): string {
    return path.join(userDir(slug), workbookName)
}

export function workbookFile(slug: string, workbookName: string): string {
    return path.join(workbookDir(slug, workbookName), 'workbook.json')
}

export function picFile(slug: string, workbookName: string, filename: string): string {
    return path.join(workbookDir(slug, workbookName), filename)
}

export async function readWorkbook(slug: string, workbookName: string): Promise<WorkbookType> {
    const data = await fs.readFile(workbookFile(slug, workbookName), 'utf-8')
    return JSON.parse(data) as WorkbookType
}

export async function writeWorkbook(slug: string, workbookName: string, workbook: WorkbookType): Promise<void> {
    await fs.writeFile(workbookFile(slug, workbookName), JSON.stringify(workbook, null, 2))
}

export async function ensureUserDir(slug: string): Promise<void> {
    await fs.mkdir(userDir(slug), { recursive: true })
}
