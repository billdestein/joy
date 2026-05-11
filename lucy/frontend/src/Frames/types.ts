import React from 'react'

export type FrameProps = {
    frameId: number
    height: number
    isModal: boolean
    message: unknown
    width: number
    x: number
    y: number
    zIndex: number
}

export type FrameEntry = {
    component: React.ComponentType<FrameProps>
    props: FrameProps
}
