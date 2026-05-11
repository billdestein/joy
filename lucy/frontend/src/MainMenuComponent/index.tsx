import React from 'react'
import { addFrame } from '../Frames'
import WorkbookListFrame from '../WorkbookListFrame'
import { signOut } from '../auth'

export default function MainMenuComponent() {
    function openWorkbooks() {
        addFrame(WorkbookListFrame, {
            width: 700,
            height: 400,
            isModal: false,
            message: null,
        })
    }

    return (
        <div style={{
            width: '100%',
            height: '40px',
            background: '#1a1a2e',
            display: 'flex',
            alignItems: 'center',
            padding: '0 10px',
            flexShrink: 0,
        }}>
            <button onClick={openWorkbooks} style={btnStyle}>
                Workbooks
            </button>
            <div style={{ flex: 1 }} />
            <button onClick={signOut} style={btnStyle}>
                Sign Out
            </button>
        </div>
    )
}

const btnStyle: React.CSSProperties = {
    background: '#2a2a4a',
    border: '1px solid #444',
    color: '#ccc',
    padding: '4px 14px',
    cursor: 'pointer',
    borderRadius: '3px',
    fontSize: '13px',
}
