import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Canvas } from './Canvas'
import type { FrameProps } from './types'

const MessageContext = createContext<unknown>(undefined)

export function useFrameMessage<T = unknown>(): T {
    return useContext(MessageContext) as T
}

type ResizeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

const BORDER = 5
const HEADER_H = 30
const MIN_WIDTH = 80
const MIN_HEIGHT = BORDER + HEADER_H + BORDER + 20

function grabStyle(dir: ResizeDir): CSSProperties {
    const S = BORDER + 3
    const base: CSSProperties = { position: 'absolute', zIndex: 10, background: 'transparent' }
    switch (dir) {
        case 'n':  return { ...base, top: 0,    left: S,  right: S,  height: S, cursor: 'n-resize'  }
        case 's':  return { ...base, bottom: 0, left: S,  right: S,  height: S, cursor: 's-resize'  }
        case 'w':  return { ...base, left: 0,   top: S,   bottom: S, width: S,  cursor: 'w-resize'  }
        case 'e':  return { ...base, right: 0,  top: S,   bottom: S, width: S,  cursor: 'e-resize'  }
        case 'nw': return { ...base, top: 0,    left: 0,  width: S,  height: S, cursor: 'nw-resize' }
        case 'ne': return { ...base, top: 0,    right: 0, width: S,  height: S, cursor: 'ne-resize' }
        case 'sw': return { ...base, bottom: 0, left: 0,  width: S,  height: S, cursor: 'sw-resize' }
        case 'se': return { ...base, bottom: 0, right: 0, width: S,  height: S, cursor: 'se-resize' }
    }
}

function setupResize(frame: HTMLDivElement, el: HTMLElement, dir: ResizeDir): () => void {
    let active = false
    let mx0 = 0, my0 = 0, fl = 0, ft = 0, fw = 0, fh = 0

    const onDown = (e: MouseEvent) => {
        active = true
        mx0 = e.clientX
        my0 = e.clientY
        fl = parseInt(frame.style.left) || 0
        ft = parseInt(frame.style.top) || 0
        fw = frame.offsetWidth
        fh = frame.offsetHeight
        e.stopPropagation()
        e.preventDefault()
    }

    const onMove = (e: MouseEvent) => {
        if (!active) return
        const ddx = e.clientX - mx0
        const ddy = e.clientY - my0
        const d = dir as string

        let nl = fl, nt = ft, nw = fw, nh = fh

        if (d.includes('w')) { nl = fl + ddx; nw = fw - ddx }
        if (d.includes('e')) { nw = fw + ddx }
        if (d.includes('n')) { nt = ft + ddy; nh = fh - ddy }
        if (d.includes('s')) { nh = fh + ddy }

        if (nw < MIN_WIDTH) {
            if (d.includes('w')) nl = fl + fw - MIN_WIDTH
            nw = MIN_WIDTH
        }
        if (nh < MIN_HEIGHT) {
            if (d.includes('n')) nt = ft + fh - MIN_HEIGHT
            nh = MIN_HEIGHT
        }

        frame.style.left   = `${nl}px`
        frame.style.top    = `${nt}px`
        frame.style.width  = `${nw}px`
        frame.style.height = `${nh}px`
    }

    const onUp = () => { active = false }

    el.addEventListener('mousedown', onDown)
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)

    return () => {
        el.removeEventListener('mousedown', onDown)
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
    }
}

