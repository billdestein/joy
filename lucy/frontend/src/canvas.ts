import React from 'react'
import ReactDOM from 'react-dom/client'

export type FrameProps = {
    frameId: number
    height: number
    isModal: boolean
    message: any
    width: number
    x: number
    y: number
    zIndex: number
}

type FrameRecord = {
    frameId: number
    frameEl: HTMLDivElement
    root: ReactDOM.Root
    isModal: boolean
    clickCatcher?: HTMLDivElement
}

let canvasEl: HTMLDivElement | null = null
const frames: FrameRecord[] = []
let nextFrameId = 1
let highestZIndex = 10

export function initCanvas(el: HTMLDivElement): void {
    canvasEl = el
}

export function addFrame(
    Component: React.ComponentType<FrameProps>,
    partialProps: Partial<FrameProps> & { message?: any } = {}
): number {
    if (!canvasEl) throw new Error('Canvas not initialized')

    const frameId = nextFrameId++
    const width = partialProps.width ?? 800
    const height = partialProps.height ?? 600
    const isModal = partialProps.isModal ?? false
    const message = partialProps.message ?? {}

    let x: number
    let y: number

    if (isModal) {
        x = 0
        y = 0
    } else if (partialProps.x !== undefined && partialProps.y !== undefined) {
        x = partialProps.x
        y = partialProps.y
    } else if (frames.length > 0) {
        const last = frames[frames.length - 1]
        const lastOuter = last.frameEl.firstElementChild as HTMLDivElement | null
        const lastX = lastOuter ? parseInt(lastOuter.style.left) || 100 : 100
        const lastY = lastOuter ? parseInt(lastOuter.style.top) || 100 : 100
        x = lastX + 50
        y = lastY + 50
    } else {
        x = 100
        y = 100
    }

    let clickCatcher: HTMLDivElement | undefined

    if (isModal) {
        const zForCatcher = ++highestZIndex
        clickCatcher = document.createElement('div')
        clickCatcher.style.cssText = `position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.4);z-index:${zForCatcher};`
        canvasEl.appendChild(clickCatcher)
    }

    const zIndex = ++highestZIndex
    const frameEl = document.createElement('div')
    canvasEl.appendChild(frameEl)

    const root = ReactDOM.createRoot(frameEl)
    const props: FrameProps = { frameId, height, isModal, message, width, x, y, zIndex }
    root.render(React.createElement(Component, props))

    frames.push({ frameId, frameEl, root, isModal, clickCatcher })
    return frameId
}

export function removeFrame(frameId: number): void {
    const idx = frames.findIndex(f => f.frameId === frameId)
    if (idx === -1) return

    const record = frames[idx]
    record.root.unmount()
    record.frameEl.remove()
    if (record.clickCatcher) record.clickCatcher.remove()
    frames.splice(idx, 1)
}

export function bringToFront(frameId: number): void {
    const record = frames.find(f => f.frameId === frameId)
    if (!record) return
    const z = ++highestZIndex
    const outer = record.frameEl.firstElementChild as HTMLDivElement | null
    if (outer) outer.style.zIndex = String(z)
}
