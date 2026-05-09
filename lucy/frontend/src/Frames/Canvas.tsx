import React, { useEffect, useRef, useState } from 'react'
import { FrameEntry, FrameConfig } from './types'
import { Frame } from './Frame'

let zCounter = 100

export function getNextZ(): number {
  return ++zCounter
}

export const canvasEl = { current: null as HTMLDivElement | null }

interface CanvasApi {
  addFrame(config: FrameConfig): number
  removeFrame(frameId: number): void
}

let canvasApi: CanvasApi | null = null

export const canvas = {
  addFrame(config: FrameConfig): number {
    if (!canvasApi) throw new Error('Canvas not mounted')
    return canvasApi.addFrame(config)
  },
  removeFrame(frameId: number): void {
    if (!canvasApi) throw new Error('Canvas not mounted')
    canvasApi.removeFrame(frameId)
  },
}

export function Canvas() {
  const [frames, setFrames] = useState<FrameEntry[]>([])
  const frameCounter = useRef(0)
  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    canvasEl.current = divRef.current

    canvasApi = {
      addFrame(config: FrameConfig): number {
        const frameId = ++frameCounter.current
        if (config.isModal) {
          const catcherZ = ++zCounter
          const frameZ = ++zCounter
          setFrames(prev => [...prev, { frameId, config, initialZ: frameZ, catcherZ }])
        } else {
          const frameZ = ++zCounter
          setFrames(prev => [...prev, { frameId, config, initialZ: frameZ }])
        }
        return frameId
      },
      removeFrame(frameId: number): void {
        setFrames(prev => prev.filter(f => f.frameId !== frameId))
      },
    }

    return () => {
      canvasApi = null
      canvasEl.current = null
    }
  }, [])

  return (
    <div
      ref={divRef}
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        background: '#222',
      }}
    >
      {frames.map(entry => (
        <React.Fragment key={entry.frameId}>
          {entry.catcherZ !== undefined && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: entry.catcherZ,
                background: 'rgba(0,0,0,0.4)',
              }}
            />
          )}
          <Frame entry={entry} />
        </React.Fragment>
      ))}
    </div>
  )
}
