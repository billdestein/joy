//----------------------------------------------------------------------------------------------------
// UploadWorkbookApplet
//----------------------------------------------------------------------------------------------------
export const UploadWorkbookApplet = `

The UploadWorkbookApplet is an applet.  It's surrounding frame is a modal frame.

The UploadWorkbookApplet is implemented in the file lucy/frontend/src/UploadWorkbookApplet.

The applet shows the string "Upload"

The applet receives an `onClose: () => void` callback prop. It does not receive a frameId prop.
Calling onClose() removes the surrounding frame from the canvas.

The applet has a cancel button. The cancel button handler calls onClose().

`
