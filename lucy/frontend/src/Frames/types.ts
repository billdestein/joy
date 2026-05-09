import type { ReactNode, JSX, RefObject } from 'react'

export type Button = {
    icon: JSX.Element
    key: string
    onClick: () => void
    tip: string
}

export type FrameConfig = {
    children: ReactNode
    height: number
    width: number
    x: number
    y: number
    zIndex?: number
    message?: unknown
    isModal?: boolean
    buttons?: Button[]
}

export type FrameEntry = {
    frameId: number
    children: ReactNode
    height: number
    width: number
    x: number
    y: number
    zIndex: number
    clickCatcherZ?: number
    message?: unknown
    isModal?: boolean
    buttons?: Button[]
}

export type FrameProps = FrameEntry & {
    canvasRef: RefObject<HTMLDivElement>
    onBringToFront: () => number
}
