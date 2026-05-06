import { Router, Request, Response } from 'express'
import { WorkbookType } from '@billdestein/lucy-common'
import { sessionMiddleware } from '../middleware/session'
import * as workbookService from '../services/workbook-service'
import * as geminiService from '../services/gemini'

const router = Router()

router.use(sessionMiddleware)

router.post('/create-workbook', async (req: Request, res: Response): Promise<void> => {
    try {
        const { workbookName } = req.body as { workbookName: string }
        await workbookService.createWorkbook(req.user!.slug, workbookName)
        res.status(200).end()
    } catch (err) {
        console.error('create-workbook error:', err)
        res.status(500).json({ error: 'Failed to create workbook' })
    }
})

router.post('/delete-pic', async (req: Request, res: Response): Promise<void> => {
    try {
        const { workbook, picName } = req.body as { workbook: WorkbookType; picName: string }
        await workbookService.deletePic(req.user!.slug, workbook.workbookName, picName)
        res.status(200).end()
    } catch (err) {
        console.error('delete-pic error:', err)
        res.status(500).json({ error: 'Failed to delete pic' })
    }
})

router.post('/delete-workbook', async (req: Request, res: Response): Promise<void> => {
    try {
        const { workbookName } = req.body as { workbookName: string }
        await workbookService.deleteWorkbook(req.user!.slug, workbookName)
        res.status(200).end()
    } catch (err) {
        console.error('delete-workbook error:', err)
        res.status(500).json({ error: 'Failed to delete workbook' })
    }
})

router.post('/generate-pic', async (req: Request, res: Response): Promise<void> => {
    try {
        const { workbook } = req.body as { workbook: WorkbookType }
        const focusedPrompt = workbook.prompts.find(p => p.focused)
        if (!focusedPrompt) {
            res.status(400).json({ error: 'No focused prompt found' })
            return
        }

        const { data, mimeType } = await geminiService.generateImage(focusedPrompt.text)
        const updatedWorkbook = await workbookService.addGeneratedPic(
            req.user!.slug,
            workbook.workbookName,
            data,
            mimeType
        )

        res.json({ workbook: updatedWorkbook, image: data.toString('base64') })
    } catch (err) {
        console.error('generate-pic error:', err)
        res.status(500).json({ error: 'Failed to generate pic' })
    }
})

router.get('/get-workbook', async (req: Request, res: Response): Promise<void> => {
    try {
        const workbookName = req.query.workbookName as string
        const workbook = await workbookService.getWorkbook(req.user!.slug, workbookName)
        res.json(workbook)
    } catch (err) {
        console.error('get-workbook error:', err)
        res.status(500).json({ error: 'Failed to get workbook' })
    }
})

router.get('/list-workbooks', async (_req: Request, res: Response): Promise<void> => {
    try {
        const workbooks = await workbookService.listWorkbooks(_req.user!.slug)
        res.json({ workbooks })
    } catch (err) {
        console.error('list-workbooks error:', err)
        res.status(500).json({ error: 'Failed to list workbooks' })
    }
})

router.post('/rename-pic', async (req: Request, res: Response): Promise<void> => {
    try {
        const { workbook, newPicName } = req.body as { workbook: WorkbookType; newPicName: string }
        await workbookService.renamePic(req.user!.slug, workbook.workbookName, newPicName)
        res.status(200).end()
    } catch (err) {
        console.error('rename-pic error:', err)
        res.status(500).json({ error: 'Failed to rename pic' })
    }
})

export default router
