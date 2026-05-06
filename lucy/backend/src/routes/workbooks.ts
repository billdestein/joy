import { Router, Request, Response } from 'express'
import fs from 'fs/promises'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { WorkbookType, PicType } from '@billdestein/joy-common'
import { findOrCreateUser } from '../user.js'
import { getEmailFromSession } from '../session.js'
import {
    userDir,
    workbookDir,
    picFile,
    readWorkbook,
    writeWorkbook,
} from '../fileSystem.js'

export const workbooksRouter = Router()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

async function resolveUser(req: Request, res: Response) {
    const sessionId = req.cookies?.sessionId as string | undefined
    if (!sessionId) {
        res.sendStatus(401)
        return null
    }
    const email = await getEmailFromSession(sessionId)
    if (!email) {
        res.sendStatus(401)
        return null
    }
    return findOrCreateUser(email)
}

workbooksRouter.post('/create-workbook', async (req, res) => {
    const user = await resolveUser(req, res)
    if (!user) return
    const { workbookName } = req.body as { workbookName: string }

    const dir = workbookDir(user.slug, workbookName)
    await fs.mkdir(dir, { recursive: true })

    const workbook: WorkbookType = { workbookName, pics: [], prompts: [] }
    await writeWorkbook(user.slug, workbookName, workbook)

    res.sendStatus(200)
})

workbooksRouter.post('/delete-pic', async (req, res) => {
    const user = await resolveUser(req, res)
    if (!user) return
    const { workbook, picName } = req.body as { workbook: WorkbookType; picName: string }

    const updated: WorkbookType = {
        ...workbook,
        pics: workbook.pics.filter((p) => p.filename !== picName),
    }
    await writeWorkbook(user.slug, workbook.workbookName, updated)

    await fs.rm(picFile(user.slug, workbook.workbookName, picName), { force: true })
    res.sendStatus(200)
})

workbooksRouter.post('/delete-workbook', async (req, res) => {
    const user = await resolveUser(req, res)
    if (!user) return
    const { workbookName } = req.body as { workbookName: string }

    const dir = workbookDir(user.slug, workbookName)
    await fs.rm(dir, { recursive: true, force: true })
    res.sendStatus(200)
})

workbooksRouter.post('/generate-pic', async (req, res) => {
    const user = await resolveUser(req, res)
    if (!user) return
    const { workbook } = req.body as { workbook: WorkbookType }

    const focusedPrompt = workbook.prompts.find((p) => p.focused)
    if (!focusedPrompt) {
        res.status(400).json({ error: 'No focused prompt' })
        return
    }

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-preview-image-generation',
    })

    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: focusedPrompt.text }] }],
        generationConfig: { responseModalities: ['IMAGE'] } as never,
    })

    const imagePart = result.response.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)
    if (!imagePart?.inlineData) {
        res.status(500).json({ error: 'No image returned from Gemini' })
        return
    }

    const { data: imageData, mimeType } = imagePart.inlineData
    const imageBuffer = Buffer.from(imageData, 'base64')
    await fs.writeFile(picFile(user.slug, workbook.workbookName, 'unnamed'), imageBuffer)

    const newPic: PicType = { createdAt: Date.now(), filename: 'unnamed', mimeType }
    const updated: WorkbookType = { ...workbook, pics: [...workbook.pics, newPic] }
    await writeWorkbook(user.slug, workbook.workbookName, updated)

    res.json({ workbook: updated, image: imageData })
})

workbooksRouter.get('/get-workbook', async (req, res) => {
    const user = await resolveUser(req, res)
    if (!user) return
    const workbookName = req.query.workbookName as string

    const workbook = await readWorkbook(user.slug, workbookName)
    res.json(workbook)
})

workbooksRouter.get('/list-workbooks', async (req, res) => {
    const user = await resolveUser(req, res)
    if (!user) return

    const entries = await fs.readdir(userDir(user.slug), { withFileTypes: true })
    const workbookDirs = entries.filter((e) => e.isDirectory())

    const workbooks: WorkbookType[] = []
    for (const dir of workbookDirs) {
        const wb = await readWorkbook(user.slug, dir.name)
        workbooks.push(wb)
    }

    res.json({ workbooks })
})

workbooksRouter.post('/rename-pic', async (req, res) => {
    const user = await resolveUser(req, res)
    if (!user) return
    const { workbook, newPicName } = req.body as { workbook: WorkbookType; newPicName: string }

    const oldPath = picFile(user.slug, workbook.workbookName, 'unnamed')
    const newPath = picFile(user.slug, workbook.workbookName, newPicName)
    await fs.rename(oldPath, newPath)

    const updated: WorkbookType = {
        ...workbook,
        pics: workbook.pics.map((p) =>
            p.filename === 'unnamed' ? { ...p, filename: newPicName } : p
        ),
    }
    await writeWorkbook(user.slug, workbook.workbookName, updated)

    res.sendStatus(200)
})
