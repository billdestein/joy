import React from 'react'

export type ButtonConfig = {
  icon: React.ReactNode
  toolTipLabel: string
  handler: () => void
}

export type FrameConfig = {
  height: number
  width: number
  x: number
  y: number
  isModal?: boolean
  message?: unknown
  buttons?: ButtonConfig[]
  children: React.ReactNode
}

export interface FrameEntry {
  frameId: number
  config: FrameConfig
  initialZ: number
  catcherZ?: number
}
