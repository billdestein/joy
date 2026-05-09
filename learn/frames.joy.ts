//----------------------------------------------------------------------------------------------------
// frames
//----------------------------------------------------------------------------------------------------
export const frames = `

Frames is a Typescript library that implements a windowing system for React.

The idea is that we want to have a single main react app.  The main react has a div, 
usually a large div, that we call the canvas.  Within the canvas, we can have multiple 'Frames'.  
A frame is a div that can be dragged and resized through mouse gestures.  When there are two 
or more frames on the canvas, the frams can be stacked and restacked (using z-index).

Inside the frames library is a singleton called Canvas.  Canvas coordinates the 
frames within it.  Canvas has functions addFrame and removeFrame.  

Also inside the react-better-frames system is a React component called Frame.  
The Frame is a JSX parent and has children.  Those children form what is called an 'applet'.

The Frame has this layout:

- The applet div.
- Above the applet div is a header div that is 30 pixels high
- The header div is used as a grab bar for moving the frame.
- Around the applet and the header is a five-pixel border

Resizing and dragging are implemented by attaching onMouseMove and onMouseDown directly
to the outer frame div, not via separate handle divs.  Do not use hidden grab bar divs
inside the border — they are unreliable because z-index and pointer-event behavior inside
a flex container is unpredictable when the applet contains complex components like AG Grid.

Instead, onMouseMove computes the cursor dynamically based on how close the mouse is to
each edge of the frame (using getBoundingClientRect).  Use a detection zone of ~10px from
the outer frame edge.  onMouseDown uses the same geometry to decide whether to start a
resize (near an edge) or a drag (in the header area but not near an edge).  The header
area is defined as the top (border + header height) pixels of the frame.

The frame header contains zero or more right-aligned FrameHeaderButtonComponents.  

The Frame has these props:

- height: the initial height in pixels
- width: the initial width in pixels
- x: the initial x coordinate in pixels (relative to the top left corner of the canvas)
- y: the initial y coordinate in pixels (relative to the top left corner of the canvas)
- z-index: the initial z-index.  Z index values are unique and monotonically increasing.
- message: an opaque object passed from a parent frame to a child frame.
- isModal: a boolean that defaults to false.  Modal frames are explained below.
- frameId: an integer that uniquely identifies the frame.  The frameId is explained below
- An array of button objects.

The frameId is a monotonically increasing integer computed in the Canvas' addFrame function.
When it's time to remove the frame from the canvas, the frameId is passed to the canvas.removeFrame f
unction.

Modal frames are different from regular frames.  When the Canvas adds a new modal frame, it first adds 
a div into the DOM that we call the click catcher div.  The click catcher is translucent and covers the 
entire canvas.  The click catcher has a z-index one greater than the nearest frame.  Then the Canvas adds 
the modal frame centered in the canvas both horizontally and vertically.  The x and y props are ignored.  
The canvas.removeFrame removes both the modal frame and the click catcher.

All dragging, resizing and restacking is done through direct DOM manipulation.  We don't want mouse gestures on 
one Frame to cause React to rerender other frames.  Each frame keeps track if its own x, y, height, width and z-index.

The frame can only be moved up to the point where the top of the frame touches the top of the canvas.

When moving a frame left and right, they will be clipped by the canvas, but never revealing less than 40 pixels.

The frame can only be move down to the point where the bottom of the header touches the bottom of the canvas.

`