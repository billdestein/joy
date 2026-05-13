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

While idle, the viewport shows an upload arrow and the text "Click or drop an image to upload".
While uploading, the viewport shows "Uploading…".

`
