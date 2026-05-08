import React, { useState, useEffect, useCallback } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { ColDef, CellContextMenuEvent } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { WorkbookType } from '@billdestein/joy-common'

interface WorkbookRow {
    name: string
    lastModifiedISO: string
    lastModifiedAgo: string
}

function formatAgo(ts: number): string {
    const diff = Date.now() - ts
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`
    if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`
    return `${Math.max(0, minutes)} minute${minutes === 1 ? '' : 's'} ago`
}

export default function WorkbookListApplet() {
    const [rowData, setRowData] = useState<WorkbookRow[]>([])
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; workbookName: string } | null>(null)

    const colDefs: ColDef<WorkbookRow>[] = [
        { field: 'name', headerName: 'Name', sortable: true },
        { field: 'lastModifiedISO', headerName: 'Last Modified', sortable: true },
        { field: 'lastModifiedAgo', headerName: 'Modified Ago', sortable: false },
    ]

    useEffect(() => {
        fetch('/v1/workbooks/list-workbooks', { credentials: 'include' })
            .then(r => r.json())
            .then((data: { workbooks: WorkbookType[] }) => {
                setRowData(
                    data.workbooks.map(w => {
                        const ts = w.lastModified ?? 0
                        return {
                            name: w.workbookName,
                            lastModifiedISO: ts > 0 ? new Date(ts).toISOString() : '',
                            lastModifiedAgo: ts > 0 ? formatAgo(ts) : '',
                        }
                    })
                )
            })
            .catch(console.error)
    }, [])

    const onCellContextMenu = useCallback((event: CellContextMenuEvent<WorkbookRow>) => {
        const e = event.event as MouseEvent
        e.preventDefault()
        setContextMenu({ x: e.clientX, y: e.clientY, workbookName: event.data?.name ?? '' })
    }, [])

    useEffect(() => {
        const dismiss = () => setContextMenu(null)
        document.addEventListener('click', dismiss)
        return () => document.removeEventListener('click', dismiss)
    }, [])

    return (
        <div style={{ height: '100%', width: '100%', position: 'relative' }} className="ag-theme-alpine-dark">
            <AgGridReact
                rowData={rowData}
                columnDefs={colDefs}
                onCellContextMenu={onCellContextMenu}
                suppressContextMenu={true}
            />
            {contextMenu && (
                <div
                    onClick={e => e.stopPropagation()}
                    style={{
                        position: 'fixed',
                        top: contextMenu.y,
                        left: contextMenu.x,
                        background: '#222',
                        color: 'white',
                        border: '1px solid #444',
                        borderRadius: 4,
                        zIndex: 10000,
                        minWidth: 120,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{ padding: '8px 16px', cursor: 'pointer' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#333')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        onClick={() => { console.log('open', contextMenu.workbookName); setContextMenu(null) }}
                    >
                        Open
                    </div>
                    <div
                        style={{ padding: '8px 16px', cursor: 'pointer' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#333')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        onClick={() => { console.log('delete', contextMenu.workbookName); setContextMenu(null) }}
                    >
                        Delete
                    </div>
                </div>
            )}
        </div>
    )
}
