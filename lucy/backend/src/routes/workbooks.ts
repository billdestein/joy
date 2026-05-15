import { Router, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import { PicType, WorkbookType } from '@billdestein/joy-common'
import { AuthenticatedRequest } from '../middleware/session'
import { workbookDir, workbookJsonPath, picPath, readWorkbook, saveWorkbook, listWorkbooks } from '../services/files'
import { getAiClient } from '../services/gemini'

const router = Router()

function user(req: Request) {
    return (req as AuthenticatedRequest).user
}

router.post('/create-workbook', async (req: Request, res: Response): Promise<void> => {
    try {
        const { workbookName } = req.body as { workbookName: string }
        const { slug } = user(req)

        fs.mkdirSync(workbookDir(slug, workbookName), { recursive: true })

        const workbook: WorkbookType = {
            createdAt: Date.now(),
            focusedPicFilename: 'empty',
            pics: [{ createdAt: Date.now(), encodedImage: '', filename: 'empty', mimeType: '' }],
            prompts: [{ createdAt: Date.now(), focused: true, text: '' }],
            workbookName,
        }

        saveWorkbook(slug, workbookName, workbook)
        res.status(200).end()
    } catch (err: any) {
        console.error('create-workbook error:', err)
        res.status(500).json({ error: err.message })
    }
})

router.post('/clone-workbook', async (req: Request, res: Response): Promise<void> => {
    try {
        const { workbook, newWorkbookName } = req.body as { workbook: WorkbookType; newWorkbookName: string }
        const { slug } = user(req)

        const srcDir = workbookDir(slug, workbook.workbookName)
        const dstDir = workbookDir(slug, newWorkbookName)
        fs.mkdirSync(dstDir, { recursive: true })

        for (const pic of workbook.pics) {
            if (pic.filename === 'empty') continue
            const src = path.join(srcDir, pic.filename)
            const dst = path.join(dstDir, pic.filename)
            if (fs.existsSync(src)) fs.copyFileSync(src, dst)
        }

        const cloned: WorkbookType = {
            createdAt: Date.now(),
            focusedPicFilename: workbook.focusedPicFilename,
            pics: workbook.pics.map(p => ({ ...p, encodedImage: '' })),
            prompts: workbook.prompts.map(p => ({ ...p })),
            workbookName: newWorkbookName,
        }

        saveWorkbook(slug, newWorkbookName, cloned)
        res.status(200).end()
    } catch (err: any) {
        console.error('clone-workbook error:', err)
        res.status(500).json({ error: err.message })
    }
})

router.post('/delete-pic', async (req: Request, res: Response): Promise<void> => {
    try {
        const { workbook, picName } = req.body as { workbook: WorkbookType; picName: string }
        const { slug } = user(req)

        const wb = readWorkbook(slug, workbook.workbookName)
        wb.pics = wb.pics.filter(p => p.filename !== picName)

        if (picName !== 'empty') {
            const filePath = picPath(slug, workbook.workbookName, picName)
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
        }

        saveWorkbook(slug, workbook.workbookName, wb)
        res.status(200).end()
    } catch (err: any) {
        console.error('delete-pic error:', err)
        res.status(500).json({ error: err.message })
    }
})

router.post('/delete-workbook', async (req: Request, res: Response): Promise<void> => {
    try {
        const { workbookName } = req.body as { workbookName: string }
        const { slug } = user(req)

        const dir = workbookDir(slug, workbookName)
        if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true })

        const workbooks = listWorkbooks(slug)
        res.status(200).json({ workbooks })
    } catch (err: any) {
        console.error('delete-workbook error:', err)
        res.status(500).json({ error: err.message })
    }
})

