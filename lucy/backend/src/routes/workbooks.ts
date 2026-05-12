import { Router, Request, Response } from 'express'
import { GoogleGenAI, Modality } from '@google/genai'
import { authMiddleware } from '../middleware'
import {
    createWorkbook,
    deleteWorkbook,
    deletePic,
    listWorkbooks,
    readWorkbook,
    writeWorkbook,
    writePicFile,
    readPicFile,
} from '../fileSystem'
import { PicType, WorkbookType } from '@billdestein/joy-common'

const router = Router()

router.use(authMiddleware)

const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! })

router.post('/create-workbook', async (req: Request, res: Response): Promise<void> => {
    const { workbookName } = req.body
    if (!workbookName) {
        res.status(400).json({ error: 'workbookName required' })
        return
    }
    createWorkbook(req.user!.slug, workbookName)
    res.status(200).end()
})

router.post('/delete-pic', async (req: Request, res: Response): Promise<void> => {
    const { workbook, picName } = req.body
    if (!workbook || !picName) {
        res.status(400).json({ error: 'workbook and picName required' })
        return
    }
    deletePic(req.user!.slug, workbook.workbookName, picName)
    res.status(200).end()
})

router.post('/delete-workbook', async (req: Request, res: Response): Promise<void> => {
    const { workbookName } = req.body
    if (!workbookName) {
        res.status(400).json({ error: 'workbookName required' })
        return
    }
    deleteWorkbook(req.user!.slug, workbookName)
    const workbooks = listWorkbooks(req.user!.slug)
    res.json({ workbooks })
})

router.post('/generate-pic', async (req: Request, res: Response): Promise<void> => {
    const { imageFilename, workbook } = req.body as { imageFilename: string; workbook: WorkbookType }
    if (!imageFilename || !workbook) {
        res.status(400).json({ error: 'imageFilename and workbook required' })
        return
    }
    const focusedPrompt = workbook.prompts.find(p => p.focused)
    if (!focusedPrompt) {
        res.status(400).json({ error: 'No focused prompt' })
        return
    }
    try {
        const result = await genai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: focusedPrompt.text,
            config: { numberOfImages: 1, outputMimeType: 'image/png' },
        })
        const image = result.generatedImages?.[0]?.image
        if (!image?.imageBytes || !image?.mimeType) {
            res.status(500).json({ error: 'No image returned from Gemini' })
            return
        }
        const encodedImage = image.imageBytes
        const mimeType = image.mimeType
        writePicFile(req.user!.slug, workbook.workbookName, imageFilename, encodedImage)
        const pic: PicType = {
            createdAt: Date.now(),
            encodedImage: '',
            filename: imageFilename,
            mimeType,
        }
        const updatedWorkbook = readWorkbook(req.user!.slug, workbook.workbookName)
        updatedWorkbook.pics.push(pic)
        writeWorkbook(req.user!.slug, updatedWorkbook)
        res.json({ workbook: updatedWorkbook })
    } catch (err) {
        console.error('generate-pic error:', err)
        res.status(500).json({ error: String(err) })
    }
})

router.get('/get-pic', async (req: Request, res: Response): Promise<void> => {
    const { workbookName, picFilename } = req.query as { workbookName: string; picFilename: string }
    if (!workbookName || !picFilename) {
        res.status(400).json({ error: 'workbookName and picFilename required' })
        return
    }
    try {
        const encodedImage = readPicFile(req.user!.slug, workbookName, picFilename)
        res.json({ encodedImage })
    } catch (err) {
        res.status(404).json({ error: 'Pic not found' })
    }
})

router.get('/get-workbook', async (req: Request, res: Response): Promise<void> => {
    const { workbookName } = req.query as { workbookName: string }
    if (!workbookName) {
        res.status(400).json({ error: 'workbookName required' })
        return
    }
    try {
        const workbook = readWorkbook(req.user!.slug, workbookName)
        res.json({ workbook })
    } catch (err) {
        res.status(404).json({ error: 'Workbook not found' })
    }
})

router.get('/list-workbooks', async (req: Request, res: Response): Promise<void> => {
    const workbooks = listWorkbooks(req.user!.slug)
    res.json({ workbooks })
})

export default router
