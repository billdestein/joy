import { Router } from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { PicType, WorkbookType } from '@billdestein/joy-common'
import { requireAuth } from '../middleware'
import {
    createWorkbookDir,
    readWorkbook,
    writeWorkbook,
    listWorkbooks,
    deleteWorkbookDir,
    deletePicFile,
    renamePicFile,
    writePicFile
} from '../fileSystem'

const router = Router()
router.use(requireAuth)

router.post('/create-workbook', async (req, res) => {
    try {
        const { workbookName } = req.body
        const { slug } = req.user!
        createWorkbookDir(slug, workbookName)
        const workbook: WorkbookType = { workbookName, pics: [], prompts: [] }
        writeWorkbook(slug, workbook)
        res.status(200).send()
    } catch {
        res.status(500).json({ error: 'Failed to create workbook' })
    }
})

router.get('/list-workbooks', async (req, res) => {
    try {
        const { slug } = req.user!
        const workbooks = listWorkbooks(slug)
        res.json({ workbooks })
    } catch {
        res.status(500).json({ error: 'Failed to list workbooks' })
    }
})

router.get('/get-workbook', async (req, res) => {
    try {
        const workbookName = req.query.workbookName as string
        const { slug } = req.user!
        const workbook = readWorkbook(slug, workbookName)
        res.json(workbook)
    } catch {
        res.status(500).json({ error: 'Failed to get workbook' })
    }
})

router.post('/delete-workbook', async (req, res) => {
    try {
        const { workbookName } = req.body
        const { slug } = req.user!
        deleteWorkbookDir(slug, workbookName)
        res.status(200).send()
    } catch {
        res.status(500).json({ error: 'Failed to delete workbook' })
    }
})

router.post('/generate-pic', async (req, res) => {
    try {
        const workbook: WorkbookType = req.body.workbook
        const { slug } = req.user!

        const focusedPrompt = workbook.prompts.find(p => p.focused)
        if (!focusedPrompt) {
            res.status(400).json({ error: 'No focused prompt' })
            return
        }

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-preview-image-generation' })

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: focusedPrompt.text }] }],
            generationConfig: { responseModalities: ['IMAGE', 'TEXT'] } as any
        })

        const imagePart = result.response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)
        if (!imagePart?.inlineData) {
            res.status(500).json({ error: 'No image in response' })
            return
        }

        const { data: imageData, mimeType } = imagePart.inlineData
        writePicFile(slug, workbook.workbookName, 'unnamed', Buffer.from(imageData, 'base64'))

        const pic: PicType = {
            createdAt: Date.now(),
            filename: 'unnamed',
            mimeType
        }
        workbook.pics.push(pic)
        writeWorkbook(slug, workbook)

        res.json({ workbook, image: imageData })
    } catch {
        res.status(500).json({ error: 'Failed to generate pic' })
    }
})

router.post('/rename-pic', async (req, res) => {
    try {
        const { workbook, newPicName }: { workbook: WorkbookType; newPicName: string } = req.body
        const { slug } = req.user!

        renamePicFile(slug, workbook.workbookName, 'unnamed', newPicName)

        const pic = workbook.pics.find(p => p.filename === 'unnamed')
        if (pic) pic.filename = newPicName
        writeWorkbook(slug, workbook)

        res.status(200).send()
    } catch {
        res.status(500).json({ error: 'Failed to rename pic' })
    }
})

router.post('/delete-pic', async (req, res) => {
    try {
        const { workbook, picName }: { workbook: WorkbookType; picName: string } = req.body
        const { slug } = req.user!

        deletePicFile(slug, workbook.workbookName, picName)

        workbook.pics = workbook.pics.filter(p => p.filename !== picName)
        writeWorkbook(slug, workbook)

        res.status(200).send()
    } catch {
        res.status(500).json({ error: 'Failed to delete pic' })
    }
})

export default router
