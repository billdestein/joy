import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { GridApi, ColDef } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { WorkbookType } from '@billdestein/joy-common'
import { canvas } from '../Frames'
import { ButtonIcons } from '../ButtonIcons'
import { WorkbookApplet } from '../WorkbookApplet'

interface Props {
    onClose: () => void
    refreshRef?: React.MutableRefObject<() => Promise<void>>
}

interface RowData {
    name: string
    lastModifiedISO: string
    lastModifiedAgo: string
    workbook: WorkbookType
}

function computeLastModified(wb: WorkbookType): number {
    const picTimes = wb.pics.map((p) => p.createdAt)
    return Math.max(wb.createdAt, ...picTimes)
}

function formatISO(ts: number): string {
    return new Date(ts).toISOString().replace('T', ' ').slice(0, 19)
}

function formatAgo(ts: number): string {
    const diff = Date.now() - ts
    const days = Math.floor(diff / 86400000)
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor(diff / 60000)
    if (days > 0) return `${days} day${days !== 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    return `${Math.max(0, minutes)} minute${minutes !== 1 ? 's' : ''} ago`
}

interface ContextMenuState {
    x: number
    y: number
    workbook: WorkbookType
}

export function WorkbookListApplet({ onClose: _onClose, refreshRef }: Props) {
    const [rowData, setRowData] = useState<RowData[]>([])
    const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
    const gridApiRef = useRef<GridApi | null>(null)
    const gridContainerRef = useRef<HTMLDivElement>(null)

    const columnDefs: ColDef[] = [
        { field: 'name', headerName: 'Name', sortable: true, flex: 1 },
        { field: 'lastModifiedISO', headerName: 'Last Modified', sortable: true, width: 180 },
        { field: 'lastModifiedAgo', headerName: 'When', sortable: false, width: 140 },
    ]

    const loadWorkbooks = useCallback(async () => {
        try {
            const res = await fetch('/v1/workbooks/list-workbooks', { credentials: 'include' })
            const data = await res.json() as { workbooks: WorkbookType[] }
            const rows: RowData[] = data.workbooks.map((wb) => {
                const ts = computeLastModified(wb)
                return {
                    name: wb.workbookName,
                    lastModifiedISO: formatISO(ts),
                    lastModifiedAgo: formatAgo(ts),
                    workbook: wb,
                }
            })
            setRowData(rows)
        } catch (err) {
            console.error('Failed to load workbooks', err)
        }
    }, [])

    useEffect(() => {
        loadWorkbooks()
    }, [loadWorkbooks])

    useEffect(() => {
        if (refreshRef) {
            refreshRef.current = loadWorkbooks
        }
    }, [refreshRef, loadWorkbooks])

    useEffect(() => {
        const container = gridContainerRef.current
        if (!container) return

        function handleContextMenu(e: MouseEvent) {
            e.preventDefault()
            const api = gridApiRef.current
            if (!api) return

            const rowEl = (e.target as HTMLElement).closest('.ag-row') as HTMLElement | null
            if (!rowEl) return

            const rowIndexAttr = rowEl.getAttribute('row-index')
            if (rowIndexAttr == null) return

            const rowIndex = parseInt(rowIndexAttr, 10)
            const rowNode = api.getDisplayedRowAtIndex(rowIndex)
            if (!rowNode) return

            const row = rowNode.data as RowData
            setContextMenu({ x: e.clientX, y: e.clientY, workbook: row.workbook })
        }

        container.addEventListener('contextmenu', handleContextMenu)
        return () => container.removeEventListener('contextmenu', handleContextMenu)
    }, [])

    useEffect(() => {
        if (!contextMenu) return
        function handleClick() { setContextMenu(null) }
        document.addEventListener('click', handleClick)
        return () => document.removeEventListener('click', handleClick)
    }, [contextMenu])

    const openWorkbook = useCallback((workbook: WorkbookType) => {
        canvas.addFrame({
            width: 800,
            height: 600,
            renderChild: (onClose) => (
                <WorkbookApplet workbookName={workbook.workbookName} onClose={onClose} />
            ),
            getButtons: (onClose) => [
                { icon: ButtonIcons.close, toolTipLabel: 'Close', handler: onClose },
            ],
        })
    }, [])

    return (
        <div
            ref={gridContainerRef}
            className="ag-theme-alpine-dark"
            style={{ width: '100%', height: '100%', position: 'relative' }}
        >
            <AgGridReact
                columnDefs={columnDefs}
                rowData={rowData}
                onGridReady={(params) => { gridApiRef.current = params.api }}
                rowSelection="single"
                suppressContextMenu={true}
            />

            {contextMenu && (
                <div
                    style={{
                        position: 'fixed',
                        top: contextMenu.y,
                        left: contextMenu.x,
                        background: '#1e2a38',
                        border: '1px solid #3a5070',
                        borderRadius: 4,
                        zIndex: 99999,
                        minWidth: 120,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div
                        onClick={() => { openWorkbook(contextMenu.workbook); setContextMenu(null) }}
                        style={menuItemStyle}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#2a3a50')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                        Open
                    </div>
                    <div
                        onClick={() => { console.log('delete'); setContextMenu(null) }}
                        style={menuItemStyle}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#2a3a50')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                        Delete
                    </div>
                </div>
            )}
        </div>
    )
}

const menuItemStyle: React.CSSProperties = {
    padding: '8px 16px',
    cursor: 'pointer',
    color: '#cce0ff',
    fontSize: 13,
    background: 'transparent',
}
