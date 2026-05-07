import type { ReactNode } from 'react'

export type FrameProps = {
    height: number
    width: number
    x?: number
    y?: number
    zIndex?: number
    message?: unknown
    isModal?: boolean
    title?: string
    children?: ReactNode
}
