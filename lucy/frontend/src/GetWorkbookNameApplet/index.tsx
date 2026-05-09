import { useRef } from 'react'
import { canvas } from '../Frames'

type Props = {
    frameId: number
    onOk: (name: string) => void
}

export default function GetWorkbookNameApplet({ frameId, onOk }: Props) {
    const inputRef = useRef<HTMLInputElement>(null)

    const handleOk = () => {
        const name = inputRef.current?.value.trim() ?? ''
        if (!name) return
        onOk(name)
        canvas.removeFrame(frameId)
    }

    const handleCancel = () => {
        canvas.removeFrame(frameId)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleOk()
        if (e.key === 'Escape') handleCancel()
    }

    return (
        <div style={{
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            color: '#ccc',
            background: '#1a1a1a',
            height: '100%',
        }}>
            <div style={{ fontSize: 14 }}>Enter a name for the new workbook</div>
            <input
                ref={inputRef}
                type="text"
                autoFocus
                onKeyDown={handleKeyDown}
                style={{
                    background: '#2a2a2a',
                    border: '1px solid #555',
                    borderRadius: 4,
                    color: '#eee',
                    padding: '6px 10px',
                    fontSize: 14,
                    outline: 'none',
                }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={handleCancel} style={btnStyle('#333')}>Cancel</button>
                <button onClick={handleOk} style={btnStyle('#3a5a9a')}>OK</button>
            </div>
        </div>
    )
}

function btnStyle(bg: string): React.CSSProperties {
    return {
        background: bg,
        border: 'none',
        borderRadius: 4,
        color: '#eee',
        padding: '6px 16px',
        fontSize: 13,
        cursor: 'pointer',
    }
}
