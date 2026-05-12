import React from 'react'
import MonacoEditor from '@monaco-editor/react'

interface Props {
    value: string
    onChange: (value: string) => void
}

export function ComposerEditorComponent({ value, onChange }: Props) {
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <MonacoEditor
                height="100%"
                defaultLanguage="plaintext"
                theme="vs-dark"
                value={value}
                onChange={(val) => onChange(val ?? '')}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                    scrollBeyondLastLine: false,
                }}
            />
        </div>
    )
}
