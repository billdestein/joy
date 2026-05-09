import { useEffect, useRef } from 'react'
import type { FrameProps } from './types'
import FrameHeaderButtonComponent from './FrameHeaderButtonComponent'

const BORDER = 5
const HEADER_HEIGHT = 30
const EDGE_ZONE = 10
const MIN_VISIBLE = 40
const MIN_WIDTH = 100
const MIN_HEIGHT = 60

type EdgeType =
    | 'drag' | 'none'
    | 'n' | 's' | 'e' | 'w'
    | 'ne' | 'nw' | 'se' | 'sw'

type DragState = {
    edge: EdgeType
    startX: number
    startY: number
    startFrameX: number
    startFrameY: number
    startWidth: number
    startHeight: number
}

function applyGeometry(
    el: HTMLDivElement,
    x: number, y: number, width: number, height: number, zIndex: number
) {
    el.style.left = x + 'px'
    el.style.top = y + 'px'
    el.style.width = width + 'px'
    el.style.height = height + 'px'
    el.style.zIndex = String(zIndex)
}

function getEdge(el: HTMLElement, clientX: number, clientY: number): EdgeType {
    const rect = el.getBoundingClientRect()
    const dx = clientX - rect.left
    const dy = clientY - rect.top
    const fromRight = rect.width - dx
    const fromBottom = rect.height - dy

    const nearLeft = dx < EDGE_ZONE
    const nearRight = fromRight < EDGE_ZONE
    const nearTop = dy < EDGE_ZONE
    const nearBottom = fromBottom < EDGE_ZONE

    if (nearTop && nearLeft) return 'nw'
    if (nearTop && nearRight) return 'ne'
    if (nearBottom && nearLeft) return 'sw'
    if (nearBottom && nearRight) return 'se'
    if (nearTop) return 'n'
    if (nearBottom) return 's'
    if (nearLeft) return 'w'
    if (nearRight) return 'e'
    if (dy < BORDER + HEADER_HEIGHT) return 'drag'
    return 'none'
}

const CURSOR_MAP: Record<EdgeType, string> = {
    n: 'n-resize', s: 's-resize', e: 'e-resize', w: 'w-resize',
    ne: 'ne-resize', nw: 'nw-resize', se: 'se-resize', sw: 'sw-resize',
    drag: 'move', none: 'default',
}

export default function Frame({
    frameId, children, height: initHeight, width: initWidth,
    x: initX, y: initY, zIndex: initZ,
    isModal, buttons = [], canvasRef, onBringToFront,
}: FrameProps) {
    const outerRef = useRef<HTMLDivElement>(null)
    const posRef = useRef({ x: initX, y: initY, width: initWidth, height: initHeight, zIndex: initZ })
    const dragRef = useRef<DragState | null>(null)

    useEffect(() => {
        const frame = outerRef.current!
        const canvas = canvasRef.current!

        if (isModal) {
            posRef.current.x = Math.max(0, (canvas.clientWidth - initWidth) / 2)
            posRef.current.y = Math.max(0, (canvas.clientHeight - initHeight) / 2)
        }

        const s = posRef.current
        applyGeometry(frame, s.x, s.y, s.width, s.height, s.zIndex)

        function onMouseMove(e: MouseEvent) {
            if (dragRef.current) return
            const edge = getEdge(frame, e.clientX, e.clientY)
            frame.style.cursor = CURSOR_MAP[edge]
        }

        function onMouseDown(e: MouseEvent) {
            if ((e.target as HTMLElement).closest('[data-frame-button]')) return
            const edge = getEdge(frame, e.clientX, e.clientY)

            // Always bring to front on click
            posRef.current.zIndex = onBringToFront()
            frame.style.zIndex = String(posRef.current.zIndex)

            if (edge === 'none') return
            e.preventDefault()

            dragRef.current = {
                edge,
                startX: e.clientX,
                startY: e.clientY,
                startFrameX: posRef.current.x,
                startFrameY: posRef.current.y,
                startWidth: posRef.current.width,
                startHeight: posRef.current.height,
            }
            document.addEventListener('mousemove', onDocMouseMove)
            document.addEventListener('mouseup', onDocMouseUp)
        }

        function onDocMouseMove(e: MouseEvent) {
            const drag = dragRef.current
            if (!drag) return

            const dx = e.clientX - drag.startX
            const dy = e.clientY - drag.startY
            const canvasW = canvas.clientWidth
            const canvasH = canvas.clientHeight

            let x = drag.startFrameX
            let y = drag.startFrameY
            let w = drag.startWidth
            let h = drag.startHeight

            if (drag.edge === 'drag') {
                x = drag.startFrameX + dx
                y = drag.startFrameY + dy
                y = Math.max(0, Math.min(canvasH - BORDER - HEADER_HEIGHT, y))
                x = Math.max(MIN_VISIBLE - w, Math.min(canvasW - MIN_VISIBLE, x))
            } else {
                if (drag.edge.includes('e')) w = Math.max(MIN_WIDTH, drag.startWidth + dx)
                if (drag.edge.includes('s')) h = Math.max(MIN_HEIGHT, drag.startHeight + dy)
                if (drag.edge.includes('w')) {
                    w = Math.max(MIN_WIDTH, drag.startWidth - dx)
                    x = drag.startFrameX + (drag.startWidth - w)
                }
                if (drag.edge.includes('n')) {
                    h = Math.max(MIN_HEIGHT, drag.startHeight - dy)
                    y = drag.startFrameY + (drag.startHeight - h)
                }
            }

            posRef.current = { ...posRef.current, x, y, width: w, height: h }
            applyGeometry(frame, x, y, w, h, posRef.current.zIndex)
        }

        function onDocMouseUp() {
            dragRef.current = null
            document.removeEventListener('mousemove', onDocMouseMove)
            document.removeEventListener('mouseup', onDocMouseUp)
        }

        frame.addEventListener('mousemove', onMouseMove)
        frame.addEventListener('mousedown', onMouseDown)
        return () => {
            frame.removeEventListener('mousemove', onMouseMove)
            frame.removeEventListener('mousedown', onMouseDown)
            onDocMouseUp()
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div
            ref={outerRef}
            style={{
                position: 'absolute',
                boxSizing: 'border-box',
                border: `${BORDER}px solid #444`,
                background: '#1a1a1a',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                userSelect: 'none',
            }}
        >
            <div style={{
                height: HEADER_HEIGHT,
                flexShrink: 0,
                background: '#2a2a2a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                padding: '0 4px',
                gap: 2,
            }}>
                {buttons.map(btn => (
                    <FrameHeaderButtonComponent
                        key={btn.key}
                        icon={btn.icon}
                        handler={btn.handler}
                        tooltipLabel={btn.tooltipLabel}
                    />
                ))}
            </div>
            <div style={{ flex: 1, overflow: 'auto', userSelect: 'text' }}>
                {children}
            </div>
        </div>
    )
}

