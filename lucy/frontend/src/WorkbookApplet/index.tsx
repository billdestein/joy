import React, { useRef, useState, useCallback } from 'react'
import { PicListComponent } from '../PicListComponent'
import { ViewerComponent } from '../ViewerComponent'

interface Props {
    workbookName: string
    onClose: () => void
}

export function WorkbookApplet({ workbookName: _workbookName, onClose: _onClose }: Props) {
    const [leftPct, setLeftPct] = useState(30)
    const [topPct, setTopPct] = useState(60)
    const containerRef = useRef<HTMLDivElement>(null)
    const hDragRef = useRef<{ startX: number; startPct: number } | null>(null)
    const vDragRef = useRef<{ startY: number; startPct: number } | null>(null)

    const onHSplitterMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        hDragRef.current = { startX: e.clientX, startPct: leftPct }
    }, [leftPct])

    const onVSplitterMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        vDragRef.current = { startY: e.clientY, startPct: topPct }
    }, [topPct])

    React.useEffect(() => {
        function onMouseMove(e: MouseEvent) {
            if (hDragRef.current && containerRef.current) {
                const totalW = containerRef.current.clientWidth
                const dx = e.clientX - hDragRef.current.startX
                const newPct = Math.max(10, Math.min(90, hDragRef.current.startPct + (dx / totalW) * 100))
                setLeftPct(newPct)
            }
            if (vDragRef.current && containerRef.current) {
                const rightPane = containerRef.current.querySelector('.right-pane') as HTMLElement | null
                if (!rightPane) return
                const totalH = rightPane.clientHeight
                const dy = e.clientY - vDragRef.current.startY
                const newPct = Math.max(10, Math.min(90, vDragRef.current.startPct + (dy / totalH) * 100))
                setTopPct(newPct)
            }
        }
        function onMouseUp() {
            hDragRef.current = null
            vDragRef.current = null
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
            ref={containerRef}
            style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}
        >
            {/* Left pane */}
            <div style={{ width: `${leftPct}%`, height: '100%', overflow: 'hidden', flexShrink: 0 }}>
                <PicListComponent />
            </div>

            {/* Horizontal splitter */}
            <div
                onMouseDown={onHSplitterMouseDown}
                style={{
                    width: 5,
                    flexShrink: 0,
                    background: '#2a3a50',
                    cursor: 'col-resize',
                    height: '100%',
                }}
            />

            {/* Right pane */}
            <div
                className="right-pane"
                style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            >
                {/* Upper right */}
                <div style={{ height: `${topPct}%`, overflow: 'hidden', flexShrink: 0 }}>
                    <ViewerComponent />
                </div>

                {/* Vertical splitter */}
                <div
                    onMouseDown={onVSplitterMouseDown}
                    style={{
                        height: 5,
                        flexShrink: 0,
                        background: '#2a3a50',
                        cursor: 'row-resize',
                        width: '100%',
                    }}
                />

                {/* Lower right */}
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a6070', fontSize: 13 }}>
                    {/* placeholder */}
                </div>
            </div>
        </div>
    )
}
