import { Router, Request, Response } from 'express'
import { sessionMiddleware } from '../middleware/session'
import { generateImage } from '../services/gemini'
import * as workbookService from '../services/workbook-service'

export const workbooksRouter = Router()
workbooksRouter.use(sessionMiddleware)

workbooksRouter.post('/create-workbook', async (req: Request, res: Response) => {
    try {
        const { workbookName } = req.body as { workbookName: string }
        await workbookService.createWorkbook(req.user!.slug, workbookName)
        res.status(200).end()
    } catch {
        res.status(500).json({ error: 'Failed to create workbook' })
    }
})

workbooksRouter.post('/delete-pic', async (req: Request, res: Response) => {
    try {
        const { workbook, picName } = req.body as { workbook: string; picName: string }
        await workbookService.deletePic(req.user!.slug, workbook, picName)
        res.status(200).end()
    } catch {
        res.status(500).json({ error: 'Failed to delete pic' })
    }
})

workbooksRouter.post('/delete-workbook', async (req: Request, res: Response) => {
    try {
        const { workbookName } = req.body as { workbookName: string }
        await workbookService.deleteWorkbook(req.user!.slug, workbookName)
        res.status(200).end()
    } catch {
        res.status(500).json({ error: 'Failed to delete workbook' })
    }
})

workbooksRouter.post('/generate-pic', async (req: Request, res: Response) => {
    try {
        const { workbook } = req.body as { workbook: string }
        const wb = await workbookService.getWorkbook(req.user!.slug, workbook)
        const focusedPrompt = wb.prompts.find(p => p.focused)
        if (!focusedPrompt) {
            return res.status(400).json({ error: 'No focused prompt found' })
        }
        const { data, mimeType } = await generateImage(focusedPrompt.text)
        const updatedWorkbook = await workbookService.savePic(req.user!.slug, workbook, data, mimeType)
        res.status(200).json({
            workbook: updatedWorkbook,
            image: data.toString('base64'),
        })
    } catch {
        res.status(500).json({ error: 'Failed to generate pic' })
    }
})

workbooksRouter.get('/get-workbook', async (req: Request, res: Response) => {
    try {
        const workbookName = req.query.workbookName as string
        const workbook = await workbookService.getWorkbook(req.user!.slug, workbookName)
        res.status(200).json(workbook)
    } catch {
        res.status(500).json({ error: 'Failed to get workbook' })
    }
})

workbooksRouter.get('/list-workbooks', async (req: Request, res: Response) => {
    try {
        const workbooks = await workbookService.listWorkbooks(req.user!.slug)
        res.status(200).json({ workbooks })
    } catch {
        res.status(500).json({ error: 'Failed to list workbooks' })
    }
})

workbooksRouter.post('/rename-pic', async (req: Request, res: Response) => {
    try {
        const { workbook, newPicName } = req.body as { workbook: string; newPicName: string }
        await workbookService.renamePic(req.user!.slug, workbook, newPicName)
        res.status(200).end()
    } catch {
        res.status(500).json({ error: 'Failed to rename pic' })
    }
})
