import React, { useRef, useState } from 'react'
import Frame from '../Frame'
import { FrameProps, removeFrame } from '../canvas'
import { WorkbookType } from '@billdestein/joy-common'

type Message = {
    workbookName: string
    onUploaded: (workbook: WorkbookType) => void
}

export default function UploadPicFrame(props: FrameProps) {
    const { frameId, message } = props
    const msg = message as Message
    const [status, setStatus] = useState<'idle' | 'uploading' | 'error'>('idle')
    const [errorMsg, setErrorMsg] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    async function uploadFile(file: File) {
        setStatus('uploading')
        try {
            const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = e => resolve(e.target!.result as string)
                reader.onerror = reject
                reader.readAsDataURL(file)
            })
            const imageData = dataUrl.split(',')[1]
            const res = await fetch('/v1/workbooks/upload-pic', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ workbookName: msg.workbookName, imageFilename: file.name, imageData, mimeType: file.type }),
            })
            if (!res.ok) throw new Error((await res.json()).error)
            const data = await res.json()
            msg.onUploaded(data.workbook)
            removeFrame(frameId)
        } catch (err: any) {
            setStatus('error')
            setErrorMsg(err.message)
        }
    }

    async function uploadFromUrl(imageUrl: string) {
        setStatus('uploading')
        try {
            const url = new URL(imageUrl)
            const imageFilename = url.pathname.split('/').pop()?.split('?')[0] ?? 'image.jpg'
            const res = await fetch('/v1/workbooks/upload-pic-from-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ workbookName: msg.workbookName, imageUrl, imageFilename }),
            })
            if (!res.ok) throw new Error((await res.json()).error)
            const data = await res.json()
            msg.onUploaded(data.workbook)
            removeFrame(frameId)
        } catch (err: any) {
            setStatus('error')
            setErrorMsg(err.message)
        }
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault()
        if (e.dataTransfer.files.length > 0) {
            uploadFile(e.dataTransfer.files[0])
        } else {
            const url = e.dataTransfer.getData('text/uri-list')
            if (url) uploadFromUrl(url)
        }
    }

    return (
        <Frame {...props} title="Upload Image" isModal={true}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div
                    onDrop={handleDrop}
                    onDragOver={e => e.preventDefault()}
                    onClick={() => inputRef.current?.click()}
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        border: '2px dashed #555',
                        margin: 12,
                        borderRadius: 6,
                        color: '#888',
                        fontSize: 13,
                        gap: 8,
                    }}
                >
                    {status === 'uploading' ? (
                        <span>Uploading…</span>
                    ) : status === 'error' ? (
                        <span style={{ color: '#f48771' }}>{errorMsg}</span>
                    ) : (
                        <>
                            <span style={{ fontSize: 32 }}>↑</span>
                            <span>Drop an image or URL here</span>
                        </>
                    )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 12px 12px' }}>
                    <button
                        onClick={() => inputRef.current?.click()}
                        style={{ background: '#0078d4', border: 'none', color: '#fff', padding: '5px 14px', borderRadius: 3, cursor: 'pointer', fontSize: 13 }}
                    >
                        Browse
                    </button>
                </div>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f) }}
                />
            </div>
        </Frame>
    )
}
