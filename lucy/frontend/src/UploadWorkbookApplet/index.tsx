interface Props {
    onClose: () => void
}

export function UploadWorkbookApplet({ onClose }: Props) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                padding: 20,
                width: '100%',
                height: '100%',
                color: '#cce0ff',
            }}
        >
            <div style={{ fontSize: 16 }}>Upload</div>
            <button
                onClick={onClose}
                style={{
                    background: '#2a3040',
                    color: '#aac0d0',
                    border: '1px solid #3a4060',
                    borderRadius: 4,
                    padding: '5px 16px',
                    cursor: 'pointer',
                    fontSize: 13,
                }}
            >
                Cancel
            </button>
        </div>
    )
}
