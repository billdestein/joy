import { get, set } from 'idb-keyval'
import { WorkbookType, PicType } from '@billdestein/joy-common'

function picKey(workbookName: string, pic: PicType): string {
    return `/workbook.${workbookName}/pic.${pic.filename}/pic.${pic.mimeType}/pic.${pic.createdAt}`
}

export async function refresh(workbook: WorkbookType): Promise<WorkbookType> {
    const hydratedPics = await Promise.all(
        workbook.pics.map(async (pic): Promise<PicType> => {
            if (pic.mimeType === '') return { ...pic, encodedImage: '' }
            if (pic.encodedImage) return pic

            const key = picKey(workbook.workbookName, pic)
            const cached = await get<string>(key)
            if (cached) return { ...pic, encodedImage: cached }

            const res = await fetch(
                `/v1/workbooks/get-pic?workbookName=${encodeURIComponent(workbook.workbookName)}&picFilename=${encodeURIComponent(pic.filename)}`,
                { credentials: 'include' }
            )
            const data = await res.json()
            const encodedImage: string = data.encodedImage
            await set(key, encodedImage)
            return { ...pic, encodedImage }
        })
    )
    return { ...workbook, pics: hydratedPics }
}
