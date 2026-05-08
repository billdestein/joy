import React from 'react'

export interface ButtonConfig {
    icon: React.ReactNode
    onClick: () => void
    tooltip: string
}

export interface FrameConfig {
    height: number
    width: number
    x: number
    y: number
    message?: object
    isModal?: boolean
    buttons?: ButtonConfig[]
}
