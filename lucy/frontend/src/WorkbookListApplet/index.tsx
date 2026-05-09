import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community'
import { WorkbookType } from '@billdestein/joy-common'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { canvas } from '../Frames/Canvas'
import { ButtonIcons } from '../ButtonIcons'
import { GetWorkbookNameApplet } from '../GetWorkbookNameApplet'
import { UploadWorkbookApplet } from '../UploadWorkbookApplet'
import { WorkbookApplet } from '../WorkbookApplet'

const BACKEND = 'http://localhost:8080'

interface RowData {
  workbookName: string
  lastModifiedISO: string
  lastModifiedAgo: string
}

function toAgo(ts: number): string {
  const diffMs = Date.now() - ts
  const mins = Math.floor(diffMs / 60000)
  if (mins < 60) return `${mins} minutes ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hours ago`
  const days = Math.floor(hours / 24)
  return `${days} days ago`
}

function toRowData(workbooks: WorkbookType[]): RowData[] {
  return workbooks.map(wb => ({
    workbookName: wb.workbookName,
    lastModifiedISO: new Date(wb.createdAt).toISOString(),
    lastModifiedAgo: toAgo(wb.createdAt),
  }))
}

const colDefs: ColDef<RowData>[] = [
  { field: 'workbookName', headerName: 'Name', sortable: true, flex: 1 },
  { field: 'lastModifiedISO', headerName: 'Modified', sortable: true, flex: 1 },
  { field: 'lastModifiedAgo', headerName: 'Age', sortable: false, flex: 1 },
]

interface ContextMenuState {
  x: number
  y: number
  workbookName: string
}

interface Props {
  onClose: () => void
  onRegisterRefresh?: (fn: () => void) => void
}

export function WorkbookListApplet({ onClose: _onClose, onRegisterRefresh }: Props) {
  const [rowData, setRowData] = useState<RowData[]>([])
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const gridApiRef = useRef<GridApi<RowData> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const fetchWorkbooks = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND}/v1/workbooks/list-workbooks`, { credentials: 'include' })
      if (!res.ok) return
      const data = (await res.json()) as { workbooks: WorkbookType[] }
      setRowData(toRowData(data.workbooks))
    } catch (err) {
      console.error('Failed to fetch workbooks:', err)
    }
  }, [])

  useEffect(() => {
    fetchWorkbooks()
    onRegisterRefresh?.(fetchWorkbooks)
  }, [fetchWorkbooks, onRegisterRefresh])

  // Native contextmenu listener — reliable across AG Grid versions
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    function handleContextMenu(e: MouseEvent) {
      e.preventDefault()
      const rowEl = (e.target as Element).closest<HTMLElement>('.ag-row')
      if (!rowEl) return
      const rowIndex = parseInt(rowEl.getAttribute('row-index') ?? '-1', 10)
      if (rowIndex < 0) return
      const node = gridApiRef.current?.getDisplayedRowAtIndex(rowIndex)
      if (!node?.data) return
      setContextMenu({ x: e.clientX, y: e.clientY, workbookName: node.data.workbookName })
    }

    container.addEventListener('contextmenu', handleContextMenu)
    return () => container.removeEventListener('contextmenu', handleContextMenu)
  }, [])

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenu) return
    function handler() { setContextMenu(null) }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [contextMenu])

  function handleOpen(workbookName: string) {
    setContextMenu(null)
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

  function handleDelete(workbookName: string) {
    console.log('delete', workbookName)
    setContextMenu(null)
  }

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div className="ag-theme-alpine-dark" style={{ width: '100%', height: '100%' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={colDefs}
          rowSelection="single"
          onGridReady={(e: GridReadyEvent<RowData>) => { gridApiRef.current = e.api }}
        />
      </div>
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            background: '#333',
            border: '1px solid #555',
            borderRadius: 4,
            zIndex: 10000,
            minWidth: 120,
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}
          onClick={e => e.stopPropagation()}
        >
          <div style={menuItemStyle} onClick={() => handleOpen(contextMenu.workbookName)}>Open</div>
          <div style={menuItemStyle} onClick={() => handleDelete(contextMenu.workbookName)}>Delete</div>
        </div>
      )}
    </div>
  )
}

const menuItemStyle: React.CSSProperties = {
  padding: '7px 16px',
  cursor: 'pointer',
  color: '#ddd',
  fontSize: 13,
}

export function openWorkbookListApplet() {
  const refreshRef: { fn: (() => void) | null } = { fn: null }

  function addWorkbook() {
    let modalId: number
    modalId = canvas.addFrame({
      isModal: true,
      width: 380,
      height: 170,
      x: 0,
      y: 0,
      children: (
        <GetWorkbookNameApplet
          onClose={() => canvas.removeFrame(modalId)}
          onOk={async (name) => {
            await fetch(`${BACKEND}/v1/workbooks/create-workbook`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ workbookName: name }),
            })
            refreshRef.fn?.()
          }}
        />
      ),
    })
  }

  function uploadWorkbook() {
    let modalId: number
    modalId = canvas.addFrame({
      isModal: true,
      width: 380,
      height: 170,
      x: 0,
      y: 0,
      children: (
        <UploadWorkbookApplet
          onClose={() => canvas.removeFrame(modalId)}
          onComplete={() => refreshRef.fn?.()}
        />
      ),
    })
  }

  let frameId: number
  frameId = canvas.addFrame({
    x: 40,
    y: 40,
    width: 700,
    height: 450,
    buttons: [
      { icon: ButtonIcons.plus, toolTipLabel: 'New Workbook', handler: addWorkbook },
      { icon: ButtonIcons.upload, toolTipLabel: 'Add Workbook', handler: uploadWorkbook },
      { icon: ButtonIcons.close, toolTipLabel: 'Close', handler: () => canvas.removeFrame(frameId) },
    ],
    children: (
      <WorkbookListApplet
        onClose={() => canvas.removeFrame(frameId)}
        onRegisterRefresh={(fn) => { refreshRef.fn = fn }}
      />
    ),
  })
}
