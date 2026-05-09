import React, { useRef, useState } from 'react'
import { canvas } from '../Frames/Canvas'
import { ButtonIcons } from '../ButtonIcons'

interface Props {
  workbookName: string
  onClose: () => void
}

export function WorkbookApplet({ workbookName }: Props) {
  const [leftPct, setLeftPct] = useState(30)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  function onDividerMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    dragging.current = true

    function onMouseMove(ev: MouseEvent) {
      if (!dragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const pct = ((ev.clientX - rect.left) / rect.width) * 100
      setLeftPct(Math.min(80, Math.max(10, pct)))
    }

    function onMouseUp() {
      dragging.current = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  return (
    <div ref={containerRef} style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <div style={{ width: `${leftPct}%`, overflow: 'auto', background: '#2a2a2a', color: '#ddd', padding: 8 }}>
        {workbookName}
      </div>
      <div
        style={{ width: 5, cursor: 'col-resize', background: '#555', flexShrink: 0 }}
        onMouseDown={onDividerMouseDown}
      />
      <div style={{ flex: 1, overflow: 'auto', background: '#252525' }} />
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
