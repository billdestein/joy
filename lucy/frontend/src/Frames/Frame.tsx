import React, { useRef, useEffect } from 'react'
import { ButtonConfig } from './types'

export interface FrameProps {
    id: string
    height: number
    width: number
    x: number
    y: number
    zIndex: number
    message?: object
    isModal?: boolean
    buttons?: ButtonConfig[]
    children: React.ReactNode
    canvasRef: React.RefObject<HTMLDivElement | null>
    onBringToFront: (id: string) => void
}

type ResizeDir = 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se'

const handlePositions: Record<ResizeDir, React.CSSProperties> = {
    nw: { top: 0,    left: 0,    cursor: 'nw-resize' },
    n:  { top: 0,    left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' },
    ne: { top: 0,    right: 0,   cursor: 'ne-resize' },
    w:  { top: '50%', left: 0,  transform: 'translateY(-50%)', cursor: 'w-resize' },
    e:  { top: '50%', right: 0, transform: 'translateY(-50%)', cursor: 'e-resize' },
    sw: { bottom: 0, left: 0,   cursor: 'sw-resize' },
    s:  { bottom: 0, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' },
    se: { bottom: 0, right: 0,  cursor: 'se-resize' },
}

export function Frame({ id, height, width, x, y, zIndex, isModal, buttons, children, canvasRef, onBringToFront }: FrameProps) {
    const frameRef = useRef<HTMLDivElement>(null)
    const pos = useRef({ x, y, width, height, zIndex })

    useEffect(() => {
        const frame = frameRef.current
        if (!frame) return
        frame.style.left = `${x}px`
        frame.style.top = `${y}px`
        frame.style.width = `${width}px`
        frame.style.height = `${height}px`
        frame.style.zIndex = String(zIndex)
    }, [])

    useEffect(() => {
        if (frameRef.current) {
            frameRef.current.style.zIndex = String(zIndex)
            pos.current.zIndex = zIndex
        }
    }, [zIndex])

    const startHeaderDrag = (e: React.MouseEvent) => {
        e.preventDefault()
        const startX = e.clientX
        const startY = e.clientY
        const startLeft = pos.current.x
        const startTop = pos.current.y

        const onMove = (ev: MouseEvent) => {
            const canvas = canvasRef.current
            if (!canvas || !frameRef.current) return
            const canvasRect = canvas.getBoundingClientRect()
            const dx = ev.clientX - startX
            const dy = ev.clientY - startY

            let newX = startLeft + dx
            let newY = startTop + dy

            // top: header top touches canvas top
            newY = Math.max(0, newY)
            // bottom: bottom of header (30px) touches bottom of canvas
            newY = Math.min(canvasRect.height - 30, newY)
            // left/right: never less than 40px visible
            newX = Math.max(40 - pos.current.width, newX)
            newX = Math.min(canvasRect.width - 40, newX)

            pos.current.x = newX
            pos.current.y = newY
            frameRef.current.style.left = `${newX}px`
            frameRef.current.style.top = `${newY}px`
        }

        const onUp = () => {
            document.removeEventListener('mousemove', onMove)
            document.removeEventListener('mouseup', onUp)
        }

        document.addEventListener('mousemove', onMove)
        document.addEventListener('mouseup', onUp)
    }

    const startResize = (dir: ResizeDir) => (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const startX = e.clientX
        const startY = e.clientY
        const startLeft = pos.current.x
        const startTop = pos.current.y
        const startWidth = pos.current.width
        const startHeight = pos.current.height

        const onMove = (ev: MouseEvent) => {
            if (!frameRef.current) return
            const dx = ev.clientX - startX
            const dy = ev.clientY - startY
            let newLeft = startLeft
            let newTop = startTop
            let newWidth = startWidth
            let newHeight = startHeight

            if (dir.includes('e')) newWidth = Math.max(100, startWidth + dx)
            if (dir.includes('w')) { newLeft = startLeft + dx; newWidth = Math.max(100, startWidth - dx) }
            if (dir.includes('s')) newHeight = Math.max(60, startHeight + dy)
            if (dir.includes('n')) { newTop = startTop + dy; newHeight = Math.max(60, startHeight - dy) }

            pos.current = { ...pos.current, x: newLeft, y: newTop, width: newWidth, height: newHeight }
            frameRef.current.style.left = `${newLeft}px`
            frameRef.current.style.top = `${newTop}px`
            frameRef.current.style.width = `${newWidth}px`
            frameRef.current.style.height = `${newHeight}px`
        }

        const onUp = () => {
            document.removeEventListener('mousemove', onMove)
            document.removeEventListener('mouseup', onUp)
        }

        document.addEventListener('mousemove', onMove)
        document.addEventListener('mouseup', onUp)
    }

    return (
        <div
            ref={frameRef}
            style={{
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                border: '5px solid #555',
                boxSizing: 'border-box',
                background: '#1a1a1a',
            }}
            onMouseDown={() => onBringToFront(id)}
        >
            {(Object.keys(handlePositions) as ResizeDir[]).map(dir => (
                <div
                    key={dir}
                    style={{
                        position: 'absolute',
                        width: 10,
                        height: 10,
                        zIndex: 1,
                        ...handlePositions[dir],
                    }}
                    onMouseDown={startResize(dir)}
                />
            ))}

            <div
                style={{
                    height: 30,
                    minHeight: 30,
                    background: '#333',
                    cursor: 'grab',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    padding: '0 4px',
                    userSelect: 'none',
                }}
                onMouseDown={startHeaderDrag}
            >
                {buttons?.map((btn, i) => (
                    <button
                        key={i}
                        title={btn.tooltip}
                        onClick={e => { e.stopPropagation(); btn.onClick() }}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'white',
                            fontSize: 14,
                            padding: '0 4px',
                        }}
                    >
                        {btn.icon}
                    </button>
                ))}
            </div>

            <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
                {children}
            </div>
        </div>
    )
}
