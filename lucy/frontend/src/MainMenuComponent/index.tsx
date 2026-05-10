import { canvas } from '../Frames'
import { ButtonIcons } from '../ButtonIcons'
import { WorkbookListApplet } from '../WorkbookListApplet'
import { GetWorkbookNameApplet } from '../GetWorkbookNameApplet'
import { UploadWorkbookApplet } from '../UploadWorkbookApplet'

export function MainMenuComponent() {
    function openWorkbooks() {
        const refreshRef = { current: async () => {} }

        canvas.addFrame({
            width: 640,
            height: 440,
            renderChild: () => <WorkbookListApplet refreshRef={refreshRef} />,
            getButtons: (onClose) => [
                {
                    icon: ButtonIcons.plus,
                    toolTipLabel: 'New Workbook',
                    handler: () => {
                        canvas.addFrame({
                            width: 400,
                            height: 220,
                            isModal: true,
                            renderChild: (modalOnClose) => (
                                <GetWorkbookNameApplet
                                    onOk={async (name) => {
                                        await fetch('/v1/workbooks/create-workbook', {
                                            method: 'POST',
                                            credentials: 'include',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ workbookName: name }),
                                        })
                                        await refreshRef.current()
                                    }}
                                    onClose={modalOnClose}
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
                            width: 400,
                            height: 300,
                            isModal: true,
                            renderChild: (modalOnClose) => (
                                <UploadWorkbookApplet
                                    onClose={async () => {
                                        await refreshRef.current()
                                        modalOnClose()
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
        <div style={{
            width: '100%',
            height: 40,
            background: '#0f1a24',
            borderBottom: '1px solid #2a3a50',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            flexShrink: 0,
            gap: 4,
        }}>
            <button
                onClick={openWorkbooks}
                style={{
                    padding: '4px 12px',
                    background: 'transparent',
                    border: '1px solid #2a3a50',
                    borderRadius: 4,
                    color: '#cce0ff',
                    fontSize: 13,
                    cursor: 'pointer',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#1a2533' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
            >
                Workbooks
            </button>
        </div>
    )
}
