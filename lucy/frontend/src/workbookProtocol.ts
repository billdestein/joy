import { WorkbookType } from '@billdestein/joy-common'
import { refresh } from './cache'

export function stripForBackend(workbook: WorkbookType): WorkbookType {
    return {
        ...workbook,
        pics: workbook.pics.map(p => ({ ...p, encodedImage: '' })),
    }
}

export async function hydrateFromBackend(workbook: WorkbookType): Promise<WorkbookType> {
    return refresh(workbook)
}
