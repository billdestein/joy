import { canvas } from '../Frames'
import { ButtonIcons } from '../ButtonIcons'
import WorkbookListApplet from '../WorkbookListApplet'

export default function MainMenuComponent() {
    const handleWorkbooks = () => {
        let frameId: number
        frameId = canvas.addFrame({
            width: 640,
            height: 420,
            x: 60,
            y: 60,
            buttons: [
                {
                    key: 'close',
                    icon: ButtonIcons.x,
                    tip: 'Close',
                    onClick: () => canvas.removeFrame(frameId),
                },
            ],
            children: <WorkbookListApplet />,
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
