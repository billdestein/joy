//----------------------------------------------------------------------------------------------------
// workbookFrame
//----------------------------------------------------------------------------------------------------
export const workbookFrame = `

The WorkbookFrame is a React component that wraps Frame.

At initialization time, the WorkbookFrame creates a WorkbookType with no pics, and
a single prompt with text set to empty string.  The WorkbookFrame is the provider of
the WorkbookContext.  The workbook and its setter, along with isLoading and its setter,
are held in this context.  PicListComponent, ViewerComponent, and ComposerComponent
access the workbook through the context, not through props.

After loading the workbook from the backend, if the workbook has no prompts, the
WorkbookFrame adds a single empty focused prompt before storing it in context.  This
normalizes workbooks that were created before the backend was updated to include an
initial prompt.

The frame header has a single FrameHeaderButtonComponents:

{
    icon: ButtonIcons.x
    toolTipLabel: 'Close'
    Handler: Call Canvas.removeFrame
}

The frame viewport is split into two panes, left and right, by a five-pixel slider.
Initially, the left pane is 30% wide.

The right pane is split into two panes, top and bottom, by a five-pixel slider.
Initially, the top pane is 60% heigh.

The left pane contains an instance of the PicListComponent.

The upper right pane contains an instance of the ViewerComponent.

The lower right pane contains an instance of the ComposerComponent.

`
