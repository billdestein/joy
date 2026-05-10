import { useState } from 'react'

interface Props {
    encodedImage: string
    mimeType: string
}

interface ContextMenuState {
    x: number
    y: number
}

const menuItems = [
    { label: 'Zoom', action: () => alert('zoom') },
    { label: 'Save', action: () => alert('save') },
    { label: 'Download', action: () => alert('download') },
]

export function ViewerComponent({ encodedImage, mimeType }: Props) {
    const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)

    function handleContextMenu(e: React.MouseEvent) {
        e.preventDefault()
        setContextMenu({ x: e.clientX, y: e.clientY })
    }

    function dismiss() {
        setContextMenu(null)
    }

    if (!encodedImage) {
        return <div style={{ width: '100%', height: '100%', background: '#000' }} />
    }

    const fullMimeType = mimeType.startsWith('image/') ? mimeType : `image/${mimeType}`
    const src = `data:${fullMimeType};base64,${encodedImage}`

    return (
        <div
            style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={dismiss}
        >
            <img
                src={src}
                alt="Generated"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                onContextMenu={handleContextMenu}
            />
            {contextMenu && (
                <div style={{
                    position: 'fixed',
                    top: contextMenu.y,
                    left: contextMenu.x,
                    background: '#1a2533',
                    border: '1px solid #2a3a50',
                    borderRadius: 4,
                    zIndex: 99999,
                    minWidth: 120,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                }}>
                    {menuItems.map((item) => (
                        <div
                            key={item.label}
                            onClick={(e) => { e.stopPropagation(); item.action(); dismiss() }}
                            style={{ padding: '7px 14px', cursor: 'pointer', color: '#cce0ff', fontSize: 13 }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#2a4060' }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                        >
                            {item.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
