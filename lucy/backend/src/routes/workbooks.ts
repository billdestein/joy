import { Router, Response } from 'express'
import { GoogleGenAI } from '@google/genai'
import { WorkbookType, PicType } from '@billdestein/joy-common'
import { AuthRequest } from '../middleware'
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

router.post('/create-workbook', async (req: AuthRequest, res: Response): Promise<void> => {
    const { workbookName } = req.body
    const slug = req.user!.slug
    const workbook: WorkbookType = {
        createdAt: Date.now(),
        pics: [],
        prompts: [],
        workbookName,
    }
    writeWorkbook(slug, workbook)
    res.status(200).end()
})

router.post('/delete-pic', async (req: AuthRequest, res: Response): Promise<void> => {
    const { workbook, picName }: { workbook: WorkbookType; picName: string } = req.body
    const slug = req.user!.slug
    const updated: WorkbookType = {
        ...workbook,
        pics: workbook.pics.filter(p => p.filename !== picName),
    }
    writeWorkbook(slug, updated)
    deletePicFile(slug, workbook.workbookName, picName)
    res.status(200).end()
})

router.post('/delete-workbook', async (req: AuthRequest, res: Response): Promise<void> => {
    const { workbookName } = req.body
    const slug = req.user!.slug
    deleteWorkbook(slug, workbookName)
    const workbooks = listWorkbooks(slug)
    res.json({ workbooks })
})

router.post('/generate-pic', async (req: AuthRequest, res: Response): Promise<void> => {
    const { imageFilename, workbook }: { imageFilename: string; workbook: WorkbookType } = req.body
    const slug = req.user!.slug

    const focusedPrompt = workbook.prompts.find(p => p.focused)
    const promptText = focusedPrompt?.text ?? ''

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! })
        const result = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: promptText,
            config: { numberOfImages: 1 },
        })

        const encodedImage = result.generatedImages?.[0]?.image?.imageBytes
        const mimeType = result.generatedImages?.[0]?.image?.mimeType ?? 'image/png'

        if (!encodedImage) {
            res.status(500).json({ error: 'No image returned from Gemini' })
            return
        }

        writePicFile(slug, workbook.workbookName, imageFilename, Buffer.from(encodedImage, 'base64'))

        const newPic: PicType = {
            createdAt: Date.now(),
            filename: imageFilename,
            mimeType,
        }

        const updatedWorkbook: WorkbookType = {
            ...workbook,
            pics: [...workbook.pics.filter(p => p.filename !== imageFilename), newPic],
        }
        writeWorkbook(slug, updatedWorkbook)

        res.json({ encodedImage, mimeType, workbook: updatedWorkbook })
    } catch (err) {
        console.error('generate-pic error:', err)
        res.status(500).json({ error: String(err) })
    }
})

router.get('/get-workbook', async (req: AuthRequest, res: Response): Promise<void> => {
    const workbookName = req.query.workbookName as string
    const slug = req.user!.slug
    try {
        const workbook = readWorkbook(slug, workbookName)
        res.json({ workbook })
    } catch {
        res.status(404).json({ error: 'Workbook not found' })
    }
})

router.get('/list-workbooks', async (req: AuthRequest, res: Response): Promise<void> => {
    const slug = req.user!.slug
    const workbooks = listWorkbooks(slug)
    res.json({ workbooks })
})

router.post('/rename-pic', async (req: AuthRequest, res: Response): Promise<void> => {
    const { workbook, newPicName }: { workbook: WorkbookType; newPicName: string } = req.body
    const slug = req.user!.slug

    renamePicFile(slug, workbook.workbookName, 'unnamed', newPicName)

    const updatedWorkbook: WorkbookType = {
        ...workbook,
        pics: workbook.pics.map(p =>
            p.filename === 'unnamed' ? { ...p, filename: newPicName } : p
        ),
    }
    writeWorkbook(slug, updatedWorkbook)
    res.status(200).end()
})

export default router
