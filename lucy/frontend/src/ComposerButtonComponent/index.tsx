import { useState } from 'react'

interface Props {
    icon: React.ReactNode
    handler: () => void
    toolTipLabel: string
}

export function ComposerButtonComponent({ icon, handler, toolTipLabel }: Props) {
    const [hovered, setHovered] = useState(false)
    const [tooltipVisible, setTooltipVisible] = useState(false)

    return (
        <div style={{ position: 'relative', display: 'inline-flex' }}>
            {tooltipVisible && (
                <div style={{
                    position: 'absolute', bottom: '100%', left: '50%',
                    transform: 'translateX(-50%)', background: '#333', color: '#fff',
                    padding: '2px 6px', borderRadius: 3, fontSize: 11, whiteSpace: 'nowrap',
                    pointerEvents: 'none', zIndex: 99999, marginBottom: 4,
                }}>
                    {toolTipLabel}
                </div>
            )}
            <div
                onClick={handler}
                onMouseEnter={() => { setHovered(true); setTooltipVisible(true) }}
                onMouseLeave={() => { setHovered(false); setTooltipVisible(false) }}
                style={{
                    width: 28, height: 28, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', borderRadius: 4, cursor: 'pointer',
                    background: hovered ? '#2a4060' : 'transparent', color: '#cce0ff',
                    flexShrink: 0,
                }}
            >
                {icon}
            </div>
        </div>
    )
}
