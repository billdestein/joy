import React from 'react'
import { canvas } from '../Frames'
import { WorkbookListApplet } from '../WorkbookListApplet'
import { GetWorkbookNameApplet } from '../GetWorkbookNameApplet'
import { UploadWorkbookApplet } from '../UploadWorkbookApplet'
import { ButtonIcons } from '../ButtonIcons'

export function MainMenuComponent() {
    function openWorkbooks() {
        const refreshRef: React.MutableRefObject<() => Promise<void>> = {
            current: async () => {},
        }

        canvas.addFrame({
            width: 700,
            height: 450,
            x: 60,
            y: 60,
            renderChild: (onClose) => (
                <WorkbookListApplet onClose={onClose} refreshRef={refreshRef} />
            ),
            getButtons: (onClose) => [
                {
                    icon: ButtonIcons.plus,
                    toolTipLabel: 'New Workbook',
                    handler: () => {
                        canvas.addFrame({
                            isModal: true,
                            width: 380,
                            height: 180,
                            renderChild: (innerClose) => (
                                <GetWorkbookNameApplet
                                    onClose={innerClose}
                                    onOk={async (name) => {
                                        await fetch('/v1/workbooks/create-workbook', {
                                            method: 'POST',
                                            credentials: 'include',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ workbookName: name }),
                                        })
                                        await refreshRef.current()
                                    }}
                                />
                            ),
                        })
                    },
                },
                {
                    icon: ButtonIcons.upload,
                    toolTipLabel: 'Add Workbook',
                    handler: () => {
                        canvas.addFrame({
                            isModal: true,
                            width: 400,
                            height: 250,
                            renderChild: (innerClose) => (
                                <UploadWorkbookApplet
                                    onClose={async () => {
                                        innerClose()
                                        await refreshRef.current()
                                    }}
                                />
                            ),
                        })
                    },
                },
                {
                    icon: ButtonIcons.close,
                    toolTipLabel: 'Close',
                    handler: onClose,
                },
            ],
        })
    }

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '4px 12px',
                background: '#1a2535',
                borderBottom: '1px solid #2a3a50',
                flexShrink: 0,
                gap: 8,
            }}
        >
            <button
                onClick={openWorkbooks}
                style={{
                    background: '#2a4060',
                    color: '#cce0ff',
                    border: '1px solid #3a5070',
                    borderRadius: 4,
                    padding: '4px 14px',
                    cursor: 'pointer',
                    fontSize: 13,
                }}
            >
                Workbooks
            </button>
        </div>
    )
}
