import React, { useState } from 'react'
import { ButtonConfig } from './types'

export function FrameHeaderButtonComponent({ icon, toolTipLabel, handler }: ButtonConfig) {
  const [showTip, setShowTip] = useState(false)
  const [hovered, setHovered] = useState(false)

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        onMouseEnter={() => { setShowTip(true); setHovered(true) }}
        onMouseLeave={() => { setShowTip(false); setHovered(false) }}
        onMouseDown={e => e.stopPropagation()}
        onClick={e => { e.stopPropagation(); handler() }}
        style={{
          background: hovered ? '#555' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#ccc',
          padding: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 3,
          lineHeight: 1,
        }}
      >
        {icon}
      </button>
      {showTip && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            right: 0,
            background: '#333',
            color: '#eee',
            fontSize: 11,
            padding: '3px 6px',
            borderRadius: 3,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 9999,
            marginBottom: 4,
          }}
        >
          {toolTipLabel}
        </div>
      )}
    </div>
  )
}
