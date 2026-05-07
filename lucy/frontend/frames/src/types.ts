import type { ReactNode } from 'react'

export type FrameButton = {
    icon: ReactNode
    handler: () => void
    tooltip: string
}

export type FrameProps = {
    id: string
    height: number
    width: number
    x?: number
    y?: number
    zIndex?: number
    message?: unknown
    isModal?: boolean
    children?: ReactNode
    buttons?: FrameButton[]
}
