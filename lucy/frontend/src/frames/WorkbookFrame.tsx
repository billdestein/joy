import React, { useState, useEffect, useRef } from 'react'
import { WorkbookType } from '@billdestein/joy-common'
import Frame from '../Frame'
import { FrameProps, addFrame, removeFrame } from '../canvas'
import { WorkbookContext } from '../WorkbookContext'
import { stripForBackend, hydrateFromBackend } from '../workbookProtocol'
import FrameHeaderButtonComponent from '../components/FrameHeaderButtonComponent'
import { ButtonIcons } from '../ButtonIcons'
import PicListComponent from '../components/PicListComponent'
import ViewerComponent from '../components/ViewerComponent'
import ComposerComponent from '../components/ComposerComponent'

type Message = { workbookName: string }

function emptyWorkbook(workbookName: string): WorkbookType {
    const now = Date.now()
    return {
        createdAt: now,
        focusedPicFilename: 'empty',
        pics: [{ createdAt: now, encodedImage: '', filename: 'empty', mimeType: '' }],
        prompts: [{ createdAt: now, focused: true, text: '' }],
        workbookName,
    }
}

export default function WorkbookFrame(props: FrameProps) {
    const { frameId, message } = props
    const msg = message as Message

    const [workbook, setWorkbook] = useState<WorkbookType>(() => emptyWorkbook(msg.workbookName))
    const [isLoading, setIsLoading] = useState(false)
    const [selectedPicFilename, setSelectedPicFilename] = useState('empty')
    const [leftPct, setLeftPct] = useState(30)
    const [topPct, setTopPct] = useState(60)

    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(
                    `/v1/workbooks/get-workbook?workbookName=${encodeURIComponent(msg.workbookName)}`,
                    { credentials: 'include' }
                )
                const data = await res.json()
                const hydrated = await hydrateFromBackend(data.workbook)
                const withPrompts = hydrated.prompts.length === 0
                    ? { ...hydrated, prompts: [{ createdAt: Date.now(), focused: true, text: '' }] }
                    : hydrated
                setWorkbook(withPrompts)
                setSelectedPicFilename(withPrompts.focusedPicFilename ?? 'empty')
            } catch (err) {
                console.error('Failed to load workbook:', err)
            }
        }
        load()
    }, [])

    function startHDrag(e: React.MouseEvent) {
        e.preventDefault()
        const startX = e.clientX
        const startPct = leftPct
        const totalW = containerRef.current?.offsetWidth ?? 1

        function onMove(ev: MouseEvent) {
            const dx = ev.clientX - startX
            setLeftPct(Math.max(10, Math.min(90, startPct + (dx / totalW) * 100)))
        }
        function onUp() {
            document.removeEventListener('mousemove', onMove)
            document.removeEventListener('mouseup', onUp)
        }
        document.addEventListener('mousemove', onMove)
        document.addEventListener('mouseup', onUp)
    }

    function startVDrag(e: React.MouseEvent) {
        e.preventDefault()
        const startY = e.clientY
        const startPct = topPct
        const totalH = containerRef.current?.offsetHeight ?? 1

        function onMove(ev: MouseEvent) {
            const dy = ev.clientY - startY
            setTopPct(Math.max(10, Math.min(90, startPct + (dy / totalH) * 100)))
        }
        function onUp() {
            document.removeEventListener('mousemove', onMove)
            document.removeEventListener('mouseup', onUp)
        }
        document.addEventListener('mousemove', onMove)
        document.addEventListener('mouseup', onUp)
    }

    const headerButtons = (
        <>
            <FrameHeaderButtonComponent
                icon={ButtonIcons.faRegCopy}
                tooltipLabel="Clone Workbook"
                handler={() => {
                    import('./PromptFrame').then(m => {
                        addFrame(m.default, {
                            message: {
                                prompt: 'Enter a name for the clone',
                                onOk: async (newWorkbookName: string) => {
                                    const res = await fetch('/v1/workbooks/clone-workbook', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        credentials: 'include',
                                        body: JSON.stringify({ workbook: stripForBackend(workbook), newWorkbookName }),
                                    })
                                    if (!res.ok) {
                                        const err = await res.json().catch(() => ({ error: res.statusText }))
                                        alert(`Clone failed: ${err.error}`)
                                        return
                                    }
                                    window.dispatchEvent(new CustomEvent('workbooks-changed'))
                                    const wf = await import('./WorkbookFrame')
                                    addFrame(wf.default, { message: { workbookName: newWorkbookName }, width: 1200, height: 800 })
                                },
                                onClose: () => {},
                            },
                            isModal: true,
                            width: 400,
                            height: 200,
                        })
                    })
                }}
            />
            <FrameHeaderButtonComponent
                icon={ButtonIcons.upload}
                tooltipLabel="Upload Image"
                handler={() => {
                    import('./UploadPicFrame').then(m => {
                        addFrame(m.default, {
                            message: {
                                workbookName: msg.workbookName,
                                onUploaded: async (returned: WorkbookType) => {
                                    const hydrated = await hydrateFromBackend(returned)
                                    setWorkbook(hydrated)
                                    setSelectedPicFilename(hydrated.focusedPicFilename ?? 'empty')
                                },
                            },
                            isModal: true,
                            width: 500,
                            height: 300,
                        })
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

    const ctx = { workbook, setWorkbook, isLoading, setIsLoading, selectedPicFilename, setSelectedPicFilename }

    return (
        <WorkbookContext.Provider value={ctx}>
            <Frame {...props} title={msg.workbookName} headerButtons={headerButtons}>
                <div ref={containerRef} style={{ display: 'flex', width: '100%', height: '100%' }}>
                    <div style={{ width: `${leftPct}%`, overflow: 'hidden' }}>
                        <PicListComponent />
                    </div>
                    <div
                        onMouseDown={startHDrag}
                        style={{ width: 5, background: '#444', cursor: 'ew-resize', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ height: `${topPct}%`, overflow: 'hidden' }}>
                            <ViewerComponent />
                        </div>
                        <div
                            onMouseDown={startVDrag}
                            style={{ height: 5, background: '#444', cursor: 'ns-resize', flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <ComposerComponent />
                        </div>
                    </div>
                </div>
            </Frame>
        </WorkbookContext.Provider>
    )
}
