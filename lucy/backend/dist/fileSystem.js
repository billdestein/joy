import fs from 'fs/promises';
import path from 'path';
const MOUNT_DIR = process.env.MOUNT_DIR ?? './mount';
export function userDir(slug) {
    return path.join(MOUNT_DIR, 'users', slug);
}
export function workbookDir(slug, workbookName) {
    return path.join(userDir(slug), workbookName);
}
export function workbookFile(slug, workbookName) {
    return path.join(workbookDir(slug, workbookName), 'workbook.json');
}
export function picFile(slug, workbookName, filename) {
    return path.join(workbookDir(slug, workbookName), filename);
}
export async function readWorkbook(slug, workbookName) {
    const data = await fs.readFile(workbookFile(slug, workbookName), 'utf-8');
    return JSON.parse(data);
}
export async function writeWorkbook(slug, workbookName, workbook) {
    await fs.writeFile(workbookFile(slug, workbookName), JSON.stringify(workbook, null, 2));
}
export async function ensureUserDir(slug) {
    await fs.mkdir(userDir(slug), { recursive: true });
}
