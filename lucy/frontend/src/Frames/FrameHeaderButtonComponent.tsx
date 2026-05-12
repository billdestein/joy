import React, { useState, useRef } from 'react'

interface Props {
    icon: React.ReactNode
    handler: () => void
    tooltipLabel: string
}

export function FrameHeaderButtonComponent({ icon, handler, tooltipLabel }: Props) {
    const [showTooltip, setShowTooltip] = useState(false)
    const btnRef = useRef<HTMLButtonElement>(null)
    const [tooltipPos, setTooltipPos] = useState({ left: 0, top: 0 })

    function handleMouseEnter() {
        if (btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect()
            setTooltipPos({ left: rect.left + rect.width / 2, top: rect.top - 4 })
        }
        setShowTooltip(true)
    }

    return (
        <>
            <button
                ref={btnRef}
                onClick={handler}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setShowTooltip(false)}
                style={{
                    background: showTooltip ? '#444' : 'transparent',
                    border: 'none',
                    color: '#ccc',
                    cursor: 'pointer',
                    padding: '2px 6px',
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                {icon}
            </button>
            {showTooltip && (
                <div
                    style={{
                        position: 'fixed',
                        left: tooltipPos.left,
                        top: tooltipPos.top,
                        transform: 'translate(-50%, -100%)',
                        background: '#333',
                        color: '#eee',
                        padding: '3px 8px',
                        borderRadius: 3,
                        fontSize: 12,
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
