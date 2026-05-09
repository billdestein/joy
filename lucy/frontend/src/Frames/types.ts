import React from 'react'

export interface ButtonConfig {
    icon: React.ReactNode
    toolTipLabel: string
    handler: () => void
}

export interface AddFrameConfig {
    width: number
    height: number
    x?: number
    y?: number
    isModal?: boolean
    renderChild: (onClose: () => void) => React.ReactNode
    getButtons?: (onClose: () => void) => ButtonConfig[]
}

export interface FrameEntry {
    frameId: number
    zIndex: number
    config: AddFrameConfig
    clickCatcherZIndex?: number
}
