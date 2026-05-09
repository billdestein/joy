import { useEffect, useRef } from 'react'
import { useAuth } from 'react-oidc-context'
import { canvas, CanvasHost } from './Frames'
import { ButtonIcons } from './ButtonIcons'
import WorkbookListApplet from './WorkbookListApplet'
import GetWorkbookNameApplet from './GetWorkbookNameApplet'
import UploadWorkbookApplet from './UploadWorkbookApplet'

export default function App() {
    const auth = useAuth()
    const backendLoginCalled = useRef(false)

    useEffect(() => {
        if (auth.isAuthenticated && auth.user?.id_token && !backendLoginCalled.current) {
            backendLoginCalled.current = true
            fetch('/v1/auth/login', {
                method: 'POST',
                credentials: 'include',
                headers: { Authorization: `Bearer ${auth.user.id_token}` },
            }).catch(console.error)
        }
    }, [auth.isAuthenticated, auth.user?.id_token])

    if (auth.isLoading) {
        return <div style={fullscreen('#000')} />
    }

    if (!auth.isAuthenticated) {
        return (
            <div style={{ ...fullscreen('#000'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'gold', fontSize: 48, fontWeight: 'bold', fontFamily: 'sans-serif' }}>
                    Lucy
                </div>
                <button
                    onClick={() => auth.signinRedirect()}
                    style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        background: 'transparent',
                        border: '1px solid gold',
                        color: 'gold',
                        padding: '6px 16px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 14,
                        fontFamily: 'sans-serif',
                    }}
                >
                    Sign In
                </button>
            </div>
        )
    }

    return (
        <div style={{ ...fullscreen('#111'), display: 'flex', flexDirection: 'column' }}>
            <ButtonRow />
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <CanvasHost />
            </div>
        </div>
    )
}

function ButtonRow() {
    const handleWorkbooks = () => {
        let frameId: number
        frameId = canvas.addFrame({
            width: 640,
            height: 420,
            x: 60,
            y: 60,
            buttons: [
                {
                    key: 'close',
                    icon: ButtonIcons.x,
                    tip: 'Close',
                    onClick: () => canvas.removeFrame(frameId),
                },
            ],
            children: <WorkbookListApplet />,
        })
    }

    const handleNewWorkbook = () => {
        let frameId: number
        frameId = canvas.addFrame({
            width: 340,
            height: 150,
            x: 0,
            y: 0,
            isModal: true,
            zIndex: 500,
            children: (
                <GetWorkbookNameApplet
                    frameId={frameId!}
                    onOk={(name) => console.log('create workbook:', name)}
                />
            ),
        })
    }

    const handleUpload = () => {
        let frameId: number
        frameId = canvas.addFrame({
            width: 300,
            height: 140,
            x: 0,
            y: 0,
            isModal: true,
            zIndex: 500,
            children: <UploadWorkbookApplet frameId={frameId!} />,
        })
    }

    return (
        <div style={{
            height: 40,
            background: '#1a1a1a',
            borderBottom: '1px solid #333',
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px',
            gap: 4,
            flexShrink: 0,
        }}>
            <ToolbarButton label="Workbooks" onClick={handleWorkbooks} />
            <ToolbarButton label="New" onClick={handleNewWorkbook} />
            <ToolbarButton label="Upload" onClick={handleUpload} />
        </div>
    )
}

function ToolbarButton({ label, onClick }: { label: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            style={{
                background: 'transparent',
                border: '1px solid #444',
                color: '#ccc',
                padding: '4px 12px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 13,
                fontFamily: 'sans-serif',
            }}
        >
            {label}
        </button>
    )
}

function fullscreen(bg: string): React.CSSProperties {
    return { width: '100%', height: '100%', background: bg, position: 'relative' }
}
