import React from 'react'
import { useWorkbook } from '../WorkbookContext'
import ComposerButtonComponent from './ComposerButtonComponent'
import { ButtonIcons } from '../ButtonIcons'
import { extractOutputFilename, extractReferencedPics, stripCommandsAndComments } from '../promptProtocol'
import { stripForBackend, hydrateFromBackend } from '../workbookProtocol'
import { addFrame } from '../canvas'
import { PromptType } from '@billdestein/joy-common'

type Props = { editorText: string }

export default function ComposerButtonRowComponent({ editorText }: Props) {
    const { workbook, setWorkbook, setIsLoading, setSelectedPicFilename } = useWorkbook()

    const focusedIdx = workbook.prompts.findIndex(p => p.focused)
    const index = focusedIdx + 1
    const count = workbook.prompts.length

    function previousPrompt() {
        if (focusedIdx <= 0) return
        const prompts = workbook.prompts.map((p, i) => ({
            ...p,
            text: i === focusedIdx ? editorText : p.text,
            focused: i === focusedIdx - 1,
        }))
        setWorkbook({ ...workbook, prompts })
    }

    function nextPrompt() {
        if (focusedIdx >= count - 1) return
        const prompts = workbook.prompts.map((p, i) => ({
            ...p,
            text: i === focusedIdx ? editorText : p.text,
            focused: i === focusedIdx + 1,
        }))
        setWorkbook({ ...workbook, prompts })
    }

    async function runPrompt(outputFilename: string) {
        const referencedPics = extractReferencedPics(editorText, workbook.pics)
        const strippedText = stripCommandsAndComments(editorText)

        // Save the full editor text (with commands) into the current prompt so
        // it's visible when the user paginates back to it.
        const savedPrompts = workbook.prompts.map((p, i) =>
            i === focusedIdx ? { ...p, text: editorText } : p
        )
        // Send stripped text to the backend.
        const promptsToSend = savedPrompts.map((p, i) =>
            i === focusedIdx ? { ...p, text: strippedText } : p
        )
        const workbookToSend = stripForBackend({ ...workbook, prompts: promptsToSend })

        setIsLoading(true)
        try {
            const res = await fetch('/v1/workbooks/generate-pic', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ referencedPics, outputFilename, workbook: workbookToSend }),
            })
            if (!res.ok) {
                const err = await res.json()
                alert(`Generate failed: ${err.error}`)
                return
            }
            const data = await res.json()
            const hydrated = await hydrateFromBackend(data.workbook)

            // Use the frontend's prompts (with user text preserved) rather than
            // the backend's prompts (which come from disk and have empty text).
            const newPrompt: PromptType = { createdAt: Date.now(), focused: true, text: '' }
            const finalPrompts = savedPrompts.map(p => ({ ...p, focused: false })).concat(newPrompt)
            const final = { ...hydrated, prompts: finalPrompts }

            setWorkbook(final)
            setSelectedPicFilename(final.focusedPicFilename ?? 'empty')
        } finally {
            setIsLoading(false)
        }
    }

    function handlePlay() {
        const filename = extractOutputFilename(editorText)
        if (filename) {
            runPrompt(filename)
            return
        }
        import('../frames/PromptFrame').then(m => {
            addFrame(m.default, {
                message: {
                    prompt: 'Enter output filename',
                    onOk: (value: string) => { runPrompt(value) },
                    onClose: () => {},
                },
                isModal: true,
                width: 400,
                height: 200,
            })
        })
    }

    return (
        <div style={{
            height: 48,
            background: '#252526',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 8px',
            borderTop: '1px solid #444',
        }}>
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ComposerButtonComponent icon={ButtonIcons.previous} handler={previousPrompt} tooltipLabel="Previous Prompt" />
                <span style={{ color: '#ccc', fontSize: 12 }}>{index} of {count}</span>
                <ComposerButtonComponent icon={ButtonIcons.next} handler={nextPrompt} tooltipLabel="Next Prompt" />
            </div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <ComposerButtonComponent icon={ButtonIcons.play} handler={handlePlay} tooltipLabel="Run Prompt" />
            </div>
        </div>
    )
}
