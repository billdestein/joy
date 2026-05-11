import React, { useState, useRef, useEffect } from 'react'

type Props = {
    icon: React.ReactNode
    handler: () => void
    tooltipLabel: string
}

export default function FrameHeaderButtonComponent({ icon, handler, tooltipLabel }: Props) {
    const [hovered, setHovered] = useState(false)
    const [showTooltip, setShowTooltip] = useState(false)
    const btnRef = useRef<HTMLButtonElement>(null)
    const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 })

    useEffect(() => {
        if (showTooltip && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect()
            setTooltipPos({
                top: rect.top - 28,
                left: rect.left + rect.width / 2,
            })
        }
    }, [showTooltip])

    return (
        <>
            <button
                ref={btnRef}
                onMouseEnter={() => { setHovered(true); setShowTooltip(true) }}
                onMouseLeave={() => { setHovered(false); setShowTooltip(false) }}
                onClick={handler}
                style={{
                    background: hovered ? '#3a3a5c' : 'transparent',
                    border: 'none',
                    color: '#ccc',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    borderRadius: '3px',
                }}
            >
                {icon}
            </button>
            {showTooltip && (
                <div
                    style={{
                        position: 'fixed',
                        top: tooltipPos.top,
                        left: tooltipPos.left,
                        transform: 'translateX(-50%)',
                        background: '#222',
                        color: '#eee',
                        padding: '2px 8px',
                        borderRadius: '3px',
                        fontSize: '11px',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        zIndex: 99999,
                    }}
                >
                    {tooltipLabel}
                </div>
            )}
        </>
    )
}
