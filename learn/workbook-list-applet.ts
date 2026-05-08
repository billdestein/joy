//----------------------------------------------------------------------------------------------------
// WorkbookListApplet
//----------------------------------------------------------------------------------------------------
export const WorkbookListApplet = `

The WorkbookListApplet is an applet.  That means it's a React function component running as a React
child in a Frame component.

The WorkbookListApplet is implemented in the file lucy/frontend/src/WorkbookListApplet.

At initialization, a WorkbookListWidget calls the list-workbooks endpoint on the backend servver.

The WorkbookListWidget has an AG Grid React that fills the frame body.  

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

The context menu has two choices.  Open and delete.  For now, the open callback function
simply logs 'open', and the delete callback function simply logs 'delete'

`
