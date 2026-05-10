interface Props {
    onClose: () => void
}

export function UploadWorkbookApplet({ onClose }: Props) {
    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            color: '#cce0ff',
            fontSize: 14,
        }}>
            <div>Upload</div>
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
    )
}
