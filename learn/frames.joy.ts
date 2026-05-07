//----------------------------------------------------------------------------------------------------
// frames
//----------------------------------------------------------------------------------------------------
export const frames = `

Frames is a Typescript library that implements a windowing system for React.

The idea is that we want to have a single main react app.  The main react has a div, 
usually a large div, that we call the canvas.  Within the canvas, we can have multiple 'Frames'.  
A frame is a div that can be dragged and resized through mouse gestures.  When there are two 
or more frames on the canvas, the frams can be stacked and restacked (using z-index).

Inside the react-better-frames system is a singleton called Canvas.  Canvas coordinates the 
frames within it.  Canvas has functions to add and remove frames.  

Inside the react-better-frames system is a React component called Frame.  
The Frame is a JSX parent and has children.  Those children form what is called an 'applet'.

The Frame has this layout:

- The applet div.
- Above the applet div is a header div that is 30 pixels high
- The header div is used as a grab bar for moving the frame.
- Around the applet and the header is a five-pixel border
- Hidden within  the border are eight hidden grab bars used for sizing: NW, N, NE, W, E, SW, S and SE.

The frame header contains zero or more right-aligned buttons.  Each button has a configurable 
svg icon, handler function, and tool tip label.

The Frame has these props:

- initial height in pixels
- initial width in pixels
- initial x coordinate in pixels (relative to the top left corner of the canvas)
- initial y coordinate in pixels (relative to the top left corner of the canvas)
- initial z-index.  Z index values are unique and monotonically increasing.
- a 'message' which is an opaque object passed from a parent frame to a child frame.
- isModal is a boolean that defaults to false.  
- id is the Canvas's unique id for the frame.  It is passed to the canvas when removing a frame. 
- An array of button objects.

When the Canvas adds a new modal frame, it first adds inserts a div into the dom that we call the click catcher div.  The click catcher is translucent and covers the entire canvas.  Then the Canvas adds the modal frame centered in the canvas both horizontally and vertically.  The x and y props are ignored.

All dragging, resizing and restacking is done through direct DOM manipulation.  We don't want mouse gestures on one Frame to cause React to rerender other frames.  Each frame keeps track if its own x, y, height, width and z-index.

The frame can only be moved up to the point where the top of the frame touches the top of the canvas.

When moving a frame left and right, they will be clipped by the canvas, but never revealing less than 40 pixels.

The frame can only be move down to the point where the bottom of the header touches the bottom of the canvas.

`