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
    <div style={styles.container}>
      <div style={styles.label}>Enter a name for the new workbook</div>
      <input
        style={styles.input}
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleOk() }}
        autoFocus
      />
      <div style={styles.buttons}>
        <button style={styles.btn} onClick={handleOk}>OK</button>
        <button style={styles.btn} onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    color: '#ddd',
    height: '100%',
    background: '#2a2a2a',
  },
  label: { fontSize: 13 },
  input: {
    padding: '6px 8px',
    background: '#1a1a1a',
    border: '1px solid #555',
    borderRadius: 4,
    color: '#eee',
    fontSize: 13,
    outline: 'none',
  },
  buttons: { display: 'flex', gap: 8, justifyContent: 'flex-end' },
  btn: {
    padding: '5px 14px',
    background: '#444',
    border: '1px solid #666',
    borderRadius: 4,
    color: '#eee',
    cursor: 'pointer',
    fontSize: 13,
  },
}
