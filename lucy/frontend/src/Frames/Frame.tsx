import React, { useRef, useEffect, ReactNode } from 'react'
import { FrameProps } from './types'
import { bringToFront, removeFrame } from './canvas'

const BORDER = 5
const DRAG_MARGIN = 5

interface FrameComponentProps extends FrameProps {
    title?: string
    headerButtons?: ReactNode
    children: ReactNode
}

export function Frame(props: FrameComponentProps) {
    const { frameId, x, y, width, height, zIndex, title, headerButtons, children } = props
    const outerRef = useRef<HTMLDivElement>(null)
    const headerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const outer = outerRef.current
        const header = headerRef.current
        if (!outer || !header) return

        outer.style.left = `${x}px`
        outer.style.top = `${y}px`
        outer.style.width = `${width + BORDER * 2}px`
        outer.style.height = `${height + BORDER * 2 + header.offsetHeight}px`
        outer.style.zIndex = String(zIndex)

        let dragging = false
        let resizing = false
        let startX = 0, startY = 0
        let startLeft = 0, startTop = 0, startW = 0, startH = 0

        function isResizeZone(e: MouseEvent): boolean {
            const rect = outer!.getBoundingClientRect()
            const lx = e.clientX - rect.left
            const ly = e.clientY - rect.top
            return (
                lx < BORDER + DRAG_MARGIN ||
                lx > rect.width - BORDER - DRAG_MARGIN ||
                ly < BORDER + DRAG_MARGIN ||
                ly > rect.height - BORDER - DRAG_MARGIN
            )
        }

        function onPointerDownOuter(e: MouseEvent) {
            bringToFront(frameId)
            outer!.style.zIndex = String(parseInt(outer!.style.zIndex) + 1)
            if (isResizeZone(e)) {
                resizing = true
                startX = e.clientX
                startY = e.clientY
                startW = outer!.offsetWidth
                startH = outer!.offsetHeight
                startLeft = outer!.offsetLeft
                startTop = outer!.offsetTop
                e.preventDefault()
            }
        }

        function onPointerDownHeader(e: MouseEvent) {
            if (isResizeZone(e)) return
            dragging = true
            startX = e.clientX
            startY = e.clientY
            startLeft = outer!.offsetLeft
            startTop = outer!.offsetTop
            e.preventDefault()
        }

        function onMouseMove(e: MouseEvent) {
            const canvas = outer!.parentElement as HTMLElement
            if (dragging) {
                let nx = startLeft + (e.clientX - startX)
                let ny = startTop + (e.clientY - startY)
                const minY = 0
                const maxY = canvas.offsetHeight - header!.offsetHeight
                const minX = -(outer!.offsetWidth - 30)
                const maxX = canvas.offsetWidth - 30
                nx = Math.max(minX, Math.min(maxX, nx))
                ny = Math.max(minY, Math.min(maxY, ny))
                outer!.style.left = `${nx}px`
                outer!.style.top = `${ny}px`
            } else if (resizing) {
                const dw = e.clientX - startX
                const dh = e.clientY - startY
                outer!.style.width = `${Math.max(200, startW + dw)}px`
                outer!.style.height = `${Math.max(150, startH + dh)}px`
            }
        }

        function onMouseUp() {
            dragging = false
            resizing = false
        }

        outer.addEventListener('mousedown', onPointerDownOuter)
        header.addEventListener('mousedown', onPointerDownHeader)
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)

        return () => {
            outer.removeEventListener('mousedown', onPointerDownOuter)
            header.removeEventListener('mousedown', onPointerDownHeader)
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
        }
    }, [frameId, x, y, width, height, zIndex])

    return (
        <div
            ref={outerRef}
            style={{
                position: 'absolute',
                border: `${BORDER}px solid #555`,
                background: '#1e1e1e',
                display: 'flex',
                flexDirection: 'column',
                userSelect: 'none',
                boxSizing: 'border-box',
                cursor: 'default',
            }}
        >
            <div
                ref={headerRef}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 8px',
                    background: '#2d2d2d',
                    borderBottom: '1px solid #555',
                    cursor: 'move',
                    minHeight: 32,
                    flexShrink: 0,
                }}
            >
                <span style={{ color: '#ccc', fontSize: 13, fontFamily: 'sans-serif' }}>{title ?? ''}</span>
                <div style={{ display: 'flex', gap: 4 }}>{headerButtons}</div>
            </div>
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                {children}
            </div>
        </div>
    )
}

export { removeFrame }
