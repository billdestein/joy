import { Router, Request, Response } from 'express'
import { GoogleGenAI } from '@google/genai'
import { PicType, WorkbookType } from '@billdestein/joy-common'
import { getEmailFromSession } from '../session'
import { findOrCreateUser } from '../user'
import {
    readWorkbook,
    writeWorkbook,
    deleteWorkbook,
    listWorkbooks,
    writePic,
    deletePic,
    renamePic,
} from '../fileSystem'

export const workbooksRouter = Router()

async function resolveUser(req: Request, res: Response): Promise<{ email: string; slug: string } | null> {
    const sessionId = req.cookies?.sessionId
    if (!sessionId) {
        res.sendStatus(401)
        return null
    }
    const email = await getEmailFromSession(sessionId)
    if (!email) {
        res.sendStatus(401)
        return null
    }
    const user = findOrCreateUser(email)
    return { email: user.email, slug: user.slug }
}

workbooksRouter.post('/create-workbook', async (req: Request, res: Response) => {
    const user = await resolveUser(req, res)
    if (!user) return

    const { workbookName } = req.body as { workbookName: string }
    const workbook: WorkbookType = { workbookName, pics: [], prompts: [] }
    writeWorkbook(process.env.MOUNT_DIR!, user.slug, workbook)
    res.sendStatus(200)
})

workbooksRouter.post('/delete-pic', async (req: Request, res: Response) => {
    const user = await resolveUser(req, res)
    if (!user) return

    const { workbook, picName } = req.body as { workbook: WorkbookType; picName: string }
    const updated: WorkbookType = {
        ...workbook,
        pics: workbook.pics.filter(p => p.filename !== picName),
    }
    writeWorkbook(process.env.MOUNT_DIR!, user.slug, updated)
    deletePic(process.env.MOUNT_DIR!, user.slug, workbook.workbookName, picName)
    res.sendStatus(200)
})

workbooksRouter.post('/delete-workbook', async (req: Request, res: Response) => {
    const user = await resolveUser(req, res)
    if (!user) return

    const { workbookName } = req.body as { workbookName: string }
    deleteWorkbook(process.env.MOUNT_DIR!, user.slug, workbookName)
    res.sendStatus(200)
})

workbooksRouter.post('/generate-pic', async (req: Request, res: Response) => {
    try {
    const user = await resolveUser(req, res)
    if (!user) return

    const { workbook } = req.body as { workbook: WorkbookType }
    const focusedPrompt = workbook.prompts.find(p => p.focused)
    if (!focusedPrompt) {
        res.status(400).json({ error: 'No focused prompt' })
        return
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! })
    const result = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: focusedPrompt.text,
        config: { numberOfImages: 1 },
    })
    const imageData = result.generatedImages![0].image!
    const mimeType: string = imageData.mimeType ?? 'image/png'
    const imageBytes = Buffer.from(imageData.imageBytes!, 'base64')

    const filename = 'unnamed'
    writePic(process.env.MOUNT_DIR!, user.slug, workbook.workbookName, filename, imageBytes)

    const pic: PicType = { createdAt: Date.now(), filename, mimeType }
    const updated: WorkbookType = { ...workbook, pics: [...workbook.pics, pic] }
    writeWorkbook(process.env.MOUNT_DIR!, user.slug, updated)

    res.json({ workbook: updated, image: imageBytes.toString('base64') })
    } catch (err) {
        console.error('generate-pic error:', err)
        res.status(500).json({ error: 'Image generation failed' })
    }
})

workbooksRouter.get('/get-workbook', async (req: Request, res: Response) => {
    const user = await resolveUser(req, res)
    if (!user) return

    const workbookName = req.query.workbookName as string
    const workbook = readWorkbook(process.env.MOUNT_DIR!, user.slug, workbookName)
    res.json(workbook)
})

workbooksRouter.get('/list-workbooks', async (req: Request, res: Response) => {
    const user = await resolveUser(req, res)
    if (!user) return

    const workbooks = listWorkbooks(process.env.MOUNT_DIR!, user.slug)
    res.json({ workbooks })
})

workbooksRouter.post('/rename-pic', async (req: Request, res: Response) => {
    const user = await resolveUser(req, res)
    if (!user) return

    const { workbook, newPicName } = req.body as { workbook: WorkbookType; newPicName: string }
    const oldName = 'unnamed'
    renamePic(process.env.MOUNT_DIR!, user.slug, workbook.workbookName, oldName, newPicName)

    const updated: WorkbookType = {
        ...workbook,
        pics: workbook.pics.map(p => p.filename === oldName ? { ...p, filename: newPicName } : p),
    }
    writeWorkbook(process.env.MOUNT_DIR!, user.slug, updated)
    res.sendStatus(200)
})
