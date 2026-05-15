import React, { useState, useEffect } from 'react'
import { useWorkbook } from '../WorkbookContext'
import ComposerEditorComponent from './ComposerEditorComponent'
import ComposerButtonRowComponent from './ComposerButtonRowComponent'

export default function ComposerComponent() {
    const { workbook } = useWorkbook()
    const [editorText, setEditorText] = useState('')

    useEffect(() => {
        const focused = workbook.prompts.find(p => p.focused)
        setEditorText(focused?.text ?? '')
    }, [workbook.prompts])

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <ComposerEditorComponent value={editorText} onChange={setEditorText} />
            </div>
            <div style={{ flexShrink: 0 }}>
                <ComposerButtonRowComponent editorText={editorText} />
            </div>
        </div>
    )
}
