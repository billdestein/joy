import React, { useState } from 'react'

interface Props {
    onClose: () => void
    onOk: (name: string) => void
}

export function GetWorkbookNameApplet({ onClose, onOk }: Props) {
    const [name, setName] = useState('')

    function handleOk() {
        if (!name.trim()) return
        onOk(name.trim())
        onClose()
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 20, color: '#cce0ff', width: '100%', height: '100%', justifyContent: 'center' }}>
            <div style={{ fontSize: 13 }}>Enter a name for the new workbook</div>
            <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleOk() }}
                style={{ background: '#0e1820', color: '#cce0ff', border: '1px solid #3a5070', borderRadius: 4, padding: '6px 10px', fontSize: 13, outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={onClose} style={secondaryBtn}>Cancel</button>
                <button onClick={handleOk} style={primaryBtn}>OK</button>
            </div>
        </div>
    )
}

const primaryBtn: React.CSSProperties = { background: '#2a6040', color: '#cce0ff', border: '1px solid #3a7050', borderRadius: 4, padding: '5px 16px', cursor: 'pointer', fontSize: 13 }
const secondaryBtn: React.CSSProperties = { background: '#2a3040', color: '#aac0d0', border: '1px solid #3a4060', borderRadius: 4, padding: '5px 16px', cursor: 'pointer', fontSize: 13 }
