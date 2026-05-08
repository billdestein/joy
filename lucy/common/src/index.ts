export type UserType = {
    email: string
    slug: string
    workbooks: WorkbookType[]
}

export type PicType = {
    createdAt: number
    filename: string
    mimeType: string
}

export type PromptType = {
    createdAt: number
    focused: boolean
    text: string
}

export type WorkbookType = {
    workbookName: string
    pics: PicType[]
    prompts: PromptType[]
    lastModified?: number
}
