//----------------------------------------------------------------------------------------------------
// WorkbookApplet
//----------------------------------------------------------------------------------------------------
export const WorkbookApplet = `

The WorkbookApplet is an applet.  That means it's a React function component running as a React
child in a Frame component.

The WorkbookApplet is implemented in the file lucy/frontend/src/WorkbookApplet.

The surrounding frame has these three FrameHeaderButtonComponents:

{
    icon: ButtonIcons.close
    toolTipLabel: 'Close'
    Handler: Call Canvas.removeFrame
}

The applet viewport is split into two panes, left and right, by a five-pixel slider.
Initially, the left pane is 30% wide.

The right pane is split into two panes, top and bottom, by a five-pixel slider.
Initially, the top pane is 60% heigh.

The left pane contains an instance of the PicListComponent.

The upper right pane contains an instance of the ViewerComponent.

The lower right pane contains an instance of the ComposerComponent.

`
