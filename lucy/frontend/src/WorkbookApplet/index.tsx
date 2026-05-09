import React, { useCallback, useEffect, useRef, useState } from 'react'
import { PicListComponent } from '../PicListComponent'
import { ViewerComponent } from '../ViewerComponent'
import { ComposerComponent } from '../ComposerComponent'

interface Props {
    workbookName: string
    onClose: () => void
}

export function WorkbookApplet({ workbookName: _workbookName, onClose: _onClose }: Props) {
    const [leftPct, setLeftPct] = useState(30)
    const [topPct, setTopPct] = useState(60)
    const containerRef = useRef<HTMLDivElement>(null)
    const hDrag = useRef<{ startX: number; startPct: number } | null>(null)
    const vDrag = useRef<{ startY: number; startPct: number } | null>(null)

    const onHDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        hDrag.current = { startX: e.clientX, startPct: leftPct }
    }, [leftPct])

    const onVDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        vDrag.current = { startY: e.clientY, startPct: topPct }
    }, [topPct])

    useEffect(() => {
        function onMove(e: MouseEvent) {
            if (hDrag.current && containerRef.current) {
                const dx = e.clientX - hDrag.current.startX
                const pct = Math.max(10, Math.min(90, hDrag.current.startPct + (dx / containerRef.current.clientWidth) * 100))
                setLeftPct(pct)
            }
            if (vDrag.current) {
                const rightPane = containerRef.current?.querySelector('.right-pane') as HTMLElement | null
                if (!rightPane) return
                const dy = e.clientY - vDrag.current.startY
                const pct = Math.max(10, Math.min(90, vDrag.current.startPct + (dy / rightPane.clientHeight) * 100))
                setTopPct(pct)
            }
        }
        function onUp() { hDrag.current = null; vDrag.current = null }
        document.addEventListener('mousemove', onMove)
        document.addEventListener('mouseup', onUp)
        return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
    }, [])

    return (
        <div ref={containerRef} style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}>
            <div style={{ width: `${leftPct}%`, height: '100%', overflow: 'hidden', flexShrink: 0 }}>
                <PicListComponent />
            </div>
            <div onMouseDown={onHDown} style={{ width: 5, flexShrink: 0, background: '#2a3a50', cursor: 'col-resize' }} />
            <div className="right-pane" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ height: `${topPct}%`, overflow: 'hidden', flexShrink: 0 }}>
                    <ViewerComponent />
                </div>
                <div onMouseDown={onVDown} style={{ height: 5, flexShrink: 0, background: '#2a3a50', cursor: 'row-resize' }} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <ComposerComponent />
                </div>
            </div>
        </div>
    )
}
