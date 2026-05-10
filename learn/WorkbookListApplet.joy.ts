//----------------------------------------------------------------------------------------------------
// WorkbookListApplet
//----------------------------------------------------------------------------------------------------
export const WorkbookListApplet = `

The WorkbookListApplet is an applet.  That means it's a React function component running as a React
child in a Frame component.

The WorkbookListApplet is implemented in the file lucy/frontend/src/WorkbookListApplet.

At initialization, a WorkbookListWidget calls the list-workbooks endpoint on the backend servver.

The WorkbookListWidget has an AG Grid React that fills the frame body.

Use ag-grid-community and ag-grid-react version ^30.0.0.
Import 'ag-grid-community/styles/ag-grid.css' and 'ag-grid-community/styles/ag-theme-alpine.css'.
Use className "ag-theme-alpine-dark" on the grid container div. Do NOT import a separate
ag-theme-alpine-dark.css file — the dark variant is a class defined within ag-theme-alpine.css.


The grid has one row for each workbook returned from the backend.

Each row has three columns

(1) name is string

(2) lastModifiedISO is the workbook's last modified timestamp as an ISO datetime string.

(3) lastModifiedAgo is the time since the workbook was last modified expressed as xxx days
ago, or xxx hours ago, or xxx minutes ago.

Columns 1 and 2 are sortable.  Column 3 is not.

Each row has a context menu.  The context menu is implemented from scratch.  It does not
use AG Grids context menu features.  When the user right clicks on a row, the context menu
pops up, with its uper left corner at the cursor position when the click event happened.

The context menu has two choices: Open and Delete.  For now the delete callback function
simply logs 'delete'.

Implement right-click detection using a native 'contextmenu' event listener attached to the
grid container div via useEffect — do not use AG Grid's onRowContextMenu or onCellContextMenu
props. In the handler, call preventDefault(), then walk up from event.target using
.closest('.ag-row') to find the row element, read its 'row-index' attribute, and call
gridApi.getDisplayedRowAtIndex(rowIndex) to get the row data. Store the grid API via
onGridReady.

The open callback function calls canvas.addFrame to add the WorkbookApplet.
The selected workbook name is passed as a prop to the WorkbookApplet.


The surrounding frame has these three FrameHeaderButtonComponents:  

{
    icon: ButtonIcons.plus
    toolTipLabel: 'New Workbook'
    Handler: addWorkbook (see details below)
}

{
    icon: ButtonIcons.upload
    toolTipLabel: 'Add Workbook'
    Handler: uploadWorkbook (see details below)
}

{
    icon: ButtonIcons.close
    toolTipLabel: 'Close'
    Handler: Call Canvas.removeFrame
}

The addNotebookNandler function creates an instance of the GetWorkbookNameApplet.  The
GetWorkbookNameApplet calls it's callback function with a name for the new workbook.
The callback function then makes an API call to the backend's create-workbook endpoint.


The uploaWorkbook function creates an instance of the UploadWorkbookApplet.  The 
UploadWorkbookApplet calls its callback function when complete.  The callback
function refreshes the grid.


`
