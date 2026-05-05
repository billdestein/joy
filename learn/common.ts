//----------------------------------------------------------------------------------------------------
// common
//----------------------------------------------------------------------------------------------------
export const common = `

The common repo is used by both the frontend and backend repos.  It defines three types defined in the common repo.

The UserType has many workbooks.  A user is identified by a slug of its email address.  The slug is also the name of the user's root directory.

export type UserType = {
    email: string,
    slug: string,
    workbooks: WorkbookType[]
}

The PicType holds metadata for a single image.  It does not include the image payload.  The payload is stored in a file with name 'filename'.  When a new pic is generated, it is assigned filename 'unnamed'.  The rename-pic endpoint can be used to rename this pic before generating the next pic.

export type PicType = {
    createdAt: number
    filename: string
    mimeType: string
}

The PromptType holds a single Claude prompt.  In the UI, only a single prompt is visible at a time, and the 'focused' field indicates which prompt.  It's okay to have that in a common data type.

export type PromptType = {
  createdAt: number
  focused: boolean
  text: string
}

The WorkbookType has many pics and prompts.  WorkbookName is use as the the directory basename.

export type WorkbookType = {
    workbookName: string 
    pics: PicType[]
    prompts: PromptType[]
}

`
