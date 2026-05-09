import { Router, Request, Response } from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { WorkbookType, PicType } from '@billdestein/joy-common'
import { AuthenticatedRequest } from '../middleware'
import {
    listWorkbooks,
    createWorkbook,
    readWorkbook,
    writeWorkbook,
    deleteWorkbook,
    savePicFile,
    deletePicFile,
    renamePicFile,
} from '../fileSystem'

const router = Router()

router.get('/list-workbooks', async (req: Request, res: Response): Promise<void> => {
    const { slug } = (req as AuthenticatedRequest).user
    try {
        const workbooks = listWorkbooks(slug)
        res.json({ workbooks })
    } catch (err) {
        console.error('list-workbooks error:', err)
        res.status(500).json({ error: 'Failed to list workbooks' })
    }
})

router.get('/get-workbook', async (req: Request, res: Response): Promise<void> => {
    const { slug } = (req as AuthenticatedRequest).user
    const workbookName = req.query['workbookName'] as string
    if (!workbookName) {
        res.status(400).json({ error: 'Missing workbookName' })
        return
    }
    try {
        const workbook = readWorkbook(slug, workbookName)
        res.json({ workbook })
    } catch (err) {
        console.error('get-workbook error:', err)
        res.status(500).json({ error: 'Failed to get workbook' })
    }
})

router.post('/create-workbook', async (req: Request, res: Response): Promise<void> => {
    const { slug } = (req as AuthenticatedRequest).user
    const { workbookName } = req.body as { workbookName: string }
    if (!workbookName) {
        res.status(400).json({ error: 'Missing workbookName' })
        return
    }
    try {
        createWorkbook(slug, workbookName)
        res.status(200).send()
    } catch (err) {
        console.error('create-workbook error:', err)
        res.status(500).json({ error: 'Failed to create workbook' })
    }
})

router.post('/delete-workbook', async (req: Request, res: Response): Promise<void> => {
    const { slug } = (req as AuthenticatedRequest).user
    const { workbookName } = req.body as { workbookName: string }
    if (!workbookName) {
        res.status(400).json({ error: 'Missing workbookName' })
        return
    }
    try {
        deleteWorkbook(slug, workbookName)
        res.status(200).send()
    } catch (err) {
        console.error('delete-workbook error:', err)
        res.status(500).json({ error: 'Failed to delete workbook' })
    }
})

router.post('/delete-pic', async (req: Request, res: Response): Promise<void> => {
    const { slug } = (req as AuthenticatedRequest).user
    const { workbook, picName } = req.body as { workbook: WorkbookType; picName: string }
    try {
        const updated: WorkbookType = {
            ...workbook,
            pics: workbook.pics.filter((p) => p.filename !== picName),
        }
        writeWorkbook(slug, updated)
        deletePicFile(slug, workbook.workbookName, picName)
        res.status(200).send()
    } catch (err) {
        console.error('delete-pic error:', err)
        res.status(500).json({ error: 'Failed to delete pic' })
    }
})

router.post('/rename-pic', async (req: Request, res: Response): Promise<void> => {
    const { slug } = (req as AuthenticatedRequest).user
    const { workbook, newPicName } = req.body as { workbook: WorkbookType; newPicName: string }
    const OLD_NAME = 'unnamed'
    try {
        renamePicFile(slug, workbook.workbookName, OLD_NAME, newPicName)
        const updated: WorkbookType = {
            ...workbook,
            pics: workbook.pics.map((p) =>
                p.filename === OLD_NAME ? { ...p, filename: newPicName } : p
            ),
        }
        writeWorkbook(slug, updated)
        res.status(200).send()
    } catch (err) {
        console.error('rename-pic error:', err)
        res.status(500).json({ error: 'Failed to rename pic' })
    }
})

router.post('/generate-pic', async (req: Request, res: Response): Promise<void> => {
    const { slug } = (req as AuthenticatedRequest).user
    const { workbook } = req.body as { workbook: WorkbookType }

    const focusedPrompt = workbook.prompts.find((p) => p.focused)
    if (!focusedPrompt) {
        res.status(400).json({ error: 'No focused prompt' })
        return
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-preview-image-generation',
        })

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: focusedPrompt.text }] }],
            generationConfig: { responseModalities: ['TEXT', 'IMAGE'] } as never,
        })

        const parts = result.response.candidates?.[0]?.content?.parts ?? []
        let imageBase64 = ''
        let mimeType = 'image/png'

        for (const part of parts) {
            if (part.inlineData) {
                imageBase64 = part.inlineData.data ?? ''
                mimeType = part.inlineData.mimeType ?? 'image/png'
                break
            }
        }

        if (!imageBase64) {
            res.status(500).json({ error: 'No image in Gemini response' })
            return
        }

        const imageBuffer = Buffer.from(imageBase64, 'base64')
        savePicFile(slug, workbook.workbookName, 'unnamed', imageBuffer)

        const newPic: PicType = {
            createdAt: Date.now(),
            filename: 'unnamed',
            mimeType,
        }
        const updated: WorkbookType = {
            ...workbook,
            pics: [...workbook.pics.filter((p) => p.filename !== 'unnamed'), newPic],
        }
        writeWorkbook(slug, updated)

        res.json({ workbook: updated, encodedImage: imageBase64 })
    } catch (err) {
        console.error('generate-pic error:', err)
        res.status(500).json({ error: 'Failed to generate pic' })
    }
})

export default router
