import { Router } from 'express'
import fs from 'fs'
import { GoogleGenAI } from '@google/genai'
import { WorkbookType, PicType } from '@billdestein/joy-common'
import { authMiddleware } from '../middleware'
import { createWorkbook, deleteWorkbook, listWorkbooks, readWorkbook, writeWorkbook, picPath } from '../fileSystem'
import { User } from '../user'

const router = Router()
router.use(authMiddleware)

function mountDir(): string {
    return process.env.MOUNT_DIR!
}

router.post('/create-workbook', async (req, res) => {
    const user: User = res.locals.user
    const { workbookName } = req.body
    createWorkbook(mountDir(), user.slug, workbookName)
    res.json({})
})

router.post('/delete-pic', async (req, res) => {
    const user: User = res.locals.user
    const { workbook, picName }: { workbook: WorkbookType; picName: string } = req.body
    const wb = readWorkbook(mountDir(), user.slug, workbook.workbookName)
    wb.pics = wb.pics.filter(p => p.filename !== picName)
    writeWorkbook(mountDir(), user.slug, wb)
    const imgPath = picPath(mountDir(), user.slug, workbook.workbookName, picName)
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath)
    res.json({})
})

router.post('/delete-workbook', async (req, res) => {
    const user: User = res.locals.user
    const { workbookName } = req.body
    deleteWorkbook(mountDir(), user.slug, workbookName)
    res.json({})
})

router.post('/generate-pic', async (req, res) => {
    const user: User = res.locals.user
    const { workbook }: { workbook: WorkbookType } = req.body

    const focusedPrompt = workbook.prompts.find(p => p.focused)?.text
    if (!focusedPrompt) {
        res.status(400).json({ error: 'No focused prompt' })
        return
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! })
    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: focusedPrompt,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
    })

    const imageBytes = response.generatedImages?.[0]?.image?.imageBytes
    if (!imageBytes) {
        res.status(500).json({ error: 'No image generated' })
        return
    }

    const wb = readWorkbook(mountDir(), user.slug, workbook.workbookName)
    const imgFilePath = picPath(mountDir(), user.slug, workbook.workbookName, 'unnamed')
    fs.writeFileSync(imgFilePath, Buffer.from(imageBytes, 'base64'))

    const pic: PicType = { createdAt: Date.now(), filename: 'unnamed', mimeType: 'image/jpeg' }
    wb.pics.push(pic)
    writeWorkbook(mountDir(), user.slug, wb)

    res.json({ workbook: wb, encodedImage: imageBytes })
})

router.get('/get-workbook', async (req, res) => {
    const user: User = res.locals.user
    const { workbookName } = req.query as { workbookName: string }
    const wb = readWorkbook(mountDir(), user.slug, workbookName)
    res.json(wb)
})

router.get('/list-workbooks', async (req, res) => {
    const user: User = res.locals.user
    const workbooks = listWorkbooks(mountDir(), user.slug)
    res.json({ workbooks })
})

router.post('/rename-pic', async (req, res) => {
    const user: User = res.locals.user
    const { workbook, newPicName }: { workbook: WorkbookType; newPicName: string } = req.body

    const wb = readWorkbook(mountDir(), user.slug, workbook.workbookName)
    const pic = wb.pics.find(p => p.filename === 'unnamed')
    if (!pic) {
        res.status(404).json({ error: 'No unnamed pic found' })
        return
    }

    const oldPath = picPath(mountDir(), user.slug, workbook.workbookName, 'unnamed')
    const newPath = picPath(mountDir(), user.slug, workbook.workbookName, newPicName)
    fs.renameSync(oldPath, newPath)
    pic.filename = newPicName
    writeWorkbook(mountDir(), user.slug, wb)

    res.json({})
})

export default router
