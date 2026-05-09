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

function resizeCursor(dir: ResizeDir): string {
    if (!dir) return 'default'
    return `${dir}-resize`
}

export function Frame({ frameId: _frameId, width, height, x, y, zIndex, isModal, buttons, children }: FrameProps) {
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

        // Set initial position
        if (isModal) {
            const parent = el.offsetParent as HTMLElement | null
            if (parent) {
                const pw = parent.clientWidth
                const ph = parent.clientHeight
                el.style.left = `${Math.max(0, (pw - width) / 2)}px`
                el.style.top = `${Math.max(0, (ph - height) / 2)}px`
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
        return {
            pw: parent?.clientWidth ?? window.innerWidth,
            ph: parent?.clientHeight ?? window.innerHeight,
        }
    }

    function constrainPosition(left: number, top: number, w: number) {
        const { pw, ph } = getParentDims()
        const clampedTop = Math.max(0, Math.min(ph - BORDER - HEADER_HEIGHT, top))
        const clampedLeft = Math.max(40 - w, Math.min(pw - 40, left))
        return { left: clampedLeft, top: clampedTop }
    }

    function handleMouseMove(e: React.MouseEvent) {
        const el = divRef.current
        if (!el) return

        if (dragState.current) {
            e.preventDefault()
            return
        }

        const rect = el.getBoundingClientRect()
        const relX = e.clientX - rect.left
        const relY = e.clientY - rect.top
        const dir = getResizeDir(relX, relY, rect.width, rect.height)

        if (dir) {
            el.style.cursor = resizeCursor(dir)
        } else if (relY < BORDER + HEADER_HEIGHT) {
            el.style.cursor = 'grab'
        } else {
            el.style.cursor = 'default'
        }
    }

    function handleMouseDown(e: React.MouseEvent) {
        const el = divRef.current
        if (!el) return

        // Bring to front
        el.style.zIndex = String(getNextZIndex())

        const rect = el.getBoundingClientRect()
        const relX = e.clientX - rect.left
        const relY = e.clientY - rect.top
        const dir = getResizeDir(relX, relY, rect.width, rect.height)

        const startLeft = parseInt(el.style.left, 10)
        const startTop = parseInt(el.style.top, 10)
        const startWidth = rect.width
        const startHeight = rect.height

        if (dir) {
            e.preventDefault()
            dragState.current = {
                type: 'resize',
                dir,
                startMouseX: e.clientX,
                startMouseY: e.clientY,
                startLeft,
                startTop,
                startWidth,
                startHeight,
            }
        } else if (relY < BORDER + HEADER_HEIGHT) {
            e.preventDefault()
            dragState.current = {
                type: 'drag',
                dir: '',
                startMouseX: e.clientX,
                startMouseY: e.clientY,
                startLeft,
                startTop,
                startWidth,
                startHeight,
            }
        }
    }

    useEffect(() => {
        function onMouseMove(e: MouseEvent) {
            const state = dragState.current
            const el = divRef.current
            if (!state || !el) return

            const dx = e.clientX - state.startMouseX
            const dy = e.clientY - state.startMouseY

            if (state.type === 'drag') {
                const newLeft = state.startLeft + dx
                const newTop = state.startTop + dy
                const { left, top } = constrainPosition(newLeft, newTop, state.startWidth)
                el.style.left = `${left}px`
                el.style.top = `${top}px`
            } else {
                const dir = state.dir
                let left = state.startLeft
                let top = state.startTop
                let w = state.startWidth
                let h = state.startHeight

                if (dir.includes('e')) w = Math.max(MIN_WIDTH, state.startWidth + dx)
                if (dir.includes('s')) h = Math.max(MIN_HEIGHT, state.startHeight + dy)
                if (dir.includes('w')) {
                    const newW = Math.max(MIN_WIDTH, state.startWidth - dx)
                    left = state.startLeft + (state.startWidth - newW)
                    w = newW
                }
                if (dir.includes('n')) {
                    const newH = Math.max(MIN_HEIGHT, state.startHeight - dy)
                    top = state.startTop + (state.startHeight - newH)
                    h = newH
                }

                const { pw, ph } = getParentDims()
                top = Math.max(0, Math.min(ph - BORDER - HEADER_HEIGHT, top))
                left = Math.max(40 - w, Math.min(pw - 40, left))

                el.style.left = `${left}px`
                el.style.top = `${top}px`
                el.style.width = `${w}px`
                el.style.height = `${h}px`
            }
        }

        function onMouseUp() {
            dragState.current = null
            if (divRef.current) {
                divRef.current.style.cursor = 'default'
            }
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
        return () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
        }
    }, [])

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            style={{
                position: 'absolute',
                border: `${BORDER}px solid #3a5070`,
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                background: '#1e2a38',
                overflow: 'hidden',
                userSelect: 'none',
            }}
        >
            <div
                style={{
                    height: HEADER_HEIGHT,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    padding: '0 4px',
                    background: '#253545',
                    gap: 2,
                    cursor: 'inherit',
                }}
            >
                {buttons.map((btn, i) => (
                    <FrameHeaderButtonComponent key={i} {...btn} />
                ))}
            </div>
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
                {children}
            </div>
        </div>
    )
}
