import Editor, { OnMount } from '@monaco-editor/react'

interface EditorHandle {
    getValue: () => string
}

interface Props {
    editorRef: React.MutableRefObject<EditorHandle | null>
}

export function ComposerEditorComponent({ editorRef }: Props) {
    const handleMount: OnMount = (editor) => {
        editorRef.current = { getValue: () => editor.getValue() }
    }

    return (
        <Editor
            height="100%"
            width="100%"
            defaultLanguage="plaintext"
            theme="vs-dark"
            onMount={handleMount}
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
