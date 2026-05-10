import { WorkbookType, PromptType } from '@billdestein/joy-common'
import { ComposerButtonComponent } from '../ComposerButtonComponent'
import { ButtonIcons } from '../ButtonIcons'

interface Props {
    getPrompt: () => string
    workbookName: string
    onImageGenerated: (encodedImage: string, mimeType: string) => void
}

export function ComposerButtonRowComponent({ getPrompt, workbookName, onImageGenerated }: Props) {
    function previousPrompt() {
        alert('previousPrompt')
    }

    function nextPrompt() {
        alert('nextPrompt')
    }

    async function runPrompt() {
        const text = getPrompt()

        const res = await fetch(`/v1/workbooks/get-workbook?workbookName=${encodeURIComponent(workbookName)}`, {
            credentials: 'include',
        })
        if (!res.ok) return
        const data = await res.json()
        const workbook: WorkbookType = data.workbook

        const newPrompt: PromptType = { createdAt: Date.now(), focused: true, text }
        const updatedPrompts: PromptType[] = workbook.prompts.map((p) => ({ ...p, focused: false }))
        updatedPrompts.push(newPrompt)
        workbook.prompts = updatedPrompts

        const genRes = await fetch('/v1/workbooks/generate-pic', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workbook }),
        })
        if (!genRes.ok) return

        const genData = await genRes.json() as { workbook: WorkbookType; encodedImage: string }
        const mimeType = genData.workbook.pics.find((p) => p.filename === 'unnamed')?.mimeType ?? 'image/png'
        onImageGenerated(genData.encodedImage, mimeType)
    }

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            borderTop: '1px solid #2a3a50',
            background: '#1a2533',
            flexShrink: 0,
        }}>
            <ComposerButtonComponent icon={ButtonIcons.previous} handler={previousPrompt} toolTipLabel="Previous Prompt" />
            <ComposerButtonComponent icon={ButtonIcons.next} handler={nextPrompt} toolTipLabel="Next Prompt" />
            <ComposerButtonComponent icon={ButtonIcons.play} handler={runPrompt} toolTipLabel="Run Prompt" />
        </div>
    )
}
