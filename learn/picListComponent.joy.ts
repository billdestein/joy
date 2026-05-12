//----------------------------------------------------------------------------------------------------
// picListComponent
//----------------------------------------------------------------------------------------------------
export const picListComponent = `

PicListComponent takes no props.  It reads the workbook from WorkbookContext via
useWorkbook().

The PicListComponent iterates over the pics in the workbook.  For each pic,
a PicComponent is rendered.  The pic.filename is passed as the 'name' prop
of the PicComponent.

`
