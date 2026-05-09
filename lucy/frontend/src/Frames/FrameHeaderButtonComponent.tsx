import { useState } from 'react'
import { ButtonConfig } from './types'

interface Props extends ButtonConfig {}

export function FrameHeaderButtonComponent({ icon, toolTipLabel, handler }: Props) {
    const [hovered, setHovered] = useState(false)
    const [tooltipVisible, setTooltipVisible] = useState(false)

    return (
        <div style={{ position: 'relative', display: 'inline-flex' }}>
            {tooltipVisible && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#333',
                        color: '#fff',
                        padding: '2px 6px',
                        borderRadius: 3,
                        fontSize: 11,
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        zIndex: 99999,
                        marginBottom: 4,
                    }}
                >
                    {toolTipLabel}
                </div>
            )}
            <div
                onClick={handler}
                onMouseEnter={() => { setHovered(true); setTooltipVisible(true) }}
                onMouseLeave={() => { setHovered(false); setTooltipVisible(false) }}
                style={{
                    width: 22,
                    height: 22,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 3,
                    cursor: 'pointer',
                    background: hovered ? '#4a6080' : 'transparent',
                    color: '#ccc',
                    fontSize: 14,
                    flexShrink: 0,
                }}
            >
                {icon}
            </div>
        </div>
    )
}
