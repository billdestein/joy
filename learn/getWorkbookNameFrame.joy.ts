//----------------------------------------------------------------------------------------------------
// getWorkbookNameFrame
//----------------------------------------------------------------------------------------------------
export const getWorkbookNameFrame = `

The GetWorkbookNameFrame is a React component that wraps Frame.

The frame viewport has a text input field.

A string "Enter a name for the new workbook",

And an ok button and a cancel button.

The ok button validates the text in the text area. Valid text is text that can be used as a Linux file name.
If valid, it calls the onOk callback passing the value from the text input, then calls onClose().

The cancel button handler calls canvas removeFrame.
`
