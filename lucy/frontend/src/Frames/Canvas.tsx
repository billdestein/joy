import React, { useState, useEffect, useRef } from 'react'
import { Frame, FrameProps } from './Frame'
import { FrameConfig } from './types'

interface FrameEntry {
    id: string
    props: Omit<FrameProps, 'canvasRef' | 'onBringToFront'>
    children: React.ReactNode
}

let _addFrame: ((entry: FrameEntry) => void) | null = null
let _removeFrame: ((id: string) => void) | null = null
let _bringToFront: ((id: string) => void) | null = null
let _canvasEl: HTMLDivElement | null = null
let _nextId = 1
let _nextZIndex = 1

export const Canvas = {
    add(config: FrameConfig, children: React.ReactNode): string {
        const id = String(_nextId++)
        let { x, y } = config

        if (config.isModal && _canvasEl) {
            const rect = _canvasEl.getBoundingClientRect()
            x = Math.max(0, (rect.width - config.width) / 2)
            y = Math.max(0, (rect.height - config.height) / 2)
        }

        const entry: FrameEntry = {
            id,
            props: { ...config, id, x, y, zIndex: _nextZIndex++ },
            children,
        }
        _addFrame?.(entry)
        return id
    },

    remove(id: string): void {
        _removeFrame?.(id)
    },
}

export function CanvasComponent() {
    const [frames, setFrames] = useState<FrameEntry[]>([])
    const canvasRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        _canvasEl = canvasRef.current

        _addFrame = entry => setFrames(prev => [...prev, entry])

        _removeFrame = id => setFrames(prev => prev.filter(f => f.id !== id))

        _bringToFront = id =>
            setFrames(prev => {
                const newZ = ++_nextZIndex
                return prev.map(f =>
                    f.id === id ? { ...f, props: { ...f.props, zIndex: newZ } } : f
                )
            })

        return () => {
            _addFrame = null
            _removeFrame = null
            _bringToFront = null
            _canvasEl = null
        }
    }, [])

    const hasModal = frames.some(f => f.props.isModal)

    return (
        <div
            ref={canvasRef}
            style={{ position: 'relative', flex: 1, overflow: 'hidden', background: '#000' }}
        >
            {hasModal && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: _nextZIndex - 1,
                    }}
                />
            )}
            {frames.map(frame => (
                <Frame
                    key={frame.id}
                    {...frame.props}
                    canvasRef={canvasRef}
                    onBringToFront={id => _bringToFront?.(id)}
                >
                    {frame.children}
                </Frame>
            ))}
        </div>
    )
}
