//----------------------------------------------------------------------------------------------------
// common
//----------------------------------------------------------------------------------------------------
export const common = `

The common repo is used by both the frontend and backend repos.  It defines the types below in the common repo.

The package name for the common repo is @billdestein/joy-common

A user is identified by a slug of its email address.  
The slug is also the name of the user's root directory.

export type UserType = {
    email: string,
    slug: string,
}

Refer to the Cache design for details on encodedImage.

export type PicType = {
    createdAt: number
    encodedImage: string
    filename: string
    mimeType: string
}

The PromptType holds a single Gemini prompt.  In the UI, only a single prompt is visible 
at a time, and the 'focused' field indicates which prompt.  It's okay to have that in a common data type.

export type PromptType = {
  createdAt: number
  focused: boolean
  text: string
}

The WorkbookType has many pics and prompts.  WorkbookName is use as the the directory basename.

export type WorkbookType = {
    createdAt: number
    pics: PicType[]
    prompts: PromptType[]
    workbookName: string 
}

`
