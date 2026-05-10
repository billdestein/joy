import { useRef } from 'react'

interface Props {
    onOk: (name: string) => void
    onClose: () => void
}

export function GetWorkbookNameApplet({ onOk, onClose }: Props) {
    const inputRef = useRef<HTMLInputElement>(null)

    function handleOk() {
        const value = inputRef.current?.value.trim() ?? ''
        if (!value) return
        onOk(value)
        onClose()
    }

    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: 24,
            boxSizing: 'border-box',
            color: '#cce0ff',
        }}>
            <div style={{ fontSize: 13 }}>Enter a name for the new workbook</div>
            <input
                ref={inputRef}
                type="text"
                style={{
                    width: '100%',
                    padding: '6px 8px',
                    background: '#0f1a24',
                    border: '1px solid #2a3a50',
                    borderRadius: 4,
                    color: '#cce0ff',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleOk() }}
                autoFocus
            />
            <div style={{ display: 'flex', gap: 8 }}>
                <button
                    onClick={handleOk}
                    style={{
                        padding: '5px 16px',
                        background: '#1a4080',
                        border: '1px solid #2a5aaa',
                        borderRadius: 4,
                        color: '#cce0ff',
                        fontSize: 13,
                        cursor: 'pointer',
                    }}
                >
                    OK
                </button>
                <button
                    onClick={onClose}
                    style={{
                        padding: '5px 16px',
                        background: '#1a2533',
                        border: '1px solid #2a3a50',
                        borderRadius: 4,
                        color: '#cce0ff',
                        fontSize: 13,
                        cursor: 'pointer',
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    )
}
