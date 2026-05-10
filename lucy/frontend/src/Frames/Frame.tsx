import React, { useEffect, useRef } from 'react'
import { ButtonConfig } from './types'
import { FrameHeaderButtonComponent } from './FrameHeaderButtonComponent'
import { getNextZIndex } from './zindex'

const BORDER = 5
const HEADER_HEIGHT = 30
const DETECT = 10
const MIN_WIDTH = 100
const MIN_HEIGHT = BORDER + HEADER_HEIGHT + 40

interface FrameProps {
    frameId: number
    width: number
    height: number
    x: number
    y: number
    zIndex: number
    isModal: boolean
    title: string
    buttons: ButtonConfig[]
    children: React.ReactNode
}

type ResizeDir = '' | 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

function getResizeDir(x: number, y: number, w: number, h: number): ResizeDir {
    const nearLeft = x < DETECT
    const nearRight = x > w - DETECT
    const nearTop = y < DETECT
    const nearBottom = y > h - DETECT
    if (!nearLeft && !nearRight && !nearTop && !nearBottom) return ''
    let dir = ''
    if (nearTop) dir += 'n'
    else if (nearBottom) dir += 's'
    if (nearLeft) dir += 'w'
    else if (nearRight) dir += 'e'
    return dir as ResizeDir
}

export function Frame({ frameId: _frameId, width, height, x, y, zIndex, isModal, title, buttons, children }: FrameProps) {
    const divRef = useRef<HTMLDivElement>(null)
    const dragState = useRef<{
        type: 'drag' | 'resize'
        dir: ResizeDir
        startMouseX: number
        startMouseY: number
        startLeft: number
        startTop: number
        startWidth: number
        startHeight: number
    } | null>(null)

    useEffect(() => {
        const el = divRef.current
        if (!el) return
        if (isModal) {
            const parent = el.offsetParent as HTMLElement | null
            if (parent) {
                el.style.left = `${Math.max(0, (parent.clientWidth - width) / 2)}px`
                el.style.top = `${Math.max(0, (parent.clientHeight - height) / 2)}px`
            }
        } else {
            el.style.left = `${x}px`
            el.style.top = `${y}px`
        }
        el.style.width = `${width}px`
        el.style.height = `${height}px`
        el.style.zIndex = String(zIndex)
    }, [])

    function getParentDims() {
        const parent = divRef.current?.offsetParent as HTMLElement | null
        return { pw: parent?.clientWidth ?? window.innerWidth, ph: parent?.clientHeight ?? window.innerHeight }
    }

    function constrainPosition(left: number, top: number, w: number) {
        const { pw, ph } = getParentDims()
        return {
            left: Math.max(40 - w, Math.min(pw - 40, left)),
            top: Math.max(0, Math.min(ph - BORDER - HEADER_HEIGHT, top)),
        }
    }

    function handleMouseMove(e: React.MouseEvent) {
        const el = divRef.current
        if (!el || dragState.current) return
        const rect = el.getBoundingClientRect()
        const relX = e.clientX - rect.left
        const relY = e.clientY - rect.top
        const dir = getResizeDir(relX, relY, rect.width, rect.height)
        if (dir) el.style.cursor = `${dir}-resize`
        else if (relY < BORDER + HEADER_HEIGHT) el.style.cursor = 'grab'
        else el.style.cursor = 'default'
    }

    function handleMouseDown(e: React.MouseEvent) {
        const el = divRef.current
        if (!el) return
        el.style.zIndex = String(getNextZIndex())
        const rect = el.getBoundingClientRect()
        const relX = e.clientX - rect.left
        const relY = e.clientY - rect.top
        const dir = getResizeDir(relX, relY, rect.width, rect.height)
        const base = { startMouseX: e.clientX, startMouseY: e.clientY, startLeft: parseInt(el.style.left, 10), startTop: parseInt(el.style.top, 10), startWidth: rect.width, startHeight: rect.height }
        if (dir) { e.preventDefault(); dragState.current = { type: 'resize', dir, ...base } }
        else if (relY < BORDER + HEADER_HEIGHT) { e.preventDefault(); dragState.current = { type: 'drag', dir: '', ...base } }
    }

    useEffect(() => {
        function onMouseMove(e: MouseEvent) {
            const state = dragState.current
            const el = divRef.current
            if (!state || !el) return
            const dx = e.clientX - state.startMouseX
            const dy = e.clientY - state.startMouseY
            if (state.type === 'drag') {
                const { left, top } = constrainPosition(state.startLeft + dx, state.startTop + dy, state.startWidth)
                el.style.left = `${left}px`
                el.style.top = `${top}px`
            } else {
                const dir = state.dir
                let left = state.startLeft, top = state.startTop, w = state.startWidth, h = state.startHeight
                if (dir.includes('e')) w = Math.max(MIN_WIDTH, state.startWidth + dx)
                if (dir.includes('s')) h = Math.max(MIN_HEIGHT, state.startHeight + dy)
                if (dir.includes('w')) { w = Math.max(MIN_WIDTH, state.startWidth - dx); left = state.startLeft + (state.startWidth - w) }
                if (dir.includes('n')) { h = Math.max(MIN_HEIGHT, state.startHeight - dy); top = state.startTop + (state.startHeight - h) }
                const c = constrainPosition(left, top, w)
                el.style.left = `${c.left}px`
                el.style.top = `${c.top}px`
                el.style.width = `${w}px`
                el.style.height = `${h}px`
            }
        }
        function onMouseUp() { dragState.current = null; if (divRef.current) divRef.current.style.cursor = 'default' }
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
        return () => { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp) }
    }, [])

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            style={{ position: 'absolute', border: `${BORDER}px solid #3a5070`, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', background: '#1e2a38', userSelect: 'none' }}
        >
            <div style={{ height: HEADER_HEIGHT, flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 4px', background: '#253545', gap: 2, cursor: 'inherit' }}>
                {title && <span style={{ flex: 1, color: '#cce0ff', fontSize: 13, paddingLeft: 4, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{title}</span>}
                {!title && <div style={{ flex: 1 }} />}
                {buttons.map((btn, i) => <FrameHeaderButtonComponent key={i} {...btn} />)}
            </div>
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
                {children}
            </div>
        </div>
    )
}
