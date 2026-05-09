//----------------------------------------------------------------------------------------------------
// ComposerButtonRowComponent
//----------------------------------------------------------------------------------------------------
export const ComposerButtonRowComponent = `

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

The runPrompt function simply does alert('runPrompt')








`