router.post('/generate-pic', async (req: Request, res: Response): Promise<void> => {
    try {
        const { referencedPics: _referencedPics, outputFilename, workbook } = req.body as {
            referencedPics: PicType[]
            outputFilename: string
            workbook: WorkbookType
        }
        const { slug } = user(req)

        const focusedPrompt = workbook.prompts.find(p => p.focused)
        const promptText = focusedPrompt?.text ?? ''

        let imageBuffer: Buffer

        if (!workbook.focusedPicFilename || workbook.focusedPicFilename === 'empty') {
            const response = await getAiClient().models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: promptText,
                config: { numberOfImages: 1 },
            })
            const b64 = response.generatedImages![0].image!.imageBytes as string
            imageBuffer = Buffer.from(b64, 'base64')
        } else {
            const srcPath = picPath(slug, workbook.workbookName, workbook.focusedPicFilename)
            const srcPic = workbook.pics.find(p => p.filename === workbook.focusedPicFilename)
            const mimeType = srcPic?.mimeType ?? 'image/png'
            const srcBytes = fs.readFileSync(srcPath)
            const sourceBase64 = srcBytes.toString('base64')

            const response = await getAiClient().models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: [
                    { inlineData: { data: sourceBase64, mimeType } },
                    { text: promptText },
                ],
            })

            const parts = response.candidates![0].content!.parts
            const imagePart = (parts as any[]).find(p => p.inlineData)
            if (!imagePart?.inlineData?.data) {
                res.status(500).json({ error: 'No image in Gemini response' })
                return
            }
            imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64')
        }

        const outPath = picPath(slug, workbook.workbookName, outputFilename)
        fs.writeFileSync(outPath, imageBuffer)

        const newPic: PicType = {
            createdAt: Date.now(),
            encodedImage: '',
            filename: outputFilename,
            mimeType: 'image/png',
        }

        const wb = readWorkbook(slug, workbook.workbookName)
        wb.pics.push(newPic)
        wb.focusedPicFilename = outputFilename
        saveWorkbook(slug, workbook.workbookName, wb)

        res.status(200).json({ workbook: wb })
    } catch (err: any) {
        console.error('generate-pic error:', err)
        res.status(500).json({ error: err.message })
    }
})

router.post('/upload-pic', async (req: Request, res: Response): Promise<void> => {
    try {
        const { workbookName, imageFilename, imageData, mimeType } = req.body as {
            workbookName: string
            imageFilename: string
            imageData: string
            mimeType: string
        }
        const { slug } = user(req)

        const buf = Buffer.from(imageData, 'base64')
        fs.writeFileSync(picPath(slug, workbookName, imageFilename), buf)

        const wb = readWorkbook(slug, workbookName)
        const newPic: PicType = { createdAt: Date.now(), encodedImage: '', filename: imageFilename, mimeType }
        wb.pics.push(newPic)
        wb.focusedPicFilename = imageFilename
        saveWorkbook(slug, workbookName, wb)

        res.status(200).json({ workbook: wb })
    } catch (err: any) {
        console.error('upload-pic error:', err)
        res.status(500).json({ error: err.message })
    }
})

router.post('/upload-pic-from-url', async (req: Request, res: Response): Promise<void> => {
    try {
        const { workbookName, imageUrl, imageFilename } = req.body as {
            workbookName: string
            imageUrl: string
            imageFilename: string
        }
        const { slug } = user(req)

        let fetchResponse: globalThis.Response
        try {
            fetchResponse = await fetch(imageUrl)
        } catch (err: any) {
            res.status(502).json({ error: `Failed to fetch image: ${err.message}` })
            return
        }

        const contentType = fetchResponse.headers.get('content-type') ?? 'image/jpeg'
        const mimeType = contentType.split(';')[0].trim()

        const arrayBuffer = await fetchResponse.arrayBuffer()
        const buf = Buffer.from(arrayBuffer)
        fs.writeFileSync(picPath(slug, workbookName, imageFilename), buf)

        const wb = readWorkbook(slug, workbookName)
        const newPic: PicType = { createdAt: Date.now(), encodedImage: '', filename: imageFilename, mimeType }
        wb.pics.push(newPic)
        wb.focusedPicFilename = imageFilename
        saveWorkbook(slug, workbookName, wb)

        res.status(200).json({ workbook: wb })
    } catch (err: any) {
        console.error('upload-pic-from-url error:', err)
        res.status(500).json({ error: err.message })
    }
})

router.get('/get-pic', async (req: Request, res: Response): Promise<void> => {
    try {
        const { workbookName, picFilename } = req.query as { workbookName: string; picFilename: string }
        const { slug } = user(req)

        const filePath = picPath(slug, workbookName, picFilename)
        const buf = fs.readFileSync(filePath)
        res.status(200).json({ encodedImage: buf.toString('base64') })
    } catch (err: any) {
        console.error('get-pic error:', err)
        res.status(500).json({ error: err.message })
    }
})

router.get('/get-workbook', async (req: Request, res: Response): Promise<void> => {
    try {
        const { workbookName } = req.query as { workbookName: string }
        const { slug } = user(req)
        const workbook = readWorkbook(slug, workbookName)
        res.status(200).json({ workbook })
    } catch (err: any) {
        console.error('get-workbook error:', err)
        res.status(500).json({ error: err.message })
    }
})

router.get('/list-workbooks', async (req: Request, res: Response): Promise<void> => {
    try {
        const { slug } = user(req)
        const workbooks = listWorkbooks(slug)
        res.status(200).json({ workbooks })
    } catch (err: any) {
        console.error('list-workbooks error:', err)
        res.status(500).json({ error: err.message })
    }
})

export default router
