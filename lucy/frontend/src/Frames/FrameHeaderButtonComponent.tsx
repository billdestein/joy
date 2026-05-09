import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { JSX } from 'react'

type Props = {
    icon: JSX.Element
    handler: () => void
    tooltipLabel: string
}

export default function FrameHeaderButtonComponent({ icon, handler, tooltipLabel }: Props) {
    const [hovered, setHovered] = useState(false)
    const btnRef = useRef<HTMLDivElement>(null)
    const [tipPos, setTipPos] = useState({ left: 0, top: 0 })

    return (
        <>
            <div
                ref={btnRef}
                data-frame-button="true"
                onClick={handler}
                onMouseEnter={() => {
                    if (btnRef.current) {
                        const r = btnRef.current.getBoundingClientRect()
                        setTipPos({ left: r.left + r.width / 2, top: r.top })
                    }
                    setHovered(true)
                }}
                onMouseLeave={() => setHovered(false)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px 5px',
                    borderRadius: 3,
                    cursor: 'pointer',
                    color: '#ccc',
                    background: hovered ? '#4a4a6a' : 'transparent',
                    transition: 'background 0.1s',
                }}
            >
                {icon}
            </div>
            {hovered && createPortal(
                <div style={{
                    position: 'fixed',
                    left: tipPos.left,
                    top: tipPos.top - 6,
                    transform: 'translate(-50%, -100%)',
                    background: '#333',
                    color: '#eee',
                    padding: '3px 8px',
                    borderRadius: 4,
                    fontSize: 12,
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    zIndex: 99999,
                }}>
                    {tooltipLabel}
                </div>,
                document.body
            )}
        </>
    )
}
