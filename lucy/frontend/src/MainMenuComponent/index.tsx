import React from 'react'
import { openWorkbookListApplet } from '../WorkbookListApplet'

export function MainMenuComponent() {
  return (
    <div style={styles.menuBar}>
      <button style={styles.menuBtn} onClick={openWorkbookListApplet}>
        Workbooks
      </button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  menuBar: {
    width: '100%',
    height: 40,
    background: '#111',
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px',
    flexShrink: 0,
    borderBottom: '1px solid #333',
  },
  menuBtn: {
    background: 'transparent',
    border: 'none',
    color: '#ccc',
    cursor: 'pointer',
    fontSize: 14,
    padding: '4px 12px',
    borderRadius: 4,
  },
}
