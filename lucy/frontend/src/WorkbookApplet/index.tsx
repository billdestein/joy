import React, { useRef, useState } from 'react'
import { canvas } from '../Frames/Canvas'
import { ButtonIcons } from '../ButtonIcons'

interface Props {
  workbookName: string
  onClose: () => void
}

export function WorkbookApplet({ workbookName }: Props) {
  const [leftPct, setLeftPct] = useState(30)
  const [topPct, setTopPct] = useState(60)
  const containerRef = useRef<HTMLDivElement>(null)
  const rightPaneRef = useRef<HTMLDivElement>(null)

  function onVerticalDividerMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    const dragging = { active: true }

    function onMouseMove(ev: MouseEvent) {
      if (!dragging.active || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const pct = ((ev.clientX - rect.left) / rect.width) * 100
      setLeftPct(Math.min(80, Math.max(10, pct)))
    }

    function onMouseUp() {
      dragging.active = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  function onHorizontalDividerMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    const dragging = { active: true }

    function onMouseMove(ev: MouseEvent) {
      if (!dragging.active || !rightPaneRef.current) return
      const rect = rightPaneRef.current.getBoundingClientRect()
      const pct = ((ev.clientY - rect.top) / rect.height) * 100
      setTopPct(Math.min(80, Math.max(10, pct)))
    }

    function onMouseUp() {
      dragging.active = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  return (
    <div ref={containerRef} style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Left pane */}
      <div style={{ width: `${leftPct}%`, overflow: 'auto', background: '#2a2a2a', color: '#ddd', padding: 8, flexShrink: 0 }}>
        {workbookName}
      </div>

      {/* Vertical divider */}
      <div
        style={{ width: 5, cursor: 'col-resize', background: '#555', flexShrink: 0 }}
        onMouseDown={onVerticalDividerMouseDown}
      />

      {/* Right pane — split top/bottom */}
      <div ref={rightPaneRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top pane */}
        <div style={{ height: `${topPct}%`, overflow: 'auto', background: '#252525', flexShrink: 0 }} />

        {/* Horizontal divider */}
        <div
          style={{ height: 5, cursor: 'row-resize', background: '#555', flexShrink: 0 }}
          onMouseDown={onHorizontalDividerMouseDown}
        />

        {/* Bottom pane */}
        <div style={{ flex: 1, overflow: 'auto', background: '#202020' }} />
      </div>
    </div>
  )
}

export function openWorkbookApplet(workbookName: string) {
  let frameId: number
  frameId = canvas.addFrame({
    x: 80,
    y: 60,
    width: 800,
    height: 600,
    buttons: [
      { icon: ButtonIcons.close, toolTipLabel: 'Close', handler: () => canvas.removeFrame(frameId) },
    ],
    children: (
      <WorkbookApplet
        workbookName={workbookName}
        onClose={() => canvas.removeFrame(frameId)}
      />
    ),
  })
}
