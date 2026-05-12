import React, { useRef } from 'react'
import ComposerEditorComponent from '../ComposerEditorComponent'
import ComposerButtonRowComponent from '../ComposerButtonRowComponent'
import { WorkbookType } from '@billdestein/joy-common'

type Props = {
    workbook: WorkbookType
    onWorkbookUpdate: (workbook: WorkbookType) => void
    onGenerating: (generating: boolean) => void
}

export default function ComposerComponent({ workbook, onWorkbookUpdate, onGenerating }: Props) {
    const editorRef = useRef<import('monaco-editor').editor.IStandaloneCodeEditor | null>(null)

    const focusedPrompt = workbook.prompts.find(p => p.focused)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <ComposerEditorComponent
                    editorRef={editorRef}
                    initialText={focusedPrompt?.text ?? ''}
                />
            </div>
            <ComposerButtonRowComponent
                workbook={workbook}
                onWorkbookUpdate={onWorkbookUpdate}
                editorRef={editorRef}
                onGenerating={onGenerating}
            />
        </div>
    )
}
