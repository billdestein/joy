import React, { useState } from 'react'
import { WorkbookType } from '@billdestein/joy-common'
import { ComposerEditorComponent } from '../ComposerEditorComponent'
import { ComposerButtonRowComponent } from '../ComposerButtonRowComponent'

interface Props {
    workbook: WorkbookType
    onWorkbookChange: (wb: WorkbookType) => void
}

export function ComposerComponent({ workbook, onWorkbookChange }: Props) {
    const [editorValue, setEditorValue] = useState('')

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <ComposerEditorComponent value={editorValue} onChange={setEditorValue} />
            </div>
            <ComposerButtonRowComponent
                editorValue={editorValue}
                workbook={workbook}
                onWorkbookChange={onWorkbookChange}
            />
        </div>
    )
}
