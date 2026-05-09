import { Router, Request, Response } from 'express'
import { GoogleGenAI, Modality } from '@google/genai'
import { PicType, WorkbookType } from '@billdestein/joy-common'
import { User } from '../user'
import {
    readWorkbook,
    writeWorkbook,
    listWorkbooks,
    deleteWorkbook,
    deletePicFile,
    renamePicFile,
    writePicFile,
} from '../fileSystem'

const router = Router()

function getUser(res: Response): User {
    return res.locals.user as User
}

router.post('/create-workbook', (req: Request, res: Response) => {
    const { workbookName } = req.body
    const user = getUser(res)
    const workbook: WorkbookType = { workbookName, pics: [], prompts: [] }
    writeWorkbook(user.slug, workbook)
    res.status(200).end()
})

router.post('/delete-pic', (req: Request, res: Response) => {
    const { workbook, picName }: { workbook: WorkbookType; picName: string } = req.body
    const user = getUser(res)
    deletePicFile(user.slug, workbook.workbookName, picName)
    const updated: WorkbookType = {
        ...workbook,
        pics: workbook.pics.filter(p => p.filename !== picName),
    }
    writeWorkbook(user.slug, updated)
    res.status(200).end()
})

router.post('/delete-workbook', (req: Request, res: Response) => {
    const { workbookName } = req.body
    const user = getUser(res)
    deleteWorkbook(user.slug, workbookName)
    res.status(200).end()
})

router.post('/generate-pic', async (req: Request, res: Response) => {
    const { workbook }: { workbook: WorkbookType } = req.body
    const user = getUser(res)
    const focusedPrompt = workbook.prompts.find(p => p.focused)
    if (!focusedPrompt) {
        res.status(400).json({ error: 'No focused prompt' })
        return
    }
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! })
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-preview-image-generation',
            contents: focusedPrompt.text,
            config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
        })
        const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)
        if (!imagePart?.inlineData) {
            res.status(500).json({ error: 'No image returned from Gemini' })
            return
        }
        const { data, mimeType } = imagePart.inlineData
        const ext = mimeType === 'image/png' ? 'png' : 'jpg'
        const filename = 'unnamed.' + ext
        const imageBuffer = Buffer.from(data!, 'base64')
        writePicFile(user.slug, workbook.workbookName, filename, imageBuffer)
        const pic: PicType = {
            createdAt: Date.now(),
            filename,
            mimeType: mimeType!,
        }
        const updated: WorkbookType = { ...workbook, pics: [...workbook.pics, pic] }
        writeWorkbook(user.slug, updated)
        res.json({ workbook: updated, image: data })
    } catch (err) {
        console.error('generate-pic error:', err)
        res.status(500).json({ error: 'Image generation failed' })
    }
})

router.get('/get-workbook', (req: Request, res: Response) => {
    const workbookName = req.query.workbookName as string
    const user = getUser(res)
    const workbook = readWorkbook(user.slug, workbookName)
    res.json(workbook)
})

router.get('/list-workbooks', (req: Request, res: Response) => {
    const user = getUser(res)
    const workbooks = listWorkbooks(user.slug)
    res.json({ workbooks })
})

router.post('/rename-pic', (req: Request, res: Response) => {
    const { workbook, newPicName }: { workbook: WorkbookType; newPicName: string } = req.body
    const user = getUser(res)
    const unnamedPic = workbook.pics.find(p => p.filename.startsWith('unnamed'))
    if (!unnamedPic) {
        res.status(400).json({ error: 'No unnamed pic found' })
        return
    }
    const ext = unnamedPic.filename.includes('.') ? '.' + unnamedPic.filename.split('.').pop() : ''
    const newFilename = newPicName + ext
    renamePicFile(user.slug, workbook.workbookName, unnamedPic.filename, newFilename)
    const updated: WorkbookType = {
        ...workbook,
        pics: workbook.pics.map(p =>
            p.filename === unnamedPic.filename ? { ...p, filename: newFilename } : p
        ),
    }
    writeWorkbook(user.slug, updated)
    res.status(200).end()
})

export default router
