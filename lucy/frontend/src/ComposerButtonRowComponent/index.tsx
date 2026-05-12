import React from 'react'
import { WorkbookType, PromptType } from '@billdestein/joy-common'
import { ComposerButtonComponent } from '../ComposerButtonComponent'
import { ButtonIcons } from '../ButtonIcons'
import { addFrame } from '../Frames'
import { refresh } from '../cache'

interface Props {
    editorValue: string
    workbook: WorkbookType
    onWorkbookChange: (wb: WorkbookType) => void
}

function stripComments(text: string): string {
    return text
        .split('\n')
        .filter(line => !line.trimStart().startsWith('//'))
        .join('\n')
}

function extractSaveAs(text: string): { filename: string | null; cleanedText: string } {
    const lines = text.split('\n')
    let filename: string | null = null
    const remaining: string[] = []
    for (const line of lines) {
        const m = line.match(/^--\s*save\s+as\s+(.+)$/i)
        if (m) {
            filename = m[1].trim().replace(/[.,;:!?]+$/, '')
        } else {
            remaining.push(line)
        }
    }
    return { filename, cleanedText: remaining.join('\n') }
}

export function ComposerButtonRowComponent({ editorValue, workbook, onWorkbookChange }: Props) {
    function previousPrompt() {
        alert('previousPrompt')
    }

    function nextPrompt() {
        alert('nextPrompt')
    }

    async function runPrompt() {
        const stripped = stripComments(editorValue)
        const { filename: extractedFilename, cleanedText } = extractSaveAs(stripped)

        function doRun(imageFilename: string) {
            const now = Date.now()
            const newPrompt: PromptType = {
                createdAt: now,
                focused: true,
                text: cleanedText.trim(),
            }
            const updatedPrompts = workbook.prompts.map(p => ({ ...p, focused: false }))
            updatedPrompts.push(newPrompt)
            const updatedWorkbook: WorkbookType = { ...workbook, prompts: updatedPrompts }

            fetch('/v1/workbooks/generate-pic', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ imageFilename, workbook: updatedWorkbook }),
            })
                .then(res => {
                    if (!res.ok) throw new Error(`generate-pic failed: ${res.status}`)
                    return res.json()
                })
                .then(async (data) => {
                    const refreshed = await refresh(data.workbook as WorkbookType)
                    onWorkbookChange(refreshed)
                })
                .catch(err => {
                    console.error('generate-pic error:', err)
                    alert(`Error generating image: ${err.message}`)
                })

            onWorkbookChange(updatedWorkbook)
        }

        if (extractedFilename) {
            doRun(extractedFilename)
        } else {
            const { PromptFrame } = await import('../PromptFrame')
            addFrame(PromptFrame, {
                isModal: true,
                message: {
                    prompt: 'Enter a name for your new image',
                    onOk: (filename: string) => doRun(filename),
                },
            })
        }
    }

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                padding: '4px 8px',
                background: '#252526',
                borderTop: '1px solid #3a3a3a',
                gap: 4,
                flexShrink: 0,
            }}
        >
            <ComposerButtonComponent
                icon={ButtonIcons.previous}
                handler={previousPrompt}
                tooltipLabel="Previous Prompt"
            />
            <ComposerButtonComponent
                icon={ButtonIcons.next}
                handler={nextPrompt}
                tooltipLabel="Next Prompt"
            />
            <ComposerButtonComponent
                icon={ButtonIcons.play}
                handler={runPrompt}
                tooltipLabel="Run Prompt"
            />
        </div>
    )
}
