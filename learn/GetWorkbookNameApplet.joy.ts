//----------------------------------------------------------------------------------------------------
// GetWorkbookNameApplet
//----------------------------------------------------------------------------------------------------
export const GetWorkbookNameApplet = `

The WorkbookListApplet is an applet.  It's surrounding frame is a modal frame.

The GetWorkbookNameApplet is implemented in the file lucy/frontend/src/GetWorkbookNameApplet.

The applet has a text input field.

A string "Enter a name for the new workbook",

And an ok button and a cancel button.

The applet receives an 'onClose: () => void' callback prop. It does not receive a frameId prop.
Calling onClose() removes the surrounding frame from the canvas.

The ok button handler checks that the text area is not empty. If not empty, it calls the onOk callback
passing the value from the text input, then calls onClose().

The cancel button handler calls onClose().

`
