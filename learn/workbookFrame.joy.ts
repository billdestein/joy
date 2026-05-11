//----------------------------------------------------------------------------------------------------
// workbookFrame
//----------------------------------------------------------------------------------------------------
export const workbookFrame = `

The WorkbookFrame is a React component that wraps Frame.

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
