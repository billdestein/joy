import React from 'react'
import { WorkbookType } from '@billdestein/joy-common'
import { PicComponent } from '../PicComponent'

interface Props {
    workbook: WorkbookType
}

export function PicListComponent({ workbook }: Props) {
    return (
        <div style={{ height: '100%', overflowY: 'auto', background: '#1e1e1e' }}>
            {workbook.pics.map(pic => (
                <PicComponent key={pic.filename} name={pic.filename} />
            ))}
        </div>
    )
}
