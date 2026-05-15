import React, { useRef, useEffect } from 'react'
import { FrameProps, bringToFront } from './canvas'

const HEADER_HEIGHT = 32
const BORDER = 5
const RESIZE_ZONE = 10
const MIN_SIZE = 100

type Props = FrameProps & {
    title: string
    headerButtons?: React.ReactNode
    children: React.ReactNode
}

type ResizeEdge = { top: boolean; bottom: boolean; left: boolean; right: boolean }

function getResizeEdge(e: MouseEvent, el: HTMLDivElement): ResizeEdge | null {
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const w = rect.width
    const h = rect.height

    const nearLeft = x <= RESIZE_ZONE
    const nearRight = x >= w - RESIZE_ZONE
    const nearTop = y <= RESIZE_ZONE
    const nearBottom = y >= h - RESIZE_ZONE

    if (nearLeft || nearRight || nearTop || nearBottom) {
        return { top: nearTop, bottom: nearBottom, left: nearLeft, right: nearRight }
    }
    return null
}

function edgeToCursor(edge: ResizeEdge | null): string {
    if (!edge) return ''
    const { top, bottom, left, right } = edge
    if ((top && left) || (bottom && right)) return 'nwse-resize'
    if ((top && right) || (bottom && left)) return 'nesw-resize'
    if (top || bottom) return 'ns-resize'
    if (left || right) return 'ew-resize'
    return ''
}

export default function Frame({ frameId, width, height, x, y, zIndex, isModal, title, headerButtons, children }: Props) {
    const outerRef = useRef<HTMLDivElement>(null)
    const resizingRef = useRef(false)

    useEffect(() => {
        const el = outerRef.current
        if (!el) return

        let fx = isModal ? (window.innerWidth - width) / 2 : x
        let fy = isModal ? (window.innerHeight - height) / 2 : y

        el.style.left = fx + 'px'
        el.style.top = fy + 'px'
        el.style.width = width + 'px'
        el.style.height = height + 'px'
        el.style.zIndex = String(zIndex)
    }, [])

    function handleHeaderMouseDown(e: React.MouseEvent) {
        if (e.button !== 0) return
        e.preventDefault()
        e.stopPropagation()
        const el = outerRef.current!
        const startMx = e.clientX
        const startMy = e.clientY
        const startFx = parseInt(el.style.left)
        const startFy = parseInt(el.style.top)

        function onMove(ev: MouseEvent) {
            const canvas = el.parentElement?.parentElement
            const canvasW = canvas?.clientWidth ?? window.innerWidth
            const canvasH = canvas?.clientHeight ?? window.innerHeight
            const fw = el.offsetWidth
            let nx = startFx + (ev.clientX - startMx)
            let ny = startFy + (ev.clientY - startMy)

            if (ny < 0) ny = 0
            if (ny > canvasH - HEADER_HEIGHT - BORDER * 2) ny = canvasH - HEADER_HEIGHT - BORDER * 2
            if (nx + fw < 30) nx = 30 - fw
            if (nx > canvasW - 30) nx = canvasW - 30

            el.style.left = nx + 'px'
            el.style.top = ny + 'px'
        }

        function onUp() {
            document.removeEventListener('mousemove', onMove)
            document.removeEventListener('mouseup', onUp)
        }

        document.addEventListener('mousemove', onMove)
        document.addEventListener('mouseup', onUp)
    }

    function handleOuterMouseMove(e: React.MouseEvent) {
        if (resizingRef.current) return
        const el = outerRef.current!
        const edge = getResizeEdge(e.nativeEvent, el)
        el.style.cursor = edgeToCursor(edge) || 'default'
    }

    function handleOuterMouseDown(e: React.MouseEvent) {
        bringToFront(frameId)
        if (e.button !== 0) return
        const el = outerRef.current!
        const edgeOrNull = getResizeEdge(e.nativeEvent, el)
        if (!edgeOrNull) return
        const edge = edgeOrNull
        e.preventDefault()
        e.stopPropagation()

        resizingRef.current = true
        const startMx = e.clientX
        const startMy = e.clientY
        const startFx = parseInt(el.style.left)
        const startFy = parseInt(el.style.top)
        const startFw = el.offsetWidth
        const startFh = el.offsetHeight

        function onMove(ev: MouseEvent) {
            const dx = ev.clientX - startMx
            const dy = ev.clientY - startMy
            let nx = startFx, ny = startFy, nw = startFw, nh = startFh

            if (edge.right) nw = Math.max(MIN_SIZE, startFw + dx)
            if (edge.bottom) nh = Math.max(MIN_SIZE, startFh + dy)
            if (edge.left) { nw = Math.max(MIN_SIZE, startFw - dx); nx = startFx + startFw - nw }
            if (edge.top) { nh = Math.max(MIN_SIZE, startFh - dy); ny = startFy + startFh - nh }

            el.style.left = nx + 'px'
            el.style.top = ny + 'px'
            el.style.width = nw + 'px'
            el.style.height = nh + 'px'
        }

        function onUp() {
            resizingRef.current = false
            el.style.cursor = 'default'
            document.removeEventListener('mousemove', onMove)
            document.removeEventListener('mouseup', onUp)
        }

        document.addEventListener('mousemove', onMove)
        document.addEventListener('mouseup', onUp)
    }

    return (
        <div
            ref={outerRef}
            onMouseMove={handleOuterMouseMove}
            onMouseDown={handleOuterMouseDown}
            style={{
                position: 'absolute',
                border: `${BORDER}px solid #555`,
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                background: '#1e1e1e',
                boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
            }}
        >
            <div
                onMouseDown={handleHeaderMouseDown}
                style={{
                    height: HEADER_HEIGHT,
                    background: '#2d2d2d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 8px',
                    cursor: 'grab',
                    userSelect: 'none',
                    flexShrink: 0,
                    borderBottom: '1px solid #444',
                }}
            >
                <span style={{ color: '#ccc', fontSize: 13 }}>{title}</span>
                <div style={{ display: 'flex', gap: 4 }}>{headerButtons}</div>
            </div>
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                {children}
            </div>
        </div>
    )
}
