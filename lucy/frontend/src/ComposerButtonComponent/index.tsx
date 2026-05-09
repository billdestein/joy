import { useState } from 'react'

interface Props {
    icon: React.ReactNode
    handler: () => void
    toolTipLabel: string
}

export function ComposerButtonComponent({ icon, handler, toolTipLabel }: Props) {
    const [hovered, setHovered] = useState(false)
    const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)

    function handleMouseEnter(e: React.MouseEvent<HTMLDivElement>) {
        setHovered(true)
        const rect = e.currentTarget.getBoundingClientRect()
        setTooltipPos({ x: rect.left + rect.width / 2, y: rect.bottom })
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
                    top: tooltipPos.y + 4,
                    left: tooltipPos.x,
                    transform: 'translateX(-50%)',
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
