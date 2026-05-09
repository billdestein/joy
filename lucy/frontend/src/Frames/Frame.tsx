import React, { useRef, useEffect } from 'react'
import { FrameEntry } from './types'
import { FrameHeaderButtonComponent } from './FrameHeaderButtonComponent'
import { canvasEl, getNextZ } from './Canvas'

const BORDER = 5
const HEADER_HEIGHT = 30
const DETECT = 10
const MIN_VISIBLE = 40

interface Props {
  entry: FrameEntry
}

type ResizeEdges = { left: boolean; right: boolean; top: boolean; bottom: boolean }

export function Frame({ entry }: Props) {
  const { config, initialZ } = entry
  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = divRef.current
    if (!el) return

    let isDragging = false
    let isResizing = false
    let resizeEdges: ResizeEdges = { left: false, right: false, top: false, bottom: false }

    let startMouseX = 0
    let startMouseY = 0
    let startLeft = 0
    let startTop = 0
    let startWidth = 0
    let startHeight = 0

    function getEdges(e: MouseEvent): ResizeEdges {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      return {
        left: x < DETECT,
        right: x > rect.width - DETECT,
        top: y < DETECT,
        bottom: y > rect.height - DETECT,
      }
    }

    function getCursor(e: MouseEvent): string {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const nearLeft = x < DETECT
      const nearRight = x > rect.width - DETECT
      const nearTop = y < DETECT
      const nearBottom = y > rect.height - DETECT
      const inHeader = y < BORDER + HEADER_HEIGHT

      if ((nearTop && nearLeft) || (nearBottom && nearRight)) return 'nwse-resize'
      if ((nearTop && nearRight) || (nearBottom && nearLeft)) return 'nesw-resize'
      if (nearLeft || nearRight) return 'ew-resize'
      if (nearTop || nearBottom) return 'ns-resize'
      if (inHeader) return 'grab'
      return 'default'
    }

    function onMouseMove(e: MouseEvent) {
      el.style.cursor = getCursor(e)
    }

    function onMouseDown(e: MouseEvent) {
      // Bring to front
      el.style.zIndex = String(getNextZ())

      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const edges = getEdges(e)
      const nearAnyEdge = edges.left || edges.right || edges.top || edges.bottom
      const inHeader = y < BORDER + HEADER_HEIGHT

      startMouseX = e.clientX
      startMouseY = e.clientY
      startLeft = parseInt(el.style.left || '0', 10)
      startTop = parseInt(el.style.top || '0', 10)
      startWidth = parseInt(el.style.width || String(config.width), 10)
      startHeight = parseInt(el.style.height || String(config.height), 10)

      if (nearAnyEdge) {
        isResizing = true
        resizeEdges = edges
        el.style.cursor = getCursor(e)
        document.addEventListener('mousemove', onDocMouseMove)
        document.addEventListener('mouseup', onDocMouseUp)
        e.preventDefault()
      } else if (inHeader) {
        isDragging = true
        el.style.cursor = 'grabbing'
        document.addEventListener('mousemove', onDocMouseMove)
        document.addEventListener('mouseup', onDocMouseUp)
        e.preventDefault()
      }
    }

    function onDocMouseMove(e: MouseEvent) {
      const dx = e.clientX - startMouseX
      const dy = e.clientY - startMouseY
      const canvasBounds = canvasEl.current?.getBoundingClientRect()
      const canvasWidth = canvasBounds?.width ?? window.innerWidth
      const canvasHeight = canvasBounds?.height ?? window.innerHeight

      if (isDragging) {
        let newLeft = startLeft + dx
        let newTop = startTop + dy

        // Top constraint: frame top can't go above canvas top
        newTop = Math.max(0, newTop)
        // Bottom constraint: bottom of header can't go below canvas bottom
        newTop = Math.min(canvasHeight - BORDER - HEADER_HEIGHT, newTop)
        // Horizontal: never reveal less than MIN_VISIBLE pixels
        newLeft = Math.max(-(startWidth - MIN_VISIBLE), newLeft)
        newLeft = Math.min(canvasWidth - MIN_VISIBLE, newLeft)

        el.style.left = `${newLeft}px`
        el.style.top = `${newTop}px`
      } else if (isResizing) {
        let newLeft = startLeft
        let newTop = startTop
        let newWidth = startWidth
        let newHeight = startHeight

        if (resizeEdges.right) newWidth = Math.max(100, startWidth + dx)
        if (resizeEdges.bottom) newHeight = Math.max(60, startHeight + dy)
        if (resizeEdges.left) {
          newWidth = Math.max(100, startWidth - dx)
          newLeft = startLeft + (startWidth - newWidth)
        }
        if (resizeEdges.top) {
          newHeight = Math.max(60, startHeight - dy)
          newTop = startTop + (startHeight - newHeight)
        }

        el.style.left = `${newLeft}px`
        el.style.top = `${newTop}px`
        el.style.width = `${newWidth}px`
        el.style.height = `${newHeight}px`
      }
    }

    function onDocMouseUp() {
      isDragging = false
      isResizing = false
      el.style.cursor = 'default'
      document.removeEventListener('mousemove', onDocMouseMove)
      document.removeEventListener('mouseup', onDocMouseUp)
    }

    el.addEventListener('mousemove', onMouseMove)
    el.addEventListener('mousedown', onMouseDown)

    return () => {
      el.removeEventListener('mousemove', onMouseMove)
      el.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mousemove', onDocMouseMove)
      document.removeEventListener('mouseup', onDocMouseUp)
    }
  }, [config.width, config.height])

  const isModal = config.isModal ?? false
  const left = isModal
    ? undefined
    : config.x
  const top = isModal
    ? undefined
    : config.y

  const modalStyle: React.CSSProperties = isModal
    ? {
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }
    : {
        position: 'absolute',
        left,
        top,
      }

  return (
    <div
      ref={divRef}
      style={{
        ...modalStyle,
        width: config.width,
        height: config.height,
        zIndex: initialZ,
        border: `${BORDER}px solid #555`,
        borderRadius: 4,
        background: '#2a2a2a',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        userSelect: 'none',
      }}
    >
      {/* Header */}
      <div
        style={{
          height: HEADER_HEIGHT,
          background: '#383838',
          borderBottom: '1px solid #555',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 4px',
          flexShrink: 0,
          cursor: 'grab',
        }}
      >
        {(config.buttons ?? []).map((btn, i) => (
          <FrameHeaderButtonComponent key={i} {...btn} />
        ))}
      </div>
      {/* Applet */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {config.children}
      </div>
    </div>
  )
}
