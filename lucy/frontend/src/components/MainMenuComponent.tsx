import React from 'react'
import { addFrame } from '../canvas'
import { signOut } from '../auth'

export default function MainMenuComponent() {
    function openWorkbooks() {
        import('../frames/WorkbookListFrame').then(m => {
            addFrame(m.default, { width: 700, height: 400 })
        })
    }

    return (
        <div style={{
            width: '100%',
            height: 40,
            background: '#2d2d2d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 12px',
            borderBottom: '1px solid #444',
            flexShrink: 0,
        }}>
            <button
                onClick={openWorkbooks}
                onMouseEnter={e => (e.currentTarget.style.background = '#3a3d41')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                style={{ background: 'transparent', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 13, padding: '4px 8px', borderRadius: 3 }}
            >
                Workbooks
            </button>
            <button
                onClick={signOut}
                onMouseEnter={e => (e.currentTarget.style.background = '#3a3d41')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                style={{ background: 'transparent', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 13, padding: '4px 8px', borderRadius: 3 }}
            >
                Sign Out
            </button>
        </div>
    )
}
