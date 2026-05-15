import React from 'react'
import Frame from '../Frame'
import { FrameProps } from '../canvas'

export default function UploadWorkbookFrame(props: FrameProps) {
    return (
        <Frame {...props} title="Upload Workbook" isModal={true}>
            <div style={{ padding: 16, color: '#ccc', fontSize: 13 }}>UploadWorkbookFrame</div>
        </Frame>
    )
}
