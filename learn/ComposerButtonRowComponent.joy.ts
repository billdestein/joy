//----------------------------------------------------------------------------------------------------
// composerButtonRowComponent
//----------------------------------------------------------------------------------------------------
export const composerButtonRowComponent = `

The CompuserButtonRowComponent has two child components:  The paginator and the play button.

The paginator is a rectangular region centered in the ComposerButtonRowComponent.  
Left to right it has a 'previous button', {index}, 'of', {count}, 'next button'.

The previous button is:

{
    icon: ButtonIcons.previous
    toolTipLabel: 'Previous Prompt'
    Handler: previousButtonHandler (see details below)
}

The next button is:

{
    icon: ButtonIcons.next
    toolTipLabel: 'Next Prompt'
    Handler: nextButtonHandler (see details below)
}

{index} is one plus the index of the currently visible (focused) prompt within the workbook's
prompts.

{count} is the number of prompts in the workbook's prompts array.

The prevviousButtonHandler finds the focused prompt, marks it unfocused, finds the
previous prompt (if there is one), marks it focused, and rerenders.

The next ButtonHandler finds the focused prompt, marks it unfocused, finds the
next prompt (if there is one), marks it focused, and rerenders.

The 'play' button is:

{
    icon: ButtonIcons.play
    toolTipLabel: 'Run Prompt'
    Handler: runPromptHandler (see details below)
}

Some details on prompts, comments and commands:

- A prompt is free form text with a few exceptions.
- Lines beginning with '//' are comments.
- Comments are stripped from the prompt before sending the prompt to the backend.
- Lines beginning with '--' are commands.
- The '-- save as' command takes one argument -- the filename of the output image.
- The filename must be a valid Linux filename.
- If the filename has trailing punctuation, the trailing punctuation is removed from the filename
  before sending it to the backend.

The runButtonHandler function:

- Gets the prompt from the Monaco editor.
- Extracts the imageFilename from the "-- save as" command.
- If there is no "-- save as" command, uses PromptFrame with prompt "Enter a name for your new image"
- Creates a PromptType object and pushes it onto the workbook's array of prompts.
- Marks the new prompt as focused.  Marks all others as not focused.
- For each PicType in the workbook, sets the encodedImage to the empty string.
- The backend generates the image and writes it to the filesystem.
- The backend adds a PicType to the workbook's pics array.
- The API response includes a workbook.
- The workbook is passed to the Cache's refresh function.
- The refresh function pulls images from the backend that are referenced in the
  workbook but do not exist in the cache.
- The PicListComponent and the ViewerComponent are refreshed.
- A new empty prompt is pushed onto the workbook's array of prompts.
- The rightmost prompt is marked focused, all other prompts are marked not focused.
- The ComposerComponent is rerendered.

`
