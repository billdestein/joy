//----------------------------------------------------------------------------------------------------
// uploadPicFrame
//----------------------------------------------------------------------------------------------------
export const uploadPicFrame = `

The UploadPicFrame is a React component that wraps Frame.  It is opened as a modal
from WorkbookFrame.

It receives a message with two fields:
  - workbookName: string
  - onUploaded: (workbook: WorkbookType) => void

The viewport is a click-and-drop target.  Clicking opens a hidden file input (accept="image/*").
Dropping a file or selecting one from the file dialog triggers the upload.

On file selection:
  - Read the file with FileReader as a data URL.
  - Extract the base64 imageData (everything after the comma in the data URL).
  - POST to /v1/workbooks/upload-pic with { workbookName, imageFilename: file.name, imageData, mimeType: file.type }.
  - On success: call onUploaded(returnedWorkbook) and close the frame via canvas.removeFrame.
  - On error: display the error message in the viewport.

The viewport is split into a drop zone (flex: 1) and a button row at the bottom.

The drop zone shows an upload arrow and the text "Drop an image here" while idle.
While uploading, it shows "Uploading…".

The button row (right-aligned) contains:
- Browse: opens the hidden file input

`
