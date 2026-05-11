import React, { useRef, useEffect, ReactNode } from 'react'
import { bringToFront, getCanvasEl } from './Canvas'

const BORDER = 5
const RESIZE_ZONE = 10

type Props = {
    frameId: number
    initialWidth: number
    initialHeight: number
    initialX: number
    initialY: number
    initialZ: number
    headerLeft?: ReactNode
    headerRight?: ReactNode
    children: ReactNode
}

export default function Frame({
    frameId,
    initialWidth,
    initialHeight,
    initialX,
    initialY,
    initialZ,
    headerLeft,
    headerRight,
    children,
}: Props) {
    const outerRef = useRef<HTMLDivElement>(null)
    const headerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const outer = outerRef.current
        const header = headerRef.current
        if (!outer || !header) return

        outer.style.width = `${initialWidth + BORDER * 2}px`
        outer.style.height = `${initialHeight + BORDER * 2 + 28}px`
        outer.style.left = `${initialX}px`
        outer.style.top = `${initialY}px`
        outer.style.zIndex = String(initialZ)

        let dragging = false
        let resizing = false
        let startX = 0, startY = 0
        let startL = 0, startT = 0, startW = 0, startH = 0
        let resizeEdge = { l: false, r: false, t: false, b: false }

        function getResizeEdge(e: MouseEvent) {
            const rect = outer!.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top
            const w = rect.width
            const h = rect.height
            return {
                l: x <= RESIZE_ZONE,
                r: x >= w - RESIZE_ZONE,
                t: y <= RESIZE_ZONE,
                b: y >= h - RESIZE_ZONE,
            }
        }

        function onMouseDown(e: MouseEvent) {
            if (e.button !== 0) return
            bringToFront(frameId)

            const edge = getResizeEdge(e)
            const onHeader = header!.contains(e.target as Node)

            if (!onHeader && (edge.l || edge.r || edge.t || edge.b)) {
                resizing = true
                resizeEdge = edge
                startX = e.clientX
                startY = e.clientY
                startL = outer!.offsetLeft
                startT = outer!.offsetTop
                startW = outer!.offsetWidth
                startH = outer!.offsetHeight
                e.preventDefault()
            } else if (onHeader) {
                dragging = true
                startX = e.clientX
                startY = e.clientY
                startL = outer!.offsetLeft
                startT = outer!.offsetTop
                e.preventDefault()
            }
        }

        function onMouseMove(e: MouseEvent) {
            const canvas = getCanvasEl()
            if (!canvas || !outer) return

            if (dragging) {
                const dx = e.clientX - startX
                const dy = e.clientY - startY
                let newL = startL + dx
                let newT = startT + dy
                const canvasH = canvas.offsetHeight
                const canvasW = canvas.offsetWidth
                const frameW = outer.offsetWidth
                const headerH = header!.offsetHeight + BORDER

                newT = Math.max(0, Math.min(newT, canvasH - headerH))
                newL = Math.max(30 - frameW, Math.min(newL, canvasW - 30))

                outer.style.left = `${newL}px`
                outer.style.top = `${newT}px`
            } else if (resizing) {
                const dx = e.clientX - startX
                const dy = e.clientY - startY
                const minSize = BORDER * 2 + 80

                if (resizeEdge.r) outer.style.width = `${Math.max(minSize, startW + dx)}px`
                if (resizeEdge.b) outer.style.height = `${Math.max(minSize, startH + dy)}px`
                if (resizeEdge.l) {
                    const newW = Math.max(minSize, startW - dx)
                    outer.style.width = `${newW}px`
                    outer.style.left = `${startL + startW - newW}px`
                }
                if (resizeEdge.t) {
                    const newH = Math.max(minSize, startH - dy)
                    outer.style.height = `${newH}px`
                    outer.style.top = `${startT + startH - newH}px`
                }
            }
        }

        function onMouseUp() {
            dragging = false
            resizing = false
        }

        function updateCursor(e: MouseEvent) {
            if (dragging || resizing) return
            const onHeader = header!.contains(e.target as Node)
            if (onHeader) {
                outer!.style.cursor = 'move'
                return
            }
            const edge = getResizeEdge(e)
            if ((edge.l && edge.t) || (edge.r && edge.b)) outer!.style.cursor = 'nwse-resize'
            else if ((edge.r && edge.t) || (edge.l && edge.b)) outer!.style.cursor = 'nesw-resize'
            else if (edge.l || edge.r) outer!.style.cursor = 'ew-resize'
            else if (edge.t || edge.b) outer!.style.cursor = 'ns-resize'
            else outer!.style.cursor = 'default'
        }

        outer.addEventListener('mousedown', onMouseDown)
        outer.addEventListener('mousemove', updateCursor)
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)

        return () => {
            outer.removeEventListener('mousedown', onMouseDown)
            outer.removeEventListener('mousemove', updateCursor)
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
        }
    }, [frameId, initialWidth, initialHeight, initialX, initialY, initialZ])

    return (
        <div
            ref={outerRef}
            style={{
                position: 'absolute',
                border: `${BORDER}px solid #444`,
                background: '#1e1e1e',
                display: 'flex',
                flexDirection: 'column',
                userSelect: 'none',
            }}
        >
            <div
                ref={headerRef}
                style={{
                    height: '28px',
                    background: '#2a2a2a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 6px',
                    cursor: 'move',
                    flexShrink: 0,
                    color: '#aaa',
                    fontSize: '13px',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {headerLeft}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {headerRight}
                </div>
            </div>
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {children}
            </div>
        </div>
    )
}
