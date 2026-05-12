import React, { useRef, useState, useEffect } from 'react'
import { addFrame } from '../Frames'

interface Props {
    encodedImage: string
    mimeType: string
    loading?: boolean
}

interface ContextMenu {
    x: number
    y: number
}

export function ViewerComponent({ encodedImage, mimeType, loading }: Props) {
    const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function dismiss() { setContextMenu(null) }
        window.addEventListener('click', dismiss)
        return () => window.removeEventListener('click', dismiss)
    }, [])

    function handleContextMenu(e: React.MouseEvent) {
        e.preventDefault()
        setContextMenu({ x: e.clientX, y: e.clientY })
    }

    function downloadImage() {
        const a = document.createElement('a')
        a.href = `data:${mimeType};base64,${encodedImage}`
        a.download = `image.${mimeType === 'image/png' ? 'png' : 'jpg'}`
        a.click()
        setContextMenu(null)
    }

    function saveAsPic() {
        alert('save')
        setContextMenu(null)
    }

    async function zoom() {
        setContextMenu(null)
        const { ZoomFrame } = await import('../ZoomFrame')
        addFrame(ZoomFrame, { message: { encodedImage, mimeType } })
    }

    const src = encodedImage ? `data:${mimeType};base64,${encodedImage}` : null

    return (
        <div
            ref={containerRef}
            style={{ width: '100%', height: '100%', background: '#000', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onContextMenu={handleContextMenu}
        >
            {loading && (
                <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.6)', zIndex: 10,
                }}>
                    <div style={{
                        width: 40, height: 40, border: '4px solid #555', borderTopColor: '#aaa',
                        borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                    }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            )}
            {src ? (
                <img
                    src={src}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    alt="generated"
                />
            ) : (
                <div style={{ width: '100%', height: '100%', background: '#000' }} />
            )}
            {contextMenu && (
                <div
                    style={{
                        position: 'fixed',
                        left: contextMenu.x,
                        top: contextMenu.y,
                        background: '#2d2d2d',
                        border: '1px solid #555',
                        borderRadius: 4,
                        zIndex: 99999,
                        minWidth: 140,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    {[
                        { label: 'Download image', action: downloadImage },
                        { label: 'Save as pic', action: saveAsPic },
                        { label: 'Zoom', action: zoom },
                    ].map(({ label, action }) => (
                        <div
                            key={label}
                            onClick={action}
                            style={{
                                padding: '8px 14px',
                                color: '#ccc',
                                fontSize: 13,
                                cursor: 'pointer',
                                fontFamily: 'sans-serif',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#3a3a3a')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            {label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
