//----------------------------------------------------------------------------------------------------
// ComposerButtonComponent
//----------------------------------------------------------------------------------------------------
export const ComposerButtonComponent = `

ComposerButtonComponent is a React Component.  

Zerp or more ComposerButtonComponents may be placed, right aligned, in a ComposerButtonRowComponent.

The ComposerButtonComponent has these props:

- icon: an SVG icon from react-icons
- Handler: () => void
- Tooltip label: string

Each button has a tooltip.  On mouse over the icon, the tooltip immediately appears vertically 
above its corresponding icon.  The tooltip is positioned absolutely so that it can extend
 beyond the border of the frame.

When the mouse hovers over the button, the background color changes to something different
but complimentary.

`
