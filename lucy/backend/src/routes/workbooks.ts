import { Router, Request, Response } from 'express'
import * as fs from 'fs'
import * as path from 'path'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { WorkbookType, PicType } from '@billdestein/joy-common'
import { sessionMiddleware } from '../middleware'
import { readWorkbook, writeWorkbook, workbookDir, listWorkbooks } from '../fileSystem'

const router = Router()

router.use(sessionMiddleware)

router.post('/create-workbook', async (req: Request, res: Response): Promise<void> => {
    const { workbookName } = req.body
    const workbook: WorkbookType = { workbookName, pics: [], prompts: [] }
    writeWorkbook(req.user!.slug, workbook)
    res.status(200).end()
})

router.post('/delete-pic', async (req: Request, res: Response): Promise<void> => {
    const { workbook, picName } = req.body
    const slug = req.user!.slug
    const wb = readWorkbook(slug, workbook.workbookName)
    wb.pics = wb.pics.filter(p => p.filename !== picName)
    const picPath = path.join(workbookDir(slug, workbook.workbookName), picName)
    if (fs.existsSync(picPath)) fs.unlinkSync(picPath)
    writeWorkbook(slug, wb)
    res.status(200).end()
})

router.post('/delete-workbook', async (req: Request, res: Response): Promise<void> => {
    const { workbookName } = req.body
    const dir = workbookDir(req.user!.slug, workbookName)
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true })
    res.status(200).end()
})

router.post('/generate-pic', async (req: Request, res: Response): Promise<void> => {
    try {
        const { workbook } = req.body
        const slug = req.user!.slug

        const focusedPrompt = (workbook.prompts as Array<{ focused: boolean; text: string }>)
            .find(p => p.focused)?.text
        if (!focusedPrompt) {
            res.status(400).json({ error: 'No focused prompt' })
            return
        }

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)
        const model = genAI.getGenerativeModel({ model: 'imagen-3.0-generate-002' })
        const result = await model.generateContent(focusedPrompt)
        const imagePart = result.response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)
        if (!imagePart?.inlineData) {
            res.status(500).json({ error: 'No image returned from Gemini' })
            return
        }

        const { mimeType, data } = imagePart.inlineData
        const ext = mimeType === 'image/png' ? 'png' : 'jpg'
        const filename = `unnamed.${ext}`

        const dir = workbookDir(slug, workbook.workbookName)
        fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(path.join(dir, filename), Buffer.from(data, 'base64'))

        const wb = readWorkbook(slug, workbook.workbookName)
        const pic: PicType = { createdAt: Date.now(), filename, mimeType }
        wb.pics.push(pic)
        writeWorkbook(slug, wb)

        res.json({ workbook: wb, encodedImage: data })
    } catch (err) {
        res.status(500).json({ error: 'Image generation failed' })
    }
})

router.get('/get-workbook', async (req: Request, res: Response): Promise<void> => {
    const { workbookName } = req.query as { workbookName: string }
    const workbook = readWorkbook(req.user!.slug, workbookName)
    res.json(workbook)
})

router.get('/list-workbooks', async (req: Request, res: Response): Promise<void> => {
    const workbooks = listWorkbooks(req.user!.slug)
    res.json({ workbooks })
})

router.post('/rename-pic', async (req: Request, res: Response): Promise<void> => {
    const { workbook, newPicName } = req.body
    const slug = req.user!.slug
    const wb = readWorkbook(slug, workbook.workbookName)

    const unnamedPic = wb.pics.find(p => p.filename.startsWith('unnamed'))
    if (!unnamedPic) {
        res.status(404).json({ error: 'No unnamed pic found' })
        return
    }

    const ext = path.extname(unnamedPic.filename)
    const newFilename = `${newPicName}${ext}`
    const dir = workbookDir(slug, workbook.workbookName)
    fs.renameSync(path.join(dir, unnamedPic.filename), path.join(dir, newFilename))
    unnamedPic.filename = newFilename

    writeWorkbook(slug, wb)
    res.status(200).end()
})

export default router
