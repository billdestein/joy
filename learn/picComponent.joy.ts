//----------------------------------------------------------------------------------------------------
// picComponent
//----------------------------------------------------------------------------------------------------
export const picComponent = `

PicComponent takes four props: name (string), focused (boolean), sentinel (boolean, optional), and onClick (() => void).

The name string is displayed in the component's viewport.

When focused is true, the row is highlighted (VS Code-style blue background, white text).
On hover when not focused, a subtle highlight is shown.
The cursor is a pointer.

When sentinel is true, the text is rendered in teal (#4ec9b0) and italic, with a bottom
border separating it from the real pics below it.

`
