import { canvas } from '../Frames'

type Props = {
    frameId: number
}

export default function UploadWorkbookApplet({ frameId }: Props) {
    return (
        <div style={{
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            color: '#ccc',
            background: '#1a1a1a',
            height: '100%',
        }}>
            <div style={{ fontSize: 14 }}>Upload</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    onClick={() => canvas.removeFrame(frameId)}
                    style={{
                        background: '#333',
                        border: 'none',
                        borderRadius: 4,
                        color: '#eee',
                        padding: '6px 16px',
                        fontSize: 13,
                        cursor: 'pointer',
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    )
}
