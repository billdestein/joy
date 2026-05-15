import React, { useState, useRef } from 'react'

type Props = {
    icon: React.ReactNode
    handler: () => void
    tooltipLabel: string
}

export default function ComposerButtonComponent({ icon, handler, tooltipLabel }: Props) {
    const [hover, setHover] = useState(false)
    const [tipPos, setTipPos] = useState({ x: 0, y: 0 })
    const btnRef = useRef<HTMLButtonElement>(null)

    function onMouseEnter() {
        if (btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect()
            setTipPos({ x: rect.left + rect.width / 2, y: rect.bottom })
        }
        setHover(true)
    }

    return (
        <>
            <button
                ref={btnRef}
                onClick={handler}
                onMouseEnter={onMouseEnter}
                onMouseLeave={() => setHover(false)}
                style={{
                    background: hover ? '#3a3d41' : 'transparent',
                    border: 'none',
                    color: '#ccc',
                    cursor: 'pointer',
                    padding: '4px 6px',
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                {icon}
            </button>
            {hover && (
                <div
                    style={{
                        position: 'fixed',
                        left: tipPos.x,
                        top: tipPos.y + 4,
                        transform: 'translateX(-50%)',
                        background: '#252526',
                        color: '#ccc',
                        padding: '3px 8px',
                        borderRadius: 3,
                        fontSize: 12,
                        whiteSpace: 'nowrap',
                        border: '1px solid #555',
                        zIndex: 99999,
                        pointerEvents: 'none',
                    }}
                >
                    {tooltipLabel}
                </div>
            )}
        </>
    )
}
