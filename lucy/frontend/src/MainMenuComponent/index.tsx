import React from 'react'
import { addFrame } from '../Frames'
import { signOut } from '../auth'

export function MainMenuComponent() {
    async function handleWorkbooks() {
        const { WorkbookListFrame } = await import('../WorkbookListFrame')
        addFrame(WorkbookListFrame, {})
    }

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            background: '#1a1a2e',
            borderBottom: '1px solid #333',
            padding: '4px 12px',
            boxSizing: 'border-box',
            flexShrink: 0,
        }}>
            <button onClick={handleWorkbooks} style={menuBtnStyle}>Workbooks</button>
            <button onClick={signOut} style={menuBtnStyle}>Sign Out</button>
        </div>
    )
}

const menuBtnStyle: React.CSSProperties = {
    background: 'transparent',
    border: '1px solid #444',
    color: '#ccc',
    padding: '4px 14px',
    borderRadius: 3,
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: 'sans-serif',
}
