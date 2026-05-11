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

The runPrompt function:

- A prompt is free form text with a few exceptions.
- Lines beginning with '//' are comments and should be stripped from the
  prompt by the runPrompt function.
- Lines beginning with '--' are commands.
- The '-- save as' command takes one argument -- the filename of the output image.
- The runPrompt function extracts the filename from the -- save as command if it exists.
- The runPrompt function removes any trailing punction from the filename if it exists.
- The runprompt function strips all commands from the prompt.
- if there is no filename at this point, the user is prompted for an image filename 
  using a modal frame.
- Finally, the runPrompt function makes an API call to the backend's generate-pic 
  endpoint, passing the workbook and the imageFilename.  

`
