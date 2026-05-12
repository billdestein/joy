//----------------------------------------------------------------------------------------------------
// composerButtonRowComponent
//----------------------------------------------------------------------------------------------------
export const composerButtonRowComponent = `

The ComposerButtonRowComponent contains three ComposerButtonComponent.  They are:

{
    icon: ButtonIcons.previous
    toolTipLabel: 'Previous Prompt'
    Handler: previousPrompt (see details below)
}

{
    icon: ButtonIcons.next
    toolTipLabel: 'Next Prompt'
    Handler: nextPrompt (see details below)
}

{
    icon: ButtonIcons.play
    toolTipLabel: 'Run Prompt'
    Handler: runPrompt (see details below)
}

The previousPrompt function simply does alert('previousPrompt')

The nextPrompt function simply does alert('nextPrompt')

Some details on prompts, comments and commands:

- A prompt is free form text with a few exceptions.
- Lines beginning with '//' are comments.
- Comments are stripped from the prompt before sending the prompt to the backend.
- Lines beginning with '--' are commands.
- The '-- save as' command takes one argument -- the filename of the output image.
- The filename must be a valid Linux filename.
- If the filename has trailing punctuation, the trailing punctuation is removed from the filename
  before sending it to the backend.

The runPrompt function:

- Gets the prompt from the Monaco editor.
- Extracts the imageFilename from the "-- save as" command.
- If there is no "-- save as" command, uses PromptFrame with prompt "Enter a name for your new image"
- Creates a PromptType object and pushes it onto the workbook's array of prompts.
- Marks the new prompt as focused.  Marks all others as not focused.
- Makes an API call to the backend's generate-pic endpoint, passing the workbook and the imageFilename.
- The backend generates the image and writes it to the filesystem.
- The backend adds a PicType to the workbook's pics array.
- The API response includes a workbook.
- The workbook is passed to the Cache's refresh function.
- The refresh function pulls images from the backend that are referenced in the
  workbook but do not exist in the cache.
- The PicListComponent and the ViewerComponent are refreshed.

`
