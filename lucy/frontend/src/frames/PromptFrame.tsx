import React, { useState } from 'react'
import Frame from '../Frame'
import { FrameProps, removeFrame } from '../canvas'

type Message = {
    prompt: string
    onOk: (value: string) => void
    onClose: () => void
}

export default function PromptFrame(props: FrameProps) {
    const { frameId, message } = props
    const msg = message as Message
    const [value, setValue] = useState('')
    const [error, setError] = useState('')

    function isValidLinuxFilename(name: string): boolean {
        if (!name || name.length === 0) return false
        if (name.includes('/')) return false
        if (name.includes('\0')) return false
        return true
    }

    function handleOk() {
        if (!isValidLinuxFilename(value)) {
            setError('Invalid filename')
            return
        }
        msg.onOk(value)
        removeFrame(frameId)
    }

    function handleCancel() {
        msg.onClose()
        removeFrame(frameId)
    }

    return (
        <Frame {...props} title="Lucy" isModal={true}>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ color: '#ccc', fontSize: 13 }}>{msg.prompt}</div>
                <input
                    autoFocus
                    value={value}
                    onChange={e => { setValue(e.target.value); setError('') }}
                    onKeyDown={e => { if (e.key === 'Enter') handleOk() }}
                    style={{ background: '#3c3c3c', border: '1px solid #555', color: '#fff', padding: '6px 8px', borderRadius: 3, fontSize: 13, outline: 'none' }}
                />
                {error && <div style={{ color: '#f48771', fontSize: 12 }}>{error}</div>}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button
                        onClick={handleCancel}
                        style={{ background: '#3c3c3c', border: '1px solid #555', color: '#ccc', padding: '5px 12px', borderRadius: 3, cursor: 'pointer', fontSize: 13 }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleOk}
                        style={{ background: '#0078d4', border: 'none', color: '#fff', padding: '5px 12px', borderRadius: 3, cursor: 'pointer', fontSize: 13 }}
                    >
                        OK
                    </button>
                </div>
            </div>
        </Frame>
    )
}
