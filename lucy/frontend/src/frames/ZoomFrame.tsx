import React from 'react'
import Frame from '../Frame'
import { FrameProps, removeFrame } from '../canvas'
import FrameHeaderButtonComponent from '../components/FrameHeaderButtonComponent'
import { ButtonIcons } from '../ButtonIcons'

type Message = { encodedImage: string; mimeType: string }

export default function ZoomFrame(props: FrameProps) {
    const msg = props.message as Message
    const headerButtons = (
        <FrameHeaderButtonComponent icon={ButtonIcons.x} tooltipLabel="Close" handler={() => removeFrame(props.frameId)} />
    )
    return (
        <Frame {...props} title="Zoom" headerButtons={headerButtons}>
            <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                    src={`data:${msg.mimeType};base64,${msg.encodedImage}`}
                    alt="zoom"
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
            </div>
        </Frame>
    )
}
