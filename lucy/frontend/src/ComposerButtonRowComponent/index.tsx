import React from 'react'
import ComposerButtonComponent from '../ComposerButtonComponent'
import { ButtonIcons } from '../ButtonIcons'
import { WorkbookType, PromptType } from '@billdestein/joy-common'
import { addFrame } from '../Frames'
import PromptFrame from '../PromptFrame'
import * as api from '../api'
import * as Cache from '../Cache'

type Props = {
    workbook: WorkbookType
    onWorkbookUpdate: (workbook: WorkbookType) => void
    editorRef: React.MutableRefObject<import('monaco-editor').editor.IStandaloneCodeEditor | null>
    onGenerating: (generating: boolean) => void
}

function parsePrompt(rawText: string): { picName: string | null; cleanText: string } {
    let picName: string | null = null
    const cleanLines: string[] = []

    for (const line of rawText.split('\n')) {
        const trimmed = line.trimStart()
        if (trimmed.startsWith('//')) continue
        if (trimmed.startsWith('-- save as ')) {
            picName = trimmed.slice('-- save as '.length).trim().replace(/[.,;:!?'")\]]+$/, '')
            continue
        }
        cleanLines.push(line)
    }

    return { picName, cleanText: cleanLines.join('\n').trim() }
}

export default function ComposerButtonRowComponent({ workbook, onWorkbookUpdate, editorRef, onGenerating }: Props) {
    function previousPrompt() {
        alert('previousPrompt')
    }

    function nextPrompt() {
        alert('nextPrompt')
    }

    async function doGenerate(cleanText: string, imageFilename: string, currentWorkbook: WorkbookType) {
        const newPrompt: PromptType = {
            createdAt: Date.now(),
            focused: true,
            text: cleanText,
        }
        const updatedPrompts = [
            ...currentWorkbook.prompts.map(p => ({ ...p, focused: false })),
            newPrompt,
        ]
        const updatedWorkbook: WorkbookType = { ...currentWorkbook, prompts: updatedPrompts }

        onGenerating(true)
        try {
            const result = await api.generatePic(updatedWorkbook, imageFilename)
            const refreshed = await Cache.refresh(result.workbook)
            onWorkbookUpdate(refreshed)
        } finally {
            onGenerating(false)
        }
    }

    function runPrompt() {
        const rawText = editorRef.current?.getValue() ?? ''
        const { picName, cleanText } = parsePrompt(rawText)

        if (!picName) {
            addFrame(PromptFrame, {
                width: 360,
                height: 170,
                isModal: true,
                message: {
                    prompt: 'Enter a name for your new image',
                    onOk: (name: string) => { doGenerate(cleanText, name, workbook) },
                },
            })
            return
        }

        doGenerate(cleanText, picName, workbook)
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
