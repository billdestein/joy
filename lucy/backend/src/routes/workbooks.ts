import { Router, Request, Response } from 'express'
import { GoogleGenAI } from '@google/genai'
import { PicType } from '@billdestein/joy-common'
import { requireAuth } from '../middleware'
import {
    createWorkbookOnDisk,
    deleteWorkbookFromDisk,
    deletePicFile,
    listWorkbooksFromDisk,
    readWorkbook,
    renamePicFile,
    savePicFile,
    writeWorkbook,
} from '../fileSystem'

const router = Router()
router.use(requireAuth)

router.post('/create-workbook', async (req: Request, res: Response): Promise<void> => {
    try {
        const { workbookName } = req.body as { workbookName: string }
        if (!workbookName) { res.status(400).json({ error: 'workbookName required' }); return }
        createWorkbookOnDisk(req.user!.slug, workbookName)
        res.status(200).end()
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.post('/delete-pic', async (req: Request, res: Response): Promise<void> => {
    try {
        const { workbook, picName } = req.body as { workbook: { workbookName: string }, picName: string }
        const wb = readWorkbook(req.user!.slug, workbook.workbookName)
        wb.pics = wb.pics.filter(p => p.filename !== picName)
        writeWorkbook(req.user!.slug, workbook.workbookName, wb)
        deletePicFile(req.user!.slug, workbook.workbookName, picName)
        res.status(200).end()
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.post('/delete-workbook', async (req: Request, res: Response): Promise<void> => {
    try {
        const { workbookName } = req.body as { workbookName: string }
        const wb = readWorkbook(req.user!.slug, workbookName)
        for (const pic of wb.pics) {
            deletePicFile(req.user!.slug, workbookName, pic.filename)
        }
        deleteWorkbookFromDisk(req.user!.slug, workbookName)
        res.status(200).end()
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.post('/generate-pic', async (req: Request, res: Response): Promise<void> => {
    try {
        const { workbook } = req.body as { workbook: { workbookName: string } }
        const wb = readWorkbook(req.user!.slug, workbook.workbookName)

        const focusedPrompt = wb.prompts.find(p => p.focused)
        if (!focusedPrompt) { res.status(400).json({ error: 'No focused prompt' }); return }

        const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! })
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-preview-image-generation',
            contents: focusedPrompt.text,
            config: { responseModalities: ['IMAGE', 'TEXT'] },
        })

        const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)
        if (!imagePart?.inlineData?.data) {
            res.status(500).json({ error: 'No image generated' })
            return
        }

        const { data: imageData, mimeType = 'image/png' } = imagePart.inlineData
        savePicFile(req.user!.slug, workbook.workbookName, 'unnamed', Buffer.from(imageData, 'base64'))

        const pic: PicType = { createdAt: Date.now(), filename: 'unnamed', mimeType }
        wb.pics.push(pic)
        writeWorkbook(req.user!.slug, workbook.workbookName, wb)

        res.json({ workbook: wb, image: imageData })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.get('/get-workbook', async (req: Request, res: Response): Promise<void> => {
    try {
        const { workbookName } = req.query as { workbookName?: string }
        if (!workbookName) { res.status(400).json({ error: 'workbookName required' }); return }
        res.json(readWorkbook(req.user!.slug, workbookName))
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.get('/list-workbooks', async (req: Request, res: Response): Promise<void> => {
    try {
        res.json({ workbooks: listWorkbooksFromDisk(req.user!.slug) })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.post('/rename-pic', async (req: Request, res: Response): Promise<void> => {
    try {
        const { workbook, newPicName } = req.body as { workbook: { workbookName: string }, newPicName: string }
        const wb = readWorkbook(req.user!.slug, workbook.workbookName)
        const pic = wb.pics.find(p => p.filename === 'unnamed')
        if (!pic) { res.status(400).json({ error: 'No unnamed pic found' }); return }
        renamePicFile(req.user!.slug, workbook.workbookName, 'unnamed', newPicName)
        pic.filename = newPicName
        writeWorkbook(req.user!.slug, workbook.workbookName, wb)
        res.status(200).end()
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
