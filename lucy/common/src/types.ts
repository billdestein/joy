export type UserType = {
    email: string
    slug: string
}

export type PicType = {
    createdAt: number
    encodedImage: string
    filename: string
    mimeType: string
}

export type PromptType = {
    createdAt: number
    focused: boolean
    text: string
}

export type WorkbookType = {
    createdAt: number
    focusedPicFilename: string
    pics: PicType[]
    prompts: PromptType[]
    workbookName: string
}
