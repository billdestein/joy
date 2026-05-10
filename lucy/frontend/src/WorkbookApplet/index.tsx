import { useRef, useState } from 'react'
import { PicListComponent } from '../PicListComponent'
import { ViewerComponent } from '../ViewerComponent'
import { ComposerComponent } from '../ComposerComponent'

interface Props {
    workbookName: string
}

export function WorkbookApplet({ workbookName }: Props) {
    const containerRef = useRef<HTMLDivElement>(null)
    const rightRef = useRef<HTMLDivElement>(null)
    const [encodedImage, setEncodedImage] = useState('')
    const [mimeType, setMimeType] = useState('image/png')

    function onImageGenerated(img: string, mime: string) {
        setEncodedImage(img)
        setMimeType(mime)
    }

    function startHorizDrag(e: React.MouseEvent) {
        e.preventDefault()
        const container = containerRef.current
        if (!container) return
        const onMove = (ev: MouseEvent) => {
            const rect = container.getBoundingClientRect()
            const pct = Math.max(10, Math.min(90, ((ev.clientX - rect.left) / rect.width) * 100))
            const left = container.querySelector<HTMLElement>('[data-pane="left"]')
            const right = container.querySelector<HTMLElement>('[data-pane="right"]')
            if (left) left.style.width = `${pct}%`
            if (right) right.style.width = `${100 - pct}%`
        }
        const onUp = () => {
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)
        }
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
    }

    function startVertDrag(e: React.MouseEvent) {
        e.preventDefault()
        const right = rightRef.current
        if (!right) return
        const onMove = (ev: MouseEvent) => {
            const rect = right.getBoundingClientRect()
            const pct = Math.max(10, Math.min(90, ((ev.clientY - rect.top) / rect.height) * 100))
            const top = right.querySelector<HTMLElement>('[data-pane="top"]')
            const bottom = right.querySelector<HTMLElement>('[data-pane="bottom"]')
            if (top) top.style.height = `${pct}%`
            if (bottom) bottom.style.height = `${100 - pct}%`
        }
        const onUp = () => {
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)
        }
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
    }

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', overflow: 'hidden' }}>
            <div data-pane="left" style={{ width: '30%', overflow: 'hidden', flexShrink: 0 }}>
                <PicListComponent />
            </div>
            <div
                onMouseDown={startHorizDrag}
                style={{ width: 5, cursor: 'col-resize', background: '#2a3a50', flexShrink: 0 }}
            />
            <div ref={rightRef} data-pane="right" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div data-pane="top" style={{ height: '60%', overflow: 'hidden', flexShrink: 0 }}>
                    <ViewerComponent encodedImage={encodedImage} mimeType={mimeType} />
                </div>
                <div
                    onMouseDown={startVertDrag}
                    style={{ height: 5, cursor: 'row-resize', background: '#2a3a50', flexShrink: 0 }}
                />
                <div data-pane="bottom" style={{ flex: 1, overflow: 'hidden' }}>
                    <ComposerComponent workbookName={workbookName} onImageGenerated={onImageGenerated} />
                </div>
            </div>
        </div>
    )
}
