import React, { useState } from 'react'

type Props = {
    name: string
    focused: boolean
    sentinel?: boolean
    onClick: () => void
}

export default function PicComponent({ name, focused, sentinel, onClick }: Props) {
    const [hover, setHover] = useState(false)

    const bg = focused ? '#094771' : hover ? '#2a2d2e' : 'transparent'

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                padding: '4px 8px',
                cursor: 'pointer',
                background: bg,
                color: focused ? '#fff' : sentinel ? '#4ec9b0' : '#ccc',
                fontStyle: sentinel ? 'italic' : 'normal',
                fontSize: 13,
                userSelect: 'none',
                borderBottom: sentinel ? '1px solid #444' : undefined,
            }}
        >
            {name}
        </div>
    )
}
