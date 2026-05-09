import { canvas } from '../Frames'
import { ButtonIcons } from '../ButtonIcons'
import WorkbookListApplet from '../WorkbookListApplet'
import GetWorkbookNameApplet from '../GetWorkbookNameApplet'
import UploadWorkbookApplet from '../UploadWorkbookApplet'

export default function MainMenuComponent() {
    const handleWorkbooks = () => {
        let frameId: number
        const refreshRef: { current: (() => void) | null } = { current: null }

        const openNewWorkbook = () => {
            let modalId: number
            modalId = canvas.addFrame({
                isModal: true,
                width: 340,
                height: 150,
                x: 0,
                y: 0,
                children: (
                    <GetWorkbookNameApplet
                        onClose={() => canvas.removeFrame(modalId)}
                        onOk={(name) => {
                            fetch('/v1/workbooks/create-workbook', {
                                method: 'POST',
                                credentials: 'include',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ workbookName: name }),
                            })
                                .then(() => refreshRef.current?.())
                                .catch(console.error)
                        }}
                    />
                ),
            })
        }

        const openUploadWorkbook = () => {
            let modalId: number
            modalId = canvas.addFrame({
                isModal: true,
                width: 300,
                height: 140,
                x: 0,
                y: 0,
                children: (
                    <UploadWorkbookApplet
                        onClose={() => canvas.removeFrame(modalId)}
                        onComplete={() => refreshRef.current?.()}
                    />
                ),
            })
        }

        frameId = canvas.addFrame({
            width: 640,
            height: 420,
            x: 60,
            y: 60,
            buttons: [
                {
                    key: 'plus',
                    icon: ButtonIcons.plus,
                    tooltipLabel: 'New Workbook',
                    handler: openNewWorkbook,
                },
                {
                    key: 'upload',
                    icon: ButtonIcons.upload,
                    tooltipLabel: 'Add Workbook',
                    handler: openUploadWorkbook,
                },
                {
                    key: 'close',
                    icon: ButtonIcons.x,
                    tooltipLabel: 'Close',
                    handler: () => canvas.removeFrame(frameId),
                },
            ],
            children: (
                <WorkbookListApplet onReady={(fn) => { refreshRef.current = fn }} />
            ),
        })
    }

    return (
        <div style={{
            height: 40,
            background: '#1a1a1a',
            borderBottom: '1px solid #333',
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px',
            gap: 4,
            flexShrink: 0,
        }}>
            <MenuButton label="Workbooks" onClick={handleWorkbooks} />
        </div>
    )
}

function MenuButton({ label, onClick }: { label: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            style={{
                background: 'transparent',
                border: '1px solid #444',
                color: '#ccc',
                padding: '4px 12px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 13,
                fontFamily: 'sans-serif',
            }}
        >
            {label}
        </button>
    )
}
