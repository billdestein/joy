import { useEffect, useRef, useState } from 'react'
import { Canvas } from './Canvas'
import { Frame } from './Frame'

function AppletA() {
    return (
        <div style={{ padding: 12, color: '#b0b0c8', fontSize: 13, lineHeight: 1.5 }}>
            <div style={{ color: '#88c888', fontWeight: 600, marginBottom: 6 }}>Frame A</div>
            <p>Drag the header to move.</p>
            <p>Drag any edge or corner to resize.</p>
            <p>Click to bring to front.</p>
        </div>
    )
}

function AppletB() {
    const [count, setCount] = useState(0)
    return (
        <div style={{ padding: 12, color: '#b0b0c8', fontSize: 13 }}>
            <div style={{ color: '#8888c8', fontWeight: 600, marginBottom: 10 }}>Frame B</div>
            <button
                onClick={() => setCount(c => c + 1)}
                style={{
                    padding: '5px 14px',
                    background: '#333358',
                    color: '#aaaaee',
                    border: '1px solid #555588',
                    borderRadius: 3,
                    cursor: 'pointer',
                    fontSize: 13,
                }}
            >
                Clicked {count} {count === 1 ? 'time' : 'times'}
            </button>
        </div>
    )
}

function ModalContent({ onClose }: { onClose: () => void }) {
    return (
        <div style={{ padding: 16, color: '#b0b0c8', fontSize: 13, lineHeight: 1.6 }}>
            <div style={{ color: '#c88888', fontWeight: 600, marginBottom: 8 }}>Modal Frame</div>
            <p>This frame is modal. The canvas is blocked by a translucent backdrop.</p>
            <p style={{ marginTop: 4 }}>The frame is centered and ignores x/y props.</p>
            <button
                onClick={onClose}
                style={{
                    marginTop: 14,
                    padding: '5px 16px',
                    background: '#6a2020',
                    color: '#ffaaaa',
                    border: '1px solid #a04040',
                    borderRadius: 3,
                    cursor: 'pointer',
                    fontSize: 13,
                }}
            >
                Close
            </button>
        </div>
    )
}

export function Demo() {
    const canvasRef = useRef<HTMLDivElement>(null)
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        if (canvasRef.current) Canvas.init(canvasRef.current)
    }, [])

    return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{
                padding: '6px 16px',
                background: '#16162e',
                borderBottom: '1px solid #2a2a4a',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                fontSize: 12,
            }}>
                <span style={{ color: '#7070c0', fontWeight: 700, letterSpacing: 1 }}>react-better-frames</span>
                <button
                    onClick={() => setShowModal(true)}
                    style={{
                        padding: '3px 12px',
                        background: '#22224a',
                        color: '#8888cc',
                        border: '1px solid #44447a',
                        borderRadius: 3,
                        cursor: 'pointer',
                        fontSize: 12,
                    }}
                >
                    Open Modal
                </button>
            </div>

            <div ref={canvasRef} style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#0f0f23' }}>
                <Frame width={320} height={200} x={40} y={40} title="Frame A">
                    <AppletA />
                </Frame>
                <Frame width={280} height={180} x={420} y={80} title="Frame B">
                    <AppletB />
                </Frame>
                {showModal && (
                    <Frame width={380} height={190} isModal title="Modal Dialog">
                        <ModalContent onClose={() => setShowModal(false)} />
                    </Frame>
                )}
            </div>
        </div>
    )
}
