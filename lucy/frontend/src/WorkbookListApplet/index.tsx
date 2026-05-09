import { useEffect, useState, useCallback, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef, CellContextMenuEvent } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import type { WorkbookType } from '@billdestein/joy-common'

type Props = {
    onReady?: (refresh: () => void) => void
}

type RowData = {
    name: string
    lastModifiedISO: string
    lastModifiedAgo: string
    _workbook: WorkbookType
}

type ContextMenu = {
    x: number
    y: number
    workbook: WorkbookType
} | null

function getLastModified(wb: WorkbookType): number {
    return Math.max(wb.createdAt, ...wb.pics.map(p => p.createdAt))
}

function formatAgo(ts: number): string {
    const diff = Date.now() - ts
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (days > 0) return `${days} day${days !== 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    return `${Math.max(0, minutes)} minute${minutes !== 1 ? 's' : ''} ago`
}

function toRowData(wb: WorkbookType): RowData {
    const ts = getLastModified(wb)
    return {
        name: wb.workbookName,
        lastModifiedISO: new Date(ts).toISOString(),
        lastModifiedAgo: formatAgo(ts),
        _workbook: wb,
    }
}

const COL_DEFS: ColDef<RowData>[] = [
    { field: 'name', headerName: 'Name', sortable: true, flex: 1 },
    { field: 'lastModifiedISO', headerName: 'Last Modified', sortable: true, width: 220 },
    { field: 'lastModifiedAgo', headerName: 'Age', sortable: false, width: 140 },
]

export default function WorkbookListApplet({ onReady }: Props) {
    const [rows, setRows] = useState<RowData[]>([])
    const [contextMenu, setContextMenu] = useState<ContextMenu>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const loadWorkbooks = useCallback(() => {
        fetch('/v1/workbooks/list-workbooks', { credentials: 'include' })
            .then(r => r.json())
            .then(data => setRows((data.workbooks as WorkbookType[]).map(toRowData)))
            .catch(console.error)
    }, [])

    useEffect(() => {
        loadWorkbooks()
        onReady?.(loadWorkbooks)
    }, [loadWorkbooks, onReady])

    const onCellContextMenu = useCallback((e: CellContextMenuEvent<RowData>) => {
        const mouseEvent = e.event as MouseEvent
        mouseEvent.preventDefault()
        setContextMenu({
            x: mouseEvent.clientX,
            y: mouseEvent.clientY,
            workbook: e.data!._workbook,
        })
    }, [])

    const closeMenu = useCallback(() => setContextMenu(null), [])

    useEffect(() => {
        if (!contextMenu) return
        const handler = () => closeMenu()
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [contextMenu, closeMenu])

    return (
        <div
            ref={containerRef}
            style={{ width: '100%', height: '100%', position: 'relative' }}
            onClick={closeMenu}
        >
            <div className="ag-theme-alpine-dark" style={{ width: '100%', height: '100%' }}>
                <AgGridReact<RowData>
                    rowData={rows}
                    columnDefs={COL_DEFS}
                    onCellContextMenu={onCellContextMenu}
                    preventDefaultOnContextMenu={true}
                    rowSelection="single"
                />
            </div>

            {contextMenu && (
                <div
                    style={{
                        position: 'fixed',
                        left: contextMenu.x,
                        top: contextMenu.y,
                        background: '#2a2a2a',
                        border: '1px solid #555',
                        borderRadius: 4,
                        zIndex: 99999,
                        minWidth: 120,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                        overflow: 'hidden',
                    }}
                    onMouseDown={e => e.stopPropagation()}
                >
                    <ContextMenuItem label="Open" onClick={() => { console.log('open', contextMenu.workbook.workbookName); closeMenu() }} />
                    <ContextMenuItem label="Delete" onClick={() => { console.log('delete', contextMenu.workbook.workbookName); closeMenu() }} />
                </div>
            )}
        </div>
    )
}

function ContextMenuItem({ label, onClick }: { label: string; onClick: () => void }) {
    const [hovered, setHovered] = useState(false)
    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                padding: '8px 16px',
                cursor: 'pointer',
                color: '#ccc',
                fontSize: 13,
                background: hovered ? '#3a3a5a' : 'transparent',
            }}
        >
            {label}
        </div>
    )
}
