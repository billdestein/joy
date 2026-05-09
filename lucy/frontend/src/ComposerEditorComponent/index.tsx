import Editor from '@monaco-editor/react'

export function ComposerEditorComponent() {
    return (
        <Editor
            height="100%"
            width="100%"
            defaultLanguage="plaintext"
            theme="vs-dark"
            options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'off',
                wordWrap: 'on',
                scrollBeyondLastLine: false,
            }}
        />
    )
}
