import React from 'react'

interface Props {
  workbookName: string
  onClose: () => void
}

export function WorkbookApplet({ workbookName }: Props) {
  return (
    <div style={{ padding: 16, color: '#ddd', height: '100%', background: '#2a2a2a' }}>
      <h2 style={{ fontSize: 18, fontWeight: 'normal' }}>{workbookName}</h2>
    </div>
  )
}
