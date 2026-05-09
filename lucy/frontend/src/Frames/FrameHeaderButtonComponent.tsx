import { useState } from 'react'
import { ButtonConfig } from './types'

interface Props extends ButtonConfig {}

export function FrameHeaderButtonComponent({ icon, toolTipLabel, handler }: Props) {
    const [hovered, setHovered] = useState(false)
    const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)

    function handleMouseEnter(e: React.MouseEvent<HTMLDivElement>) {
        setHovered(true)
        const rect = e.currentTarget.getBoundingClientRect()
        setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top })
    }

    function handleMouseLeave() {
        setHovered(false)
        setTooltipPos(null)
    }

    return (
        <div style={{ position: 'relative', display: 'inline-flex' }}>
            {tooltipPos && (
                <div style={{
                    position: 'fixed',
                    top: tooltipPos.y - 4,
                    left: tooltipPos.x,
                    transform: 'translate(-50%, -100%)',
                    background: '#333', color: '#fff',
                    padding: '2px 6px', borderRadius: 3, fontSize: 11, whiteSpace: 'nowrap',
                    pointerEvents: 'none', zIndex: 99999,
                }}>
                    {toolTipLabel}
                </div>
            )}
            <div
                onClick={handler}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{
                    width: 22, height: 22, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', borderRadius: 3, cursor: 'pointer',
                    background: hovered ? '#4a6080' : 'transparent', color: '#ccc',
                    fontSize: 14, flexShrink: 0,
                }}
            >
                {icon}
            </div>
        </div>
    )
}
