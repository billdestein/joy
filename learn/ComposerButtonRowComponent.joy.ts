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

The runPrompt function gets the text from the MonacoEditor within the corresponding
ComposerEditorComponent.  It then creates a PromptType object and pushes that object
onto the workbook's array of prompts.  It marks the rightmost prompt as focused,
and all other prompts as not focused.  It makes an API call to the backend's
generate pic endpoint, passing the workbook.








`
