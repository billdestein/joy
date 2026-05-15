import React, { useState, useEffect } from 'react'
import { useWorkbook } from '../WorkbookContext'
import { addFrame } from '../canvas'

type ContextMenuState = { x: number; y: number } | null

export default function ViewerComponent() {
    const { workbook, isLoading, selectedPicFilename } = useWorkbook()
    const [contextMenu, setContextMenu] = useState<ContextMenuState>(null)

    const pic = workbook.pics.find(p => p.filename === selectedPicFilename)
        ?? workbook.pics[workbook.pics.length - 1]

    const hasPic = pic && pic.mimeType !== '' && pic.encodedImage

    useEffect(() => {
        if (!contextMenu) return
        function close() { setContextMenu(null) }
        document.addEventListener('click', close)
        return () => document.removeEventListener('click', close)
    }, [contextMenu])

    function handleContextMenu(e: React.MouseEvent) {
        e.preventDefault()
        if (!hasPic) return
        setContextMenu({ x: e.clientX, y: e.clientY })
    }

    function download() {
        if (!hasPic) return
        const a = document.createElement('a')
        a.href = `data:${pic!.mimeType};base64,${pic!.encodedImage}`
        a.download = pic!.filename
        a.click()
        setContextMenu(null)
    }

    function zoom() {
        if (!hasPic) return
        import('../frames/ZoomFrame').then(m => {
            addFrame(m.default, {
                message: { encodedImage: pic!.encodedImage, mimeType: pic!.mimeType },
                width: 800,
                height: 600,
            })
        })
        setContextMenu(null)
    }

    const menuItems = [
        { label: 'Download image', action: download },
        { label: 'Save as pic', action: () => { alert('save'); setContextMenu(null) } },
        { label: 'Zoom', action: zoom },
    ]

    return (
        <div
            style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
            onContextMenu={handleContextMenu}
        >
            {isLoading && (
                <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', zIndex: 10 }}>
                    <style>{`@keyframes lucy-spin { to { transform: rotate(360deg) } }`}</style>
                    <div style={{ width: 40, height: 40, border: '4px solid #555', borderTopColor: '#0078d4', borderRadius: '50%', animation: 'lucy-spin 0.8s linear infinite' }} />
                </div>
            )}
            {hasPic && (
                <img
                    src={`data:${pic!.mimeType};base64,${pic!.encodedImage}`}
                    alt={pic!.filename}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
            )}
            {contextMenu && (
                <div
                    onClick={e => e.stopPropagation()}
                    style={{
                        position: 'fixed',
                        left: contextMenu.x,
                        top: contextMenu.y,
                        background: '#252526',
                        border: '1px solid #555',
                        borderRadius: 4,
                        zIndex: 99999,
                        minWidth: 160,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    }}
                >
                    {menuItems.map(item => (
                        <div
                            key={item.label}
                            onClick={item.action}
                            onMouseEnter={e => (e.currentTarget.style.background = '#094771')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            style={{ padding: '7px 14px', color: '#ccc', cursor: 'pointer', fontSize: 13 }}
                        >
                            {item.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