export function Frame({ id, height, width, x = 0, y = 0, zIndex, message, isModal = false, children, buttons }: FrameProps) {
    const frameRef = useRef<HTMLDivElement>(null)
    const backdropRef = useRef<HTMLElement | null>(null)
    const [removed, setRemoved] = useState(false)

    useEffect(() => {
        Canvas.registerFrame(id, () => setRemoved(true))
        return () => Canvas.unregisterFrame(id)
    }, [id])

    useEffect(() => {
        const frame = frameRef.current
        if (!frame) return

        frame.style.zIndex = String(zIndex ?? Canvas.nextZIndex())

        if (isModal) {
            const backdrop = Canvas.addModalBackdrop()
            backdropRef.current = backdrop
            frame.style.zIndex = String(Canvas.nextZIndex())
            const size = Canvas.getSize()
            if (size) {
                frame.style.left = `${Math.max(0, (size.width  - width)  / 2)}px`
                frame.style.top  = `${Math.max(0, (size.height - height) / 2)}px`
            }
        }

        const onFrameDown = () => Canvas.bringToFront(frame)
        frame.addEventListener('mousedown', onFrameDown)

        const header = frame.querySelector<HTMLElement>('.frame-header')!
        let dragging = false
        let dx0 = 0, dy0 = 0, fx0 = 0, fy0 = 0

        const onHeaderDown = (e: MouseEvent) => {
            if ((e.target as Element).closest('.frame-btn')) return
            dragging = true
            dx0 = e.clientX
            dy0 = e.clientY
            fx0 = parseInt(frame.style.left) || 0
            fy0 = parseInt(frame.style.top) || 0
            e.preventDefault()
        }

        const onDragMove = (e: MouseEvent) => {
            if (!dragging) return
            const canvasEl = Canvas.getElement()!
            const fw = frame.offsetWidth
            const cw = canvasEl.clientWidth
            const ch = canvasEl.clientHeight
            const headerBottom = BORDER + HEADER_H

            let nx = fx0 + (e.clientX - dx0)
            let ny = fy0 + (e.clientY - dy0)

            ny = Math.max(0, ny)
            ny = Math.min(ny, ch - headerBottom)
            nx = Math.max(-(fw - 40), nx)
            nx = Math.min(nx, cw - 40)

            frame.style.left = `${nx}px`
            frame.style.top  = `${ny}px`
        }

        const onDragUp = () => { dragging = false }

        header.addEventListener('mousedown', onHeaderDown)
        document.addEventListener('mousemove', onDragMove)
        document.addEventListener('mouseup', onDragUp)

        const resizeCleanups: Array<() => void> = []
        ;(['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'] as ResizeDir[]).forEach(dir => {
            const el = frame.querySelector<HTMLElement>(`.grab-${dir}`)
            if (el) resizeCleanups.push(setupResize(frame, el, dir))
        })

        return () => {
            frame.removeEventListener('mousedown', onFrameDown)
            header.removeEventListener('mousedown', onHeaderDown)
            document.removeEventListener('mousemove', onDragMove)
            document.removeEventListener('mouseup', onDragUp)
            resizeCleanups.forEach(c => c())
            if (backdropRef.current) {
                Canvas.removeModalBackdrop(backdropRef.current)
                backdropRef.current = null
            }
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    if (removed) return null

    return (
        <div
            ref={frameRef}
            style={{
                position: 'absolute',
                left: isModal ? 0 : x,
                top: isModal ? 0 : y,
                width,
                height,
                userSelect: 'none',
            }}
        >
            <div style={{ position: 'absolute', inset: 0, background: '#1e1e2e', border: '1px solid #484860', borderRadius: 3 }} />

            {(['nw','n','ne','w','e','sw','s','se'] as ResizeDir[]).map(d => (
                <div key={d} className={`grab-${d}`} style={grabStyle(d)} />
            ))}

            <div
                className="frame-header"
                style={{
                    position: 'absolute',
                    top: BORDER,
                    left: BORDER,
                    right: BORDER,
                    height: HEADER_H,
                    background: '#2a2a4a',
                    cursor: 'grab',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: 2,
                    borderRadius: '2px 2px 0 0',
                    borderBottom: '1px solid #383858',
                }}
            >
                {buttons?.map((btn, i) => (
                    <button
                        key={i}
                        className="frame-btn"
                        title={btn.tooltip}
                        onClick={btn.handler}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#9090b0',
                            padding: '0 6px',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            lineHeight: 1,
                        }}
                    >
                        {btn.icon}
                    </button>
                ))}
            </div>

            <MessageContext.Provider value={message}>
                <div
                    style={{
                        position: 'absolute',
                        top: BORDER + HEADER_H,
                        left: BORDER,
                        right: BORDER,
                        bottom: BORDER,
                        overflow: 'auto',
                        background: '#12121f',
                    }}
                >
                    {children}
                </div>
            </MessageContext.Provider>
        </div>
    )
}
