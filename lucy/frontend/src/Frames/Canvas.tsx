import { useState, useRef, useEffect, useCallback, type RefObject } from 'react'
import type { FrameConfig, FrameEntry } from './types'
import Frame from './Frame'

type SetFrames = React.Dispatch<React.SetStateAction<FrameEntry[]>>

let _setFrames: SetFrames | null = null
let _nextFrameId = 1
let _nextZIndex = 100

export const canvas = {
    addFrame(config: FrameConfig): number {
        const frameId = _nextFrameId++
        let entry: FrameEntry
        if (config.isModal) {
            // Reserve two slots: click catcher gets z-index one greater than the
            // nearest (topmost) existing frame; modal sits one above that.
            const clickCatcherZ = _nextZIndex++
            const zIndex = _nextZIndex++
            entry = { ...config, frameId, zIndex, clickCatcherZ }
        } else {
            const zIndex = config.zIndex ?? _nextZIndex++
            entry = { ...config, frameId, zIndex }
        }
        _setFrames?.(prev => [...prev, entry])
        return frameId
    },

    removeFrame(frameId: number) {
        _setFrames?.(prev => prev.filter(f => f.frameId !== frameId))
    },
}

export function CanvasHost() {
    const [frames, setFrames] = useState<FrameEntry[]>([])
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        _setFrames = setFrames
        return () => { _setFrames = null }
    }, [])

    const onBringToFront = useCallback(() => _nextZIndex++, [])

    const regular = frames.filter(f => !f.isModal)
    const modals = frames.filter(f => f.isModal)

    return (
        <div
            ref={containerRef}
            style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}
        >
            {regular.map(entry => (
                <Frame
                    key={entry.frameId}
                    {...entry}
                    canvasRef={containerRef as RefObject<HTMLDivElement>}
                    onBringToFront={onBringToFront}
                />
            ))}
            {modals.length > 0 && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.45)',
                    zIndex: modals[0].clickCatcherZ,
                }} />
            )}
            {modals.map(entry => (
                <Frame
                    key={entry.frameId}
                    {...entry}
                    canvasRef={containerRef as RefObject<HTMLDivElement>}
                    onBringToFront={onBringToFront}
                />
            ))}
        </div>
    )
}
