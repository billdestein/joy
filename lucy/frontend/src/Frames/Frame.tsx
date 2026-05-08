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

const EDGE = 10        // px from outer frame edge that triggers resize
const HEADER = 35      // 5px border + 30px header bar

const resizeCursors: Record<ResizeDir, string> = {
    nw: 'nw-resize', n: 'n-resize', ne: 'ne-resize',
    w:  'w-resize',                  e:  'e-resize',
    sw: 'sw-resize', s: 's-resize', se: 'se-resize',
}

function getDir(clientX: number, clientY: number, rect: DOMRect): ResizeDir | null {
    const x = clientX - rect.left
    const y = clientY - rect.top
    const nearLeft   = x < EDGE
    const nearRight  = x > rect.width  - EDGE
    const nearTop    = y < EDGE
    const nearBottom = y > rect.height - EDGE
    if (nearTop    && nearLeft)  return 'nw'
    if (nearTop    && nearRight) return 'ne'
    if (nearBottom && nearLeft)  return 'sw'
    if (nearBottom && nearRight) return 'se'
    if (nearTop)    return 'n'
    if (nearBottom) return 's'
    if (nearLeft)   return 'w'
    if (nearRight)  return 'e'
    return null
}

export function Frame({ id, height, width, x, y, zIndex, isModal, buttons, children, canvasRef, onBringToFront }: FrameProps) {
    const frameRef = useRef<HTMLDivElement>(null)
    const pos = useRef({ x, y, width, height, zIndex })

    useEffect(() => {
        const frame = frameRef.current
        if (!frame) return
        frame.style.left   = `${x}px`
        frame.style.top    = `${y}px`
        frame.style.width  = `${width}px`
        frame.style.height = `${height}px`
        frame.style.zIndex = String(zIndex)
    }, [])

    useEffect(() => {
        if (frameRef.current) {
            frameRef.current.style.zIndex = String(zIndex)
            pos.current.zIndex = zIndex
        }
    }, [zIndex])

    const startDrag = (e: React.MouseEvent) => {
        e.preventDefault()
        const startX    = e.clientX
        const startY    = e.clientY
        const startLeft = pos.current.x
        const startTop  = pos.current.y

        const onMove = (ev: MouseEvent) => {
            const canvas = canvasRef.current
            if (!canvas || !frameRef.current) return
            const cr  = canvas.getBoundingClientRect()
            const dx  = ev.clientX - startX
            const dy  = ev.clientY - startY
            const newX = Math.max(40 - pos.current.width, Math.min(cr.width  - 40, startLeft + dx))
            const newY = Math.max(0,                      Math.min(cr.height - 30, startTop  + dy))
            pos.current.x = newX
            pos.current.y = newY
            frameRef.current.style.left = `${newX}px`
            frameRef.current.style.top  = `${newY}px`
        }
        const onUp = () => {
            document.removeEventListener('mousemove', onMove)
            document.removeEventListener('mouseup',   onUp)
        }
        document.addEventListener('mousemove', onMove)
        document.addEventListener('mouseup',   onUp)
    }

    const startResize = (dir: ResizeDir, e: React.MouseEvent) => {
        e.preventDefault()
        const startX      = e.clientX
        const startY      = e.clientY
        const startLeft   = pos.current.x
        const startTop    = pos.current.y
        const startWidth  = pos.current.width
        const startHeight = pos.current.height

        const onMove = (ev: MouseEvent) => {
            if (!frameRef.current) return
            const dx = ev.clientX - startX
            const dy = ev.clientY - startY
            let newLeft = startLeft, newTop = startTop
            let newWidth = startWidth, newHeight = startHeight

            if (dir.includes('e')) newWidth  = Math.max(100, startWidth  + dx)
            if (dir.includes('w')) { newLeft = startLeft + dx; newWidth  = Math.max(100, startWidth  - dx) }
            if (dir.includes('s')) newHeight = Math.max(60,  startHeight + dy)
            if (dir.includes('n')) { newTop  = startTop  + dy; newHeight = Math.max(60,  startHeight - dy) }

            pos.current = { ...pos.current, x: newLeft, y: newTop, width: newWidth, height: newHeight }
            frameRef.current.style.left   = `${newLeft}px`
            frameRef.current.style.top    = `${newTop}px`
            frameRef.current.style.width  = `${newWidth}px`
            frameRef.current.style.height = `${newHeight}px`
        }
        const onUp = () => {
            document.removeEventListener('mousemove', onMove)
            document.removeEventListener('mouseup',   onUp)
        }
        document.addEventListener('mousemove', onMove)
        document.addEventListener('mouseup',   onUp)
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        const frame = frameRef.current
        if (!frame) return
        const rect = frame.getBoundingClientRect()
        const dir  = getDir(e.clientX, e.clientY, rect)
        if (dir) {
            frame.style.cursor = resizeCursors[dir]
            return
        }
        frame.style.cursor = (e.clientY - rect.top) < HEADER ? 'grab' : 'default'
    }

    const handleMouseLeave = () => {
        if (frameRef.current) frameRef.current.style.cursor = ''
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        onBringToFront(id)
        const frame = frameRef.current
        if (!frame) return
        const rect = frame.getBoundingClientRect()
        const dir  = getDir(e.clientX, e.clientY, rect)
        if (dir) {
            startResize(dir, e)
            return
        }
        if ((e.clientY - rect.top) < HEADER) {
            startDrag(e)
        }
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
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
        >
            <div
                style={{
                    height: 30,
                    minHeight: 30,
                    background: '#333',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    padding: '0 4px',
                    userSelect: 'none',
                }}
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
