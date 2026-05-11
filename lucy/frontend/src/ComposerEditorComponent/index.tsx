import React, { useRef } from 'react'
import Editor, { OnMount } from '@monaco-editor/react'

type Props = {
    editorRef: React.MutableRefObject<import('monaco-editor').editor.IStandaloneCodeEditor | null>
    initialText?: string
}

export default function ComposerEditorComponent({ editorRef, initialText }: Props) {
    const handleMount: OnMount = (editor) => {
        editorRef.current = editor
    }

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Editor
                height="100%"
                defaultLanguage="plaintext"
                defaultValue={initialText ?? ''}
                theme="vs-dark"
                onMount={handleMount}
                options={{
                    minimap: { enabled: false },
                    wordWrap: 'on',
                    fontSize: 13,
                    lineNumbers: 'off',
                    scrollBeyondLastLine: false,
                }}
            />
        </div>
    )
}
