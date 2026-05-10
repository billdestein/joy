import { useEffect, useRef, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { GridApi, ColDef } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { canvas } from '../Frames'
import { ButtonIcons } from '../ButtonIcons'
import { WorkbookApplet } from '../WorkbookApplet'

interface WorkbookRow {
    name: string
    lastModifiedISO: string
    lastModifiedAgo: string
}

interface ContextMenuState {
    x: number
    y: number
    row: WorkbookRow
}

interface Props {
    refreshRef: { current: () => Promise<void> }
}

function computeAgo(iso: string): string {
    const ms = Date.now() - new Date(iso).getTime()
    const minutes = Math.floor(ms / 60000)
    if (minutes < 60) return `${minutes} minutes ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hours ago`
    const days = Math.floor(hours / 24)
    return `${days} days ago`
}

const columnDefs: ColDef<WorkbookRow>[] = [
    { field: 'name', headerName: 'Name', sortable: true, flex: 1 },
    { field: 'lastModifiedISO', headerName: 'Last Modified', sortable: true, flex: 1 },
    { field: 'lastModifiedAgo', headerName: 'Age', sortable: false, flex: 1 },
]

export function WorkbookListApplet({ refreshRef }: Props) {
    const [rows, setRows] = useState<WorkbookRow[]>([])
    const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
    const gridApiRef = useRef<GridApi<WorkbookRow> | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    async function fetchWorkbooks() {
        try {
            const res = await fetch('/v1/workbooks/list-workbooks', { credentials: 'include' })
            if (!res.ok) return
            const data = await res.json()
            const mapped: WorkbookRow[] = (data.workbooks ?? data).map((w: { workbookName: string; createdAt: number }) => {
                const iso = new Date(w.createdAt).toISOString()
                return {
                    name: w.workbookName,
                    lastModifiedISO: iso,
                    lastModifiedAgo: computeAgo(iso),
                }
            })
            setRows(mapped)
        } catch {
            // ignore
        }
    }

    useEffect(() => {
        refreshRef.current = fetchWorkbooks
        fetchWorkbooks()
    }, [])

    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        function handleContextMenu(e: MouseEvent) {
            e.preventDefault()
            const target = e.target as Element
            const rowEl = target.closest('.ag-row')
            if (!rowEl) return
            const rowIndex = parseInt(rowEl.getAttribute('row-index') ?? '-1', 10)
            if (rowIndex < 0 || !gridApiRef.current) return
            const rowNode = gridApiRef.current.getDisplayedRowAtIndex(rowIndex)
            if (!rowNode?.data) return
            setContextMenu({ x: e.clientX, y: e.clientY, row: rowNode.data })
        }

        el.addEventListener('contextmenu', handleContextMenu)
        return () => el.removeEventListener('contextmenu', handleContextMenu)
    }, [])

    useEffect(() => {
        if (!contextMenu) return
        function dismiss() { setContextMenu(null) }
        window.addEventListener('click', dismiss)
        return () => window.removeEventListener('click', dismiss)
    }, [contextMenu])

    function handleOpen(row: WorkbookRow) {
        canvas.addFrame({
            width: 900,
            height: 600,
            renderChild: () => <WorkbookApplet workbookName={row.name} />,
            getButtons: (onClose) => [{
                icon: ButtonIcons.close,
                toolTipLabel: 'Close',
                handler: onClose,
            }],
        })
        setContextMenu(null)
    }

    function handleDelete(row: WorkbookRow) {
        console.log('delete', row.name)
        setContextMenu(null)
    }

    return (
        <div ref={containerRef} className="ag-theme-alpine-dark" style={{ width: '100%', height: '100%' }}>
            <AgGridReact<WorkbookRow>
                rowData={rows}
                columnDefs={columnDefs}
                onGridReady={(params) => { gridApiRef.current = params.api }}
            />
            {contextMenu && (
                <div style={{
                    position: 'fixed',
                    top: contextMenu.y,
                    left: contextMenu.x,
                    background: '#1a2533',
                    border: '1px solid #2a3a50',
                    borderRadius: 4,
                    zIndex: 99999,
                    minWidth: 120,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                }}>
                    {[
                        { label: 'Open', action: () => handleOpen(contextMenu.row) },
                        { label: 'Delete', action: () => handleDelete(contextMenu.row) },
                    ].map((item) => (
                        <div
                            key={item.label}
                            onClick={item.action}
                            style={{
                                padding: '7px 14px',
                                cursor: 'pointer',
                                color: '#cce0ff',
                                fontSize: 13,
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#2a4060' }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                        >
                            {item.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
