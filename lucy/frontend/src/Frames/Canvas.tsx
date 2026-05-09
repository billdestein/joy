import React, { useEffect, useState } from 'react'
import { AddFrameConfig, FrameEntry } from './types'
import { Frame } from './Frame'
import { getNextZIndex } from './zindex'

let frameCounter = 0
let _setFrames: React.Dispatch<React.SetStateAction<FrameEntry[]>> | null = null

export { getNextZIndex }

export const canvas = {
    addFrame(config: AddFrameConfig): number {
        const frameId = ++frameCounter
        _setFrames?.((prev) => {
            if (config.isModal) {
                const catcherZ = getNextZIndex()
                const modalZ = getNextZIndex()
                return [...prev, { frameId, zIndex: modalZ, config, clickCatcherZIndex: catcherZ }]
            }
            return [...prev, { frameId, zIndex: getNextZIndex(), config }]
        })
        return frameId
    },
    removeFrame(frameId: number): void {
        _setFrames?.((prev) => prev.filter((f) => f.frameId !== frameId))
    },
}

export function Canvas() {
    const [frames, setFrames] = useState<FrameEntry[]>([])

    useEffect(() => {
        _setFrames = setFrames
        return () => { _setFrames = null }
    }, [])

    return (
        <div style={{ position: 'relative', flex: 1, overflow: 'hidden', background: '#111820' }}>
            {frames.map((entry) => {
                const { frameId, zIndex, config, clickCatcherZIndex } = entry
                const onClose = () => canvas.removeFrame(frameId)
                const buttons = config.getButtons?.(onClose) ?? []
                return (
                    <React.Fragment key={frameId}>
                        {clickCatcherZIndex != null && (
                            <div style={{ position: 'absolute', inset: 0, zIndex: clickCatcherZIndex, background: 'rgba(0,0,0,0.4)', pointerEvents: 'all' }} />
                        )}
                        <Frame frameId={frameId} width={config.width} height={config.height} x={config.x ?? 100} y={config.y ?? 100} zIndex={zIndex} isModal={config.isModal ?? false} buttons={buttons}>
                            {config.renderChild(onClose)}
                        </Frame>
                    </React.Fragment>
                )
            })}
        </div>
    )
}
