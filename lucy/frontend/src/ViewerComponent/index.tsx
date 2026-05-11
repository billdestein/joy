import React, { useState, useRef, useEffect } from 'react'
import { addFrame } from '../Frames'
import ZoomFrame from '../ZoomFrame'

type Props = {
    encodedImage: string | null
    mimeType: string | null
    generating: boolean
}

type ContextMenuState = {
    x: number
    y: number
} | null

export default function ViewerComponent({ encodedImage, mimeType, generating }: Props) {
    const [contextMenu, setContextMenu] = useState<ContextMenuState>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClick() { setContextMenu(null) }
        document.addEventListener('click', handleClick)
        return () => document.removeEventListener('click', handleClick)
    }, [])

    function handleContextMenu(e: React.MouseEvent) {
        e.preventDefault()
        setContextMenu({ x: e.clientX, y: e.clientY })
    }

    function downloadImage() {
        if (!encodedImage || !mimeType) return
        const ext = mimeType.includes('png') ? 'png' : 'jpg'
        const a = document.createElement('a')
        a.href = `data:${mimeType};base64,${encodedImage}`
        a.download = `image.${ext}`
        a.click()
        setContextMenu(null)
    }

    function saveAsPic() {
        alert('save')
        setContextMenu(null)
    }

    function zoom() {
        if (!encodedImage || !mimeType) return
        addFrame(ZoomFrame, {
            width: 600,
            height: 500,
            isModal: false,
            message: { encodedImage, mimeType },
        })
        setContextMenu(null)
    }

    const src = encodedImage && mimeType ? `data:${mimeType};base64,${encodedImage}` : null

    return (
        <div
            ref={containerRef}
            onContextMenu={handleContextMenu}
            style={{
                width: '100%',
                height: '100%',
                background: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {generating && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.5)',
                    zIndex: 1,
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid #444',
                        borderTop: '4px solid #aaa',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                    }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            )}
            {src ? (
                <img
                    src={src}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                    }}
                    alt="Generated"
                />
            ) : (
                <div style={{ width: '100%', height: '100%', background: '#000' }} />
            )}
            {contextMenu && (
                <div
                    style={{
                        position: 'fixed',
                        top: contextMenu.y,
                        left: contextMenu.x,
                        background: '#2a2a2a',
                        border: '1px solid #444',
                        borderRadius: '4px',
                        zIndex: 99999,
                        minWidth: '160px',
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    {[
                        { label: 'Download image', action: downloadImage, disabled: !src },
                        { label: 'Save as pic', action: saveAsPic, disabled: !src },
                        { label: 'Zoom', action: zoom, disabled: !src },
                    ].map(item => (
                        <div
                            key={item.label}
                            onClick={item.disabled ? undefined : item.action}
                            style={{
                                padding: '7px 14px',
                                cursor: item.disabled ? 'default' : 'pointer',
                                color: item.disabled ? '#666' : '#ccc',
                                fontSize: '13px',
                            }}
                            onMouseEnter={e => { if (!item.disabled) (e.currentTarget as HTMLDivElement).style.background = '#3a3a3a' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                        >
                            {item.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
