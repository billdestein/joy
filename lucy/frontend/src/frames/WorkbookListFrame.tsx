import React, { useEffect, useRef, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { GridApi, ColDef } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { WorkbookType } from '@billdestein/joy-common'
import Frame from '../Frame'
import { FrameProps, addFrame, removeFrame } from '../canvas'
import FrameHeaderButtonComponent from '../components/FrameHeaderButtonComponent'
import { ButtonIcons } from '../ButtonIcons'

type WorkbookRow = {
    name: string
    lastModifiedISO: string
    lastModifiedAgo: string
    _wb: WorkbookType
}

function formatISO(ts: number): string {
    return new Date(ts).toISOString().replace('T', ' ').replace(/\.\d+Z$/, '')
}

function formatAgo(ts: number): string {
    const diff = Date.now() - ts
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins} minutes ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} hours ago`
    return `${Math.floor(hours / 24)} days ago`
}

function toRow(wb: WorkbookType): WorkbookRow {
    return {
        name: wb.workbookName,
        lastModifiedISO: formatISO(wb.createdAt),
        lastModifiedAgo: formatAgo(wb.createdAt),
        _wb: wb,
    }
}

type ContextMenuState = { x: number; y: number; wb: WorkbookType } | null

export default function WorkbookListFrame(props: FrameProps) {
    const { frameId } = props
    const [rowData, setRowData] = useState<WorkbookRow[]>([])
    const [contextMenu, setContextMenu] = useState<ContextMenuState>(null)
    const gridApiRef = useRef<GridApi | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const colDefs: ColDef[] = [
        { field: 'name', sortable: true, flex: 1 },
        { field: 'lastModifiedISO', headerName: 'Last Modified', sortable: true, flex: 1, cellStyle: { fontFamily: 'monospace' } },
        { field: 'lastModifiedAgo', headerName: 'Age', sortable: false, flex: 1 },
    ]

    async function loadWorkbooks() {
        const res = await fetch('/v1/workbooks/list-workbooks', { credentials: 'include' })
        const data = await res.json()
        const rows = (data.workbooks as WorkbookType[]).map(toRow)
        setRowData(rows)
        gridApiRef.current?.setRowData(rows)
    }

    useEffect(() => { loadWorkbooks() }, [])

    useEffect(() => {
        const handler = () => loadWorkbooks()
        window.addEventListener('workbooks-changed', handler)
        return () => window.removeEventListener('workbooks-changed', handler)
    }, [])

    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        function onContextMenu(e: MouseEvent) {
            e.preventDefault()
            const rowEl = (e.target as Element).closest('.ag-row') as HTMLElement | null
            if (!rowEl || !gridApiRef.current) return
            const rowIndex = parseInt(rowEl.getAttribute('row-index') ?? '-1')
            if (rowIndex < 0) return
            const node = gridApiRef.current.getDisplayedRowAtIndex(rowIndex)
            if (!node?.data) return
            const wb = (node.data as WorkbookRow)._wb
            setContextMenu({ x: e.clientX, y: e.clientY, wb })
        }

        el.addEventListener('contextmenu', onContextMenu)
        return () => el.removeEventListener('contextmenu', onContextMenu)
    }, [])

    useEffect(() => {
        if (!contextMenu) return
        function close() { setContextMenu(null) }
        document.addEventListener('click', close)
        return () => document.removeEventListener('click', close)
    }, [contextMenu])

    function openWorkbook(wb: WorkbookType) {
        import('./WorkbookFrame').then(m => {
            addFrame(m.default, { message: { workbookName: wb.workbookName }, width: 1200, height: 800 })
        })
    }

    function promptForName(prompt: string, cb: (name: string) => void) {
        import('./PromptFrame').then(m => {
            addFrame(m.default, {
                message: { prompt, onOk: cb, onClose: () => {} },
                isModal: true,
                width: 400,
                height: 200,
            })
        })
    }

    async function cloneWorkbook(wb: WorkbookType, newName: string) {
        console.log('[clone] start', newName)
        try {
            const cloneRes = await fetch('/v1/workbooks/clone-workbook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ workbook: wb, newWorkbookName: newName }),
            })
            console.log('[clone] fetch done, status', cloneRes.status)
            if (!cloneRes.ok) {
                const err = await cloneRes.json().catch(() => ({ error: cloneRes.statusText }))
                alert(`Clone failed: ${err.error}`)
                return
            }
            window.dispatchEvent(new CustomEvent('workbooks-changed'))
            console.log('[clone] list refreshed, opening frame')
            const m = await import('./WorkbookFrame')
            addFrame(m.default, { message: { workbookName: newName }, width: 1200, height: 800 })
            console.log('[clone] addFrame called')
        } catch (err: any) {
            console.error('[clone] error:', err)
            alert(`Clone error: ${err.message}`)
        }
    }

    async function deleteWorkbook(wb: WorkbookType) {
        const res = await fetch('/v1/workbooks/delete-workbook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ workbookName: wb.workbookName }),
        })
        const data = await res.json()
        setRowData((data.workbooks as WorkbookType[]).map(toRow))
    }

    function downloadWorkbook(wb: WorkbookType) {
        const blob = new Blob([JSON.stringify(wb, null, 4)], { type: 'application/json' })
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = 'workbook.lucy'
        a.click()
    }

    const headerButtons = (
        <>
            <FrameHeaderButtonComponent
                icon={ButtonIcons.plus}
                tooltipLabel="New Workbook"
                handler={() => promptForName('Enter a name for your new workbook', async (name) => {
                    await fetch('/v1/workbooks/create-workbook', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ workbookName: name }),
                    })
                    loadWorkbooks()
                })}
            />
            <FrameHeaderButtonComponent
                icon={ButtonIcons.upload}
                tooltipLabel="Upload Workbook"
                handler={() => {
                    import('./UploadWorkbookFrame').then(m => {
                        addFrame(m.default, { message: { onUploaded: loadWorkbooks }, isModal: true, width: 500, height: 300 })
                    })
                }}
            />
            <FrameHeaderButtonComponent
                icon={ButtonIcons.x}
                tooltipLabel="Close"
                handler={() => removeFrame(frameId)}
            />
        </>
    )

    return (
        <Frame {...props} title="Workbooks" headerButtons={headerButtons}>
            <div
                ref={containerRef}
                className="ag-theme-alpine-dark"
                style={{ width: '100%', height: '100%' }}
            >
                <AgGridReact
                    rowData={rowData}
                    columnDefs={colDefs}
                    onGridReady={e => { gridApiRef.current = e.api }}
                    rowSelection="single"
                    onRowClicked={e => { if (e.data) openWorkbook((e.data as WorkbookRow)._wb) }}
                />
            </div>
            {contextMenu && (
                <div
                    onClick={e => e.stopPropagation()}
                    style={{
                        position: 'fixed',
                        left: contextMenu.x,
                        top: contextMenu.y,
                        background: '#252526',
                        border: '1px solid #555',
                        borderRadius: 4,
                        zIndex: 99999,
                        minWidth: 180,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    }}
                >
                    {[
                        { label: 'Open workbook', action: () => { openWorkbook(contextMenu.wb); setContextMenu(null) } },
                        { label: 'Clone workbook', action: () => { setContextMenu(null); promptForName('Enter a name for the clone', name => cloneWorkbook(contextMenu.wb, name)) } },
                        { label: 'Delete workbook', action: () => { setContextMenu(null); deleteWorkbook(contextMenu.wb) } },
                        { label: 'Download workbook', action: () => { downloadWorkbook(contextMenu.wb); setContextMenu(null) } },
                    ].map(item => (
                        <div
                            key={item.label}
                            onClick={item.action}
                            onMouseEnter={e => (e.currentTarget.style.background = '#094771')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            style={{ padding: '7px 14px', color: '#ccc', cursor: 'pointer', fontSize: 13 }}
                        >
                            {item.label}
                        </div>
                    ))}
                </div>
            )}
        </Frame>
    )
}
