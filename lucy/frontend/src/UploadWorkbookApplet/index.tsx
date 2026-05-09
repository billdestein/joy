import React from 'react'

interface Props {
  onClose: () => void
  onComplete?: () => void
}

export function UploadWorkbookApplet({ onClose }: Props) {
  return (
    <div style={styles.container}>
      <div style={styles.label}>Upload</div>
      <div style={styles.buttons}>
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
  label: { fontSize: 14 },
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
