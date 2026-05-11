import React from 'react'
import ComposerButtonComponent from '../ComposerButtonComponent'
import { ButtonIcons } from '../ButtonIcons'
import { WorkbookType, PromptType } from '@billdestein/joy-common'
import * as api from '../api'

type Props = {
    workbook: WorkbookType
    onWorkbookUpdate: (workbook: WorkbookType, encodedImage: string, mimeType: string) => void
    editorRef: React.MutableRefObject<import('monaco-editor').editor.IStandaloneCodeEditor | null>
    onGenerating: (generating: boolean) => void
}

export default function ComposerButtonRowComponent({ workbook, onWorkbookUpdate, editorRef, onGenerating }: Props) {
    function previousPrompt() {
        alert('previousPrompt')
    }

    function nextPrompt() {
        alert('nextPrompt')
    }

    async function runPrompt() {
        const text = editorRef.current?.getValue() ?? ''
        const newPrompt: PromptType = {
            createdAt: Date.now(),
            focused: true,
            text,
        }
        const updatedPrompts = [
            ...workbook.prompts.map(p => ({ ...p, focused: false })),
            newPrompt,
        ]
        const updatedWorkbook: WorkbookType = { ...workbook, prompts: updatedPrompts }

        onGenerating(true)
        try {
            const result = await api.generatePic(updatedWorkbook)
            const mimeType = result.workbook.pics.find(p => p.filename === 'unnamed')?.mimeType ?? 'image/png'
            onWorkbookUpdate(result.workbook, result.encodedImage, mimeType)
        } finally {
            onGenerating(false)
        }
    }

    return (
        <div style={{
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 6px',
            gap: '4px',
            background: '#1a1a1a',
            borderTop: '1px solid #333',
            flexShrink: 0,
        }}>
            <ComposerButtonComponent icon={ButtonIcons.previous} handler={previousPrompt} tooltipLabel="Previous Prompt" />
            <ComposerButtonComponent icon={ButtonIcons.next} handler={nextPrompt} tooltipLabel="Next Prompt" />
            <ComposerButtonComponent icon={ButtonIcons.play} handler={runPrompt} tooltipLabel="Run Prompt" />
        </div>
    )
}
