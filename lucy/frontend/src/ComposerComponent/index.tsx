import { useRef } from 'react'
import { ComposerEditorComponent } from '../ComposerEditorComponent'
import { ComposerButtonRowComponent } from '../ComposerButtonRowComponent'

interface EditorHandle {
    getValue: () => string
}

interface Props {
    workbookName: string
    onImageGenerated: (encodedImage: string, mimeType: string) => void
}

export function ComposerComponent({ workbookName, onImageGenerated }: Props) {
    const editorRef = useRef<EditorHandle | null>(null)

    function getPrompt() {
        return editorRef.current?.getValue() ?? ''
    }

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <ComposerEditorComponent editorRef={editorRef} />
            </div>
            <ComposerButtonRowComponent
                getPrompt={getPrompt}
                workbookName={workbookName}
                onImageGenerated={onImageGenerated}
            />
        </div>
    )
}
